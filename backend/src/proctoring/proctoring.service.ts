import { Injectable, Logger } from '@nestjs/common';
import { Prisma, ViolationType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProctoringService {
  private readonly logger = new Logger(ProctoringService.name);

  constructor(private prisma: PrismaService) {}

  async recordViolation(
    attemptId: string,
    userId: string,
    type: ViolationType,
    details?: string,
    screenshot?: string,
  ) {
    const violation = await this.prisma.violation.create({
      data: { attemptId, userId, type, details, screenshot },
    });

    this.logger.warn(
      `Violation recorded: ${type} for attempt ${attemptId}`,
    );

    return violation;
  }

  async recordProctoringEvent(
    attemptId: string,
    userId: string,
    eventType: string,
    eventData?: Record<string, unknown>,
    screenshotUrl?: string,
    webcamUrl?: string,
  ) {
    return this.prisma.proctoringLog.create({
      data: {
        attemptId,
        userId,
        eventType,
        eventData: (eventData || undefined) as Prisma.InputJsonValue,
        screenshotUrl,
        webcamUrl,
      },
    });
  }

  async getViolations(attemptId: string) {
    return this.prisma.violation.findMany({
      where: { attemptId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getTimeline(attemptId: string) {
    const [violations, logs] = await Promise.all([
      this.prisma.violation.findMany({
        where: { attemptId },
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.proctoringLog.findMany({
        where: { attemptId },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    const timeline = [
      ...violations.map((v) => ({
        type: 'violation' as const,
        eventType: v.type,
        details: v.details,
        screenshot: v.screenshot,
        timestamp: v.timestamp,
      })),
      ...logs.map((l) => ({
        type: 'log' as const,
        eventType: l.eventType,
        details: l.eventData,
        screenshot: l.screenshotUrl,
        timestamp: l.timestamp,
      })),
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return timeline;
  }

  async getViolationSummary(assessmentId: string) {
    const violations = await this.prisma.violation.findMany({
      where: { attempt: { assessmentId } },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    const summary = violations.reduce<Record<string, any>>(
      (acc, v) => {
        const key = v.userId;
        if (!acc[key]) {
          acc[key] = { user: v.user, violations: [], count: 0 };
        }
        acc[key].violations.push(v);
        acc[key].count++;
        return acc;
      },
      {},
    );

    return Object.values(summary);
  }
}
