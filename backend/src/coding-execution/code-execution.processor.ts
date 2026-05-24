import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface ExecuteJobData {
  executionId: string;
  language: string;
  sourceCode: string;
  input?: string;
  timeLimitMs: number;
  memoryLimitMb: number;
}

interface TestCaseJobData extends ExecuteJobData {
  testCases: Array<{
    input: string;
    expected: string;
    weight: number;
  }>;
}

const LANGUAGE_CONFIG: Record<
  string,
  { ext: string; compile?: string; run: string; image: string }
> = {
  python: {
    ext: 'py',
    run: 'python3 solution.py',
    image: 'python:3.12-slim',
  },
  javascript: {
    ext: 'js',
    run: 'node solution.js',
    image: 'node:20-slim',
  },
  java: {
    ext: 'java',
    compile: 'javac Solution.java',
    run: 'java Solution',
    image: 'openjdk:21-slim',
  },
  cpp: {
    ext: 'cpp',
    compile: 'g++ -o solution solution.cpp',
    run: './solution',
    image: 'gcc:13-bookworm',
  },
  go: {
    ext: 'go',
    run: 'go run solution.go',
    image: 'golang:1.22-alpine',
  },
};

@Processor('code-execution')
export class CodeExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(CodeExecutionProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<ExecuteJobData | TestCaseJobData>) {
    const { name, data } = job;

    try {
      if (name === 'execute') {
        await this.handleExecute(data as ExecuteJobData);
      } else if (name === 'run-tests') {
        await this.handleRunTests(data as TestCaseJobData);
      }
    } catch (error) {
      this.logger.error(`Job ${name} failed:`, error);
      await this.prisma.codeExecution.update({
        where: { id: data.executionId },
        data: { status: 'FAILED', stderr: String(error) },
      });
    }
  }

  private async handleExecute(data: ExecuteJobData) {
    const config = LANGUAGE_CONFIG[data.language];
    if (!config) {
      throw new Error(`Unsupported language: ${data.language}`);
    }

    await this.prisma.codeExecution.update({
      where: { id: data.executionId },
      data: { status: 'RUNNING' },
    });

    const sandboxDir = join('/tmp', `exec-${uuidv4()}`);
    mkdirSync(sandboxDir, { recursive: true });

    const filename = data.language === 'java' ? `Solution.${config.ext}` : `solution.${config.ext}`;
    writeFileSync(join(sandboxDir, filename), data.sourceCode);
    if (data.input) {
      writeFileSync(join(sandboxDir, 'input.txt'), data.input);
    }

    try {
      const startTime = Date.now();
      const inputRedirect = data.input ? '< input.txt' : '';
      const compileCmd = config.compile ? `${config.compile} && ` : '';
      const cmd = `cd ${sandboxDir} && ${compileCmd}timeout ${data.timeLimitMs / 1000} ${config.run} ${inputRedirect}`;

      const output = execSync(cmd, {
        timeout: data.timeLimitMs + 1000,
        maxBuffer: 1024 * 1024,
        encoding: 'utf-8',
      });

      const executionTime = Date.now() - startTime;

      await this.prisma.codeExecution.update({
        where: { id: data.executionId },
        data: {
          status: 'COMPLETED',
          output: output.trim(),
          exitCode: 0,
          executionTimeMs: executionTime,
        },
      });
    } catch (error: unknown) {
      const execError = error as {
        status?: number;
        stderr?: string;
        stdout?: string;
      };
      const isTimeout = execError.status === 124;
      await this.prisma.codeExecution.update({
        where: { id: data.executionId },
        data: {
          status: isTimeout ? 'TIMEOUT' : 'FAILED',
          stderr: String(execError.stderr || ''),
          output: String(execError.stdout || ''),
          exitCode: execError.status || 1,
        },
      });
    } finally {
      rmSync(sandboxDir, { recursive: true, force: true });
    }
  }

  private async handleRunTests(data: TestCaseJobData) {
    let passed = 0;
    for (const tc of data.testCases) {
      try {
        const sandboxDir = join('/tmp', `exec-${uuidv4()}`);
        mkdirSync(sandboxDir, { recursive: true });

        const config = LANGUAGE_CONFIG[data.language];
        if (!config) throw new Error(`Unsupported language: ${data.language}`);

        const filename =
          data.language === 'java' ? `Solution.${config.ext}` : `solution.${config.ext}`;
        writeFileSync(join(sandboxDir, filename), data.sourceCode);
        writeFileSync(join(sandboxDir, 'input.txt'), tc.input);

        const compileCmd = config.compile ? `${config.compile} && ` : '';
        const cmd = `cd ${sandboxDir} && ${compileCmd}timeout ${data.timeLimitMs / 1000} ${config.run} < input.txt`;

        const output = execSync(cmd, {
          timeout: data.timeLimitMs + 1000,
          maxBuffer: 1024 * 1024,
          encoding: 'utf-8',
        });

        if (output.trim() === tc.expected.trim()) {
          passed++;
        }

        rmSync(sandboxDir, { recursive: true, force: true });
      } catch {
        // test case failed
      }
    }

    await this.prisma.codeExecution.update({
      where: { id: data.executionId },
      data: {
        status: 'COMPLETED',
        testCasesPassed: passed,
        testCasesTotal: data.testCases.length,
      },
    });
  }
}
