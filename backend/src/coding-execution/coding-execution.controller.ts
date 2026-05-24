import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { CodingExecutionService } from './coding-execution.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('coding')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('coding')
export class CodingExecutionController {
  constructor(
    private readonly codingExecutionService: CodingExecutionService,
  ) {}

  @Post('execute')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Execute code' })
  async executeCode(@Body() dto: ExecuteCodeDto) {
    return this.codingExecutionService.executeCode(dto);
  }

  @Post('run-tests/:questionId')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Run test cases' })
  async runTestCases(
    @Param('questionId') questionId: string,
    @Body() dto: ExecuteCodeDto,
  ) {
    return this.codingExecutionService.runTestCases(dto, questionId);
  }

  @Get('execution/:id')
  @ApiOperation({ summary: 'Get execution result' })
  async getExecution(@Param('id') id: string) {
    return this.codingExecutionService.getExecution(id);
  }

  @Get('executions/:attemptId')
  @ApiOperation({ summary: 'Get all executions for an attempt' })
  async getExecutions(@Param('attemptId') attemptId: string) {
    return this.codingExecutionService.getExecutionsByAttempt(attemptId);
  }
}
