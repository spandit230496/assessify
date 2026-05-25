import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType, Difficulty } from '@prisma/client';

class CreateOptionDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

class CreateCodingConfigDto {
  @ApiProperty({ example: ['python', 'javascript'] })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiPropertyOptional()
  @IsOptional()
  boilerplateCode?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  solutionCode?: Record<string, string>;

  @ApiPropertyOptional({ default: 5000 })
  @IsOptional()
  @IsNumber()
  timeLimitMs?: number;

  @ApiPropertyOptional({ default: 256 })
  @IsOptional()
  @IsNumber()
  memoryLimitMb?: number;
}

class CreateTestCaseDto {
  @ApiProperty()
  @IsString()
  input: string;

  @ApiProperty()
  @IsString()
  expected: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  sectionId: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({ enum: Difficulty, default: Difficulty.MEDIUM })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ example: 'What is the output of this code?' })
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  marks: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  negativeMarks?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  timeLimitSeconds?: number;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [CreateOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options?: CreateOptionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCodingConfigDto)
  codingConfig?: CreateCodingConfigDto;

  @ApiPropertyOptional({ type: [CreateTestCaseDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestCaseDto)
  testCases?: CreateTestCaseDto[];
}
