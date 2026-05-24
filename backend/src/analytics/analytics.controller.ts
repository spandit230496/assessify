import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('assessment/:id')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.INTERVIEWER)
  @ApiOperation({ summary: 'Get assessment analytics' })
  async getAssessmentAnalytics(@Param('id') id: string) {
    return this.analyticsService.getAssessmentAnalytics(id);
  }

  @Get('candidate/report')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Get candidate report' })
  async getCandidateReport(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getCandidateReport(user.sub);
  }

  @Get('audit-logs')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getAuditLogs(page, limit);
  }
}
