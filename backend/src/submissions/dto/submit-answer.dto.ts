import { IsString, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnswerStatus } from '@prisma/client';

export class SubmitAnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiPropertyOptional({ enum: AnswerStatus })
  @IsOptional()
  @IsEnum(AnswerStatus)
  status?: AnswerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedOptionIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textAnswer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  codeAnswer?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeTakenSeconds?: number;
}
