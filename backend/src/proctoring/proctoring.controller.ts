import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role, ViolationType } from '@prisma/client';
import { ProctoringService } from './proctoring.service';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('proctoring')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('proctoring')
export class ProctoringController {
  constructor(private readonly proctoringService: ProctoringService) {}

  @Post('violation')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Record a proctoring violation' })
  async recordViolation(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      attemptId: string;
      type: ViolationType;
      details?: string;
      screenshot?: string;
    },
  ) {
    return this.proctoringService.recordViolation(
      body.attemptId,
      user.sub,
      body.type,
      body.details,
      body.screenshot,
    );
  }

  @Post('event')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Record a proctoring event' })
  async recordEvent(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      attemptId: string;
      eventType: string;
      eventData?: Record<string, unknown>;
      screenshotUrl?: string;
      webcamUrl?: string;
    },
  ) {
    return this.proctoringService.recordProctoringEvent(
      body.attemptId,
      user.sub,
      body.eventType,
      body.eventData,
      body.screenshotUrl,
      body.webcamUrl,
    );
  }

  @Get('violations/:attemptId')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.PROCTOR)
  @ApiOperation({ summary: 'Get violations for an attempt' })
  async getViolations(@Param('attemptId') attemptId: string) {
    return this.proctoringService.getViolations(attemptId);
  }

  @Get('timeline/:attemptId')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.PROCTOR)
  @ApiOperation({ summary: 'Get candidate activity timeline' })
  async getTimeline(@Param('attemptId') attemptId: string) {
    return this.proctoringService.getTimeline(attemptId);
  }

  @Get('summary/:assessmentId')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.PROCTOR)
  @ApiOperation({ summary: 'Get violation summary for an assessment' })
  async getSummary(@Param('assessmentId') assessmentId: string) {
    return this.proctoringService.getViolationSummary(assessmentId);
  }
}
