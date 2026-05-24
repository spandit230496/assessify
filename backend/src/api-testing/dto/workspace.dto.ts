import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ description: 'Workspace name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Workspace description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Personal workspace flag' })
  @IsBoolean()
  @IsOptional()
  isPersonal?: boolean;

  @ApiPropertyOptional({ description: 'Workspace settings' })
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}

export class UpdateWorkspaceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
