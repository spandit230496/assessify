import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { SubmissionsService } from './submissions.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('submissions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('start/:assessmentId')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Start assessment attempt' })
  async startAttempt(
    @Param('assessmentId') assessmentId: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.submissionsService.startAttempt(
      assessmentId,
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':attemptId/answer')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Submit answer for a question' })
  async submitAnswer(@Param('attemptId') attemptId: string, @Body() dto: SubmitAnswerDto) {
    return this.submissionsService.submitAnswer(attemptId, dto);
  }

  @Patch(':attemptId/review/:questionId')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Mark question for review' })
  async markForReview(
    @Param('attemptId') attemptId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.submissionsService.markForReview(attemptId, questionId);
  }

  @Post(':attemptId/submit')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Submit assessment' })
  async submitAssessment(@Param('attemptId') attemptId: string) {
    return this.submissionsService.submitAssessment(attemptId);
  }

  @Get(':attemptId')
  @ApiOperation({ summary: 'Get attempt details' })
  async getAttemptDetails(@Param('attemptId') attemptId: string) {
    return this.submissionsService.getAttemptDetails(attemptId);
  }

  @Get(':attemptId/navigation')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Get question navigation state' })
  async getNavigation(@Param('attemptId') attemptId: string) {
    return this.submissionsService.getNavigationState(attemptId);
  }

  @Get('results/:assessmentId')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.INTERVIEWER)
  @ApiOperation({ summary: 'Get assessment results/leaderboard' })
  async getResults(@Param('assessmentId') assessmentId: string) {
    return this.submissionsService.getResults(assessmentId);
  }
}
