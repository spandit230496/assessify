import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExecuteCodeDto {
  @ApiProperty()
  @IsString()
  attemptId: string;

  @ApiProperty({ example: 'python' })
  @IsString()
  language: string;

  @ApiProperty({ example: 'print("Hello World")' })
  @IsString()
  sourceCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  input?: string;

  @ApiPropertyOptional({ default: 5000 })
  @IsOptional()
  @IsNumber()
  timeLimitMs?: number;

  @ApiPropertyOptional({ default: 256 })
  @IsOptional()
  @IsNumber()
  memoryLimitMb?: number;
}
