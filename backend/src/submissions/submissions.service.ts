import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AttemptStatus, AnswerStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(private prisma: PrismaService) {}

  async startAttempt(
    assessmentId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const existing = await this.prisma.assessmentAttempt.findUnique({
      where: { assessmentId_userId: { assessmentId, userId } },
    });

    if (existing && existing.status !== AttemptStatus.NOT_STARTED) {
      if (existing.status === AttemptStatus.IN_PROGRESS) {
        return existing;
      }
      throw new BadRequestException('Assessment already completed');
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        sections: {
          include: {
            questions: { select: { id: true } },
          },
        },
      },
    });

    if (!assessment) throw new NotFoundException('Assessment not found');

    const attempt = await this.prisma.assessmentAttempt.upsert({
      where: { assessmentId_userId: { assessmentId, userId } },
      create: {
        assessmentId,
        userId,
        status: AttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
        maxScore: assessment.totalMarks,
        ipAddress,
        userAgent,
      },
      update: {
        status: AttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
        ipAddress,
        userAgent,
      },
    });

    const questionIds = assessment.sections.flatMap((s) =>
      s.questions.map((q) => q.id),
    );

    await this.prisma.answer.createMany({
      data: questionIds.map((qId) => ({
        attemptId: attempt.id,
        questionId: qId,
        status: AnswerStatus.NOT_VISITED,
        selectedOptionIds: [],
      })),
      skipDuplicates: true,
    });

    return attempt;
  }

  async submitAnswer(attemptId: string, dto: SubmitAnswerDto) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Invalid attempt');
    }

    const answer = await this.prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId: dto.questionId,
        },
      },
      create: {
        attemptId,
        questionId: dto.questionId,
        status: dto.status || AnswerStatus.ANSWERED,
        selectedOptionIds: dto.selectedOptionIds || [],
        textAnswer: dto.textAnswer,
        codeAnswer: dto.codeAnswer as Prisma.InputJsonValue,
        timeTakenSeconds: dto.timeTakenSeconds || 0,
      },
      update: {
        status: dto.status || AnswerStatus.ANSWERED,
        selectedOptionIds: dto.selectedOptionIds || [],
        textAnswer: dto.textAnswer,
        codeAnswer: dto.codeAnswer as Prisma.InputJsonValue,
        timeTakenSeconds: dto.timeTakenSeconds || 0,
      },
    });

    return answer;
  }

  async markForReview(attemptId: string, questionId: string) {
    return this.prisma.answer.update({
      where: { attemptId_questionId: { attemptId, questionId } },
      data: { status: AnswerStatus.MARKED_FOR_REVIEW },
    });
  }

  async submitAssessment(attemptId: string) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: { include: { options: true } },
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');

    let totalScore = 0;
    for (const answer of attempt.answers) {
      const question = answer.question;
      let score = 0;

      if (
        question.type === 'MCQ' ||
        question.type === 'TRUE_FALSE'
      ) {
        const correctOptions = question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);
        const isCorrect =
          answer.selectedOptionIds.length === correctOptions.length &&
          answer.selectedOptionIds.every((id) => correctOptions.includes(id));

        score = isCorrect ? question.marks : -question.negativeMarks;
        await this.prisma.answer.update({
          where: { id: answer.id },
          data: { score, isCorrect },
        });
      } else if (question.type === 'MSQ') {
        const correctOptions = question.options
          .filter((o) => o.isCorrect)
          .map((o) => o.id);
        const correctSelected = answer.selectedOptionIds.filter((id) =>
          correctOptions.includes(id),
        );
        score =
          (correctSelected.length / correctOptions.length) * question.marks;
        await this.prisma.answer.update({
          where: { id: answer.id },
          data: {
            score,
            isCorrect: correctSelected.length === correctOptions.length,
          },
        });
      }

      totalScore += score;
    }

    const percentage =
      attempt.maxScore > 0 ? (totalScore / attempt.maxScore) * 100 : 0;

    const now = new Date();
    const timeSpent = attempt.startedAt
      ? Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000)
      : 0;

    const result = await this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.SUBMITTED,
        submittedAt: now,
        totalScore: Math.max(0, totalScore),
        percentage,
        timeSpentSeconds: timeSpent,
      },
    });

    this.logger.log(`Assessment submitted: ${attemptId}, score: ${totalScore}`);
    return result;
  }

  async autoSubmit(attemptId: string) {
    return this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.AUTO_SUBMITTED,
        submittedAt: new Date(),
      },
    });
  }

  async getAttemptDetails(attemptId: string) {
    return this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
        assessment: true,
        violations: true,
      },
    });
  }

  async getResults(assessmentId: string) {
    return this.prisma.assessmentAttempt.findMany({
      where: { assessmentId, status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { totalScore: 'desc' },
    });
  }

  async getNavigationState(attemptId: string) {
    const answers = await this.prisma.answer.findMany({
      where: { attemptId },
      select: {
        questionId: true,
        status: true,
      },
    });

    return answers;
  }
}
