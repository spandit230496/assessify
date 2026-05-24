import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('questions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.INTERVIEWER)
  @ApiOperation({ summary: 'Create a question' })
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Get questions by section' })
  async findBySection(@Param('sectionId') sectionId: string) {
    return this.questionsService.findBySectionId(sectionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  async findById(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER, Role.INTERVIEWER)
  @ApiOperation({ summary: 'Update question' })
  async update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Delete question' })
  async delete(@Param('id') id: string) {
    return this.questionsService.delete(id);
  }
}
