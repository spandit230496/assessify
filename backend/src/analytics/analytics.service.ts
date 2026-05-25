import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalAssessments,
      totalAttempts,
      completedAttempts,
      avgScore,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.assessment.count(),
      this.prisma.assessmentAttempt.count(),
      this.prisma.assessmentAttempt.count({
        where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
      }),
      this.prisma.assessmentAttempt.aggregate({
        _avg: { percentage: true },
        where: { status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
      }),
    ]);

    return {
      totalUsers,
      totalAssessments,
      totalAttempts,
      completedAttempts,
      completionRate:
        totalAttempts > 0
          ? ((completedAttempts / totalAttempts) * 100).toFixed(1)
          : 0,
      averageScore: avgScore._avg.percentage?.toFixed(1) || 0,
    };
  }

  async getAssessmentAnalytics(assessmentId: string) {
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] },
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { totalScore: 'desc' },
    });

    const scores = attempts.map((a) => a.percentage);
    const avgScore = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    const maxScore = scores.length ? Math.max(...scores) : 0;
    const minScore = scores.length ? Math.min(...scores) : 0;

    const avgTimeSpent = attempts.length
      ? attempts.reduce((a, b) => a + b.timeSpentSeconds, 0) / attempts.length
      : 0;

    return {
      totalAttempts: attempts.length,
      averageScore: avgScore.toFixed(1),
      maxScore: maxScore.toFixed(1),
      minScore: minScore.toFixed(1),
      averageTimeSpentMinutes: (avgTimeSpent / 60).toFixed(1),
      leaderboard: attempts.map((a, idx) => ({
        rank: idx + 1,
        user: a.user,
        score: a.totalScore,
        percentage: a.percentage,
        timeSpent: a.timeSpentSeconds,
        submittedAt: a.submittedAt,
      })),
      scoreDistribution: {
        '0-20': scores.filter((s) => s <= 20).length,
        '21-40': scores.filter((s) => s > 20 && s <= 40).length,
        '41-60': scores.filter((s) => s > 40 && s <= 60).length,
        '61-80': scores.filter((s) => s > 60 && s <= 80).length,
        '81-100': scores.filter((s) => s > 80).length,
      },
    };
  }

  async getCandidateReport(userId: string) {
    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, status: { in: ['SUBMITTED', 'AUTO_SUBMITTED'] } },
      include: {
        assessment: {
          select: { title: true, totalMarks: true, totalDuration: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return {
      totalAttempts: attempts.length,
      results: attempts.map((a) => ({
        assessmentTitle: a.assessment.title,
        score: a.totalScore,
        maxScore: a.maxScore,
        percentage: a.percentage,
        timeSpent: a.timeSpentSeconds,
        submittedAt: a.submittedAt,
      })),
    };
  }

  async getAuditLogs(page = 1, limit = 50) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
