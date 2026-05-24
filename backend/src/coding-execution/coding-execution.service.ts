import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';

@Injectable()
export class CodingExecutionService {
  private readonly logger = new Logger(CodingExecutionService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('code-execution') private codeQueue: Queue,
  ) {}

  async executeCode(dto: ExecuteCodeDto) {
    const execution = await this.prisma.codeExecution.create({
      data: {
        attemptId: dto.attemptId,
        language: dto.language,
        sourceCode: dto.sourceCode,
        input: dto.input,
        status: 'QUEUED',
      },
    });

    await this.codeQueue.add(
      'execute',
      {
        executionId: execution.id,
        language: dto.language,
        sourceCode: dto.sourceCode,
        input: dto.input,
        timeLimitMs: dto.timeLimitMs || 5000,
        memoryLimitMb: dto.memoryLimitMb || 256,
      },
      {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Code execution queued: ${execution.id}`);
    return execution;
  }

  async runTestCases(dto: ExecuteCodeDto, questionId: string) {
    const testCases = await this.prisma.testCase.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });

    const execution = await this.prisma.codeExecution.create({
      data: {
        attemptId: dto.attemptId,
        language: dto.language,
        sourceCode: dto.sourceCode,
        status: 'QUEUED',
        testCasesTotal: testCases.length,
      },
    });

    await this.codeQueue.add(
      'run-tests',
      {
        executionId: execution.id,
        language: dto.language,
        sourceCode: dto.sourceCode,
        testCases: testCases.map((tc) => ({
          input: tc.input,
          expected: tc.expected,
          weight: tc.weight,
        })),
        timeLimitMs: dto.timeLimitMs || 5000,
        memoryLimitMb: dto.memoryLimitMb || 256,
      },
      {
        attempts: 1,
        removeOnComplete: true,
      },
    );

    return execution;
  }

  async getExecution(executionId: string) {
    return this.prisma.codeExecution.findUnique({
      where: { id: executionId },
    });
  }

  async getExecutionsByAttempt(attemptId: string) {
    return this.prisma.codeExecution.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
