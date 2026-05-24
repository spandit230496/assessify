import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionDto) {
    const question = await this.prisma.question.create({
      data: {
        sectionId: dto.sectionId,
        type: dto.type,
        difficulty: dto.difficulty,
        title: dto.title,
        body: dto.body,
        explanation: dto.explanation,
        marks: dto.marks,
        negativeMarks: dto.negativeMarks || 0,
        timeLimitSeconds: dto.timeLimitSeconds,
        order: dto.order,
        tags: dto.tags || [],
        options: dto.options
          ? {
              create: dto.options.map((opt, idx) => ({
                text: opt.text,
                isCorrect: opt.isCorrect || false,
                order: idx,
                imageUrl: opt.imageUrl,
              })),
            }
          : undefined,
        codingConfig: dto.codingConfig
          ? {
              create: {
                languages: dto.codingConfig.languages,
                boilerplateCode: dto.codingConfig.boilerplateCode,
                solutionCode: dto.codingConfig.solutionCode,
                timeLimitMs: dto.codingConfig.timeLimitMs || 5000,
                memoryLimitMb: dto.codingConfig.memoryLimitMb || 256,
              },
            }
          : undefined,
        testCases: dto.testCases
          ? {
              create: dto.testCases.map((tc, idx) => ({
                input: tc.input,
                expected: tc.expected,
                isHidden: tc.isHidden || false,
                order: idx,
                weight: tc.weight || 1,
              })),
            }
          : undefined,
      },
      include: {
        options: true,
        codingConfig: true,
        testCases: true,
      },
    });

    this.logger.log(`Question created: ${question.id}`);
    return question;
  }

  async findBySectionId(sectionId: string) {
    return this.prisma.question.findMany({
      where: { sectionId },
      include: {
        options: { orderBy: { order: 'asc' } },
        codingConfig: true,
        testCases: { where: { isHidden: false }, orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        options: { orderBy: { order: 'asc' } },
        codingConfig: true,
        testCases: { orderBy: { order: 'asc' } },
      },
    });

    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async update(id: string, dto: UpdateQuestionDto) {
    await this.findById(id);
    return this.prisma.question.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body,
        explanation: dto.explanation,
        marks: dto.marks,
        difficulty: dto.difficulty,
        timeLimitSeconds: dto.timeLimitSeconds,
        tags: dto.tags,
      },
      include: {
        options: true,
        codingConfig: true,
        testCases: true,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.question.delete({ where: { id } });
    return { message: 'Question deleted' };
  }
}
