import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { AssessmentStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { InviteCandidateDto } from './dto/invite-candidate.dto';

@Injectable()
export class AssessmentsService {
  private readonly logger = new Logger(AssessmentsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssessmentDto, userId: string) {
    const assessment = await this.prisma.assessment.create({
      data: {
        ...dto,
        createdById: userId,
        sections: dto.sections
          ? {
              create: dto.sections.map((s, idx) => ({
                title: s.title,
                description: s.description,
                order: idx,
                duration: s.duration,
              })),
            }
          : undefined,
      },
      include: { sections: true },
    });

    this.logger.log(`Assessment created: ${assessment.id}`);
    return assessment;
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: AssessmentStatus,
    search?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [assessments, total] = await Promise.all([
      this.prisma.assessment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: {
            select: { invitations: true, attempts: true, sections: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.assessment.count({ where }),
    ]);

    return {
      data: assessments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            questions: {
              include: {
                options: true,
                codingConfig: true,
                testCases: { where: { isHidden: false } },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { invitations: true, attempts: true } },
      },
    });

    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }

  async update(id: string, dto: UpdateAssessmentDto, userId: string) {
    const assessment = await this.findById(id);
    if (assessment.createdById !== userId) {
      throw new ForbiddenException('Not authorized to update this assessment');
    }

    return this.prisma.assessment.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        totalDuration: dto.totalDuration,
        totalMarks: dto.totalMarks,
        passingPercentage: dto.passingPercentage,
        negativeMarking: dto.negativeMarking,
        negativeMarkValue: dto.negativeMarkValue,
        randomizeQuestions: dto.randomizeQuestions,
        randomizeOptions: dto.randomizeOptions,
        autoSubmit: dto.autoSubmit,
        webcamRequired: dto.webcamRequired,
        fullscreenRequired: dto.fullscreenRequired,
        tags: dto.tags,
      },
      include: { sections: true },
    });
  }

  async publish(id: string, userId: string) {
    const assessment = await this.findById(id);
    if (assessment.createdById !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.assessment.update({
      where: { id },
      data: { status: AssessmentStatus.PUBLISHED },
    });
  }

  async archive(id: string, userId: string) {
    const assessment = await this.findById(id);
    if (assessment.createdById !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.assessment.update({
      where: { id },
      data: { status: AssessmentStatus.ARCHIVED },
    });
  }

  async inviteCandidate(dto: InviteCandidateDto) {
    const invitation = await this.prisma.candidateInvitation.create({
      data: {
        assessmentId: dto.assessmentId,
        userId: dto.userId,
        expiresAt: new Date(dto.expiresAt),
      },
      include: {
        assessment: { select: { title: true } },
        user: { select: { email: true, firstName: true } },
      },
    });

    return invitation;
  }

  async getCandidateAssessments(userId: string) {
    const invitations = await this.prisma.candidateInvitation.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'ACCEPTED'] },
        expiresAt: { gt: new Date() },
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            description: true,
            totalDuration: true,
            totalMarks: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    return invitations;
  }

  async delete(id: string, userId: string) {
    const assessment = await this.findById(id);
    if (assessment.createdById !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.prisma.assessment.delete({ where: { id } });
    return { message: 'Assessment deleted' };
  }
}
