import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnvironmentVariableDto {
  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSecret?: boolean;
}

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [EnvironmentVariableDto] })
  @IsArray()
  @IsOptional()
  variables?: EnvironmentVariableDto[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateEnvironmentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: [EnvironmentVariableDto] })
  @IsArray()
  @IsOptional()
  variables?: EnvironmentVariableDto[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
