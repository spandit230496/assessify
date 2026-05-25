import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssessmentStatus, Role } from '@prisma/client';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { InviteCandidateDto } from './dto/invite-candidate.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('assessments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Create a new assessment' })
  async create(
    @Body() dto: CreateAssessmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.assessmentsService.create(dto, user.sub);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.INTERVIEWER)
  @ApiOperation({ summary: 'List all assessments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AssessmentStatus })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: AssessmentStatus,
    @Query('search') search?: string,
  ) {
    return this.assessmentsService.findAll(page, limit, status, search);
  }

  @Get('my-assessments')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Get candidate assigned assessments' })
  async getMyAssessments(@CurrentUser() user: JwtPayload) {
    return this.assessmentsService.getCandidateAssessments(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID' })
  async findById(@Param('id') id: string) {
    return this.assessmentsService.findById(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Update assessment' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.assessmentsService.update(id, dto, user.sub);
  }

  @Patch(':id/publish')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Publish assessment' })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.assessmentsService.publish(id, user.sub);
  }

  @Patch(':id/archive')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Archive assessment' })
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.assessmentsService.archive(id, user.sub);
  }

  @Post('invite')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Invite candidate to assessment' })
  async inviteCandidate(@Body() dto: InviteCandidateDto) {
    return this.assessmentsService.inviteCandidate(dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete assessment' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.assessmentsService.delete(id, user.sub);
  }
}
