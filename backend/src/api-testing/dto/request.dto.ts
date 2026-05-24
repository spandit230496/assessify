import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpMethod, ApiAuthType, ApiBodyType, ApiProtocol } from '@prisma/client';

export class CreateRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: HttpMethod })
  @IsEnum(HttpMethod)
  method: HttpMethod;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional({ enum: ApiProtocol })
  @IsEnum(ApiProtocol)
  @IsOptional()
  protocol?: ApiProtocol;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  queryParams?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  pathParams?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  cookies?: Record<string, string>;

  @ApiPropertyOptional({ enum: ApiAuthType })
  @IsEnum(ApiAuthType)
  @IsOptional()
  authType?: ApiAuthType;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  authConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ApiBodyType })
  @IsEnum(ApiBodyType)
  @IsOptional()
  bodyType?: ApiBodyType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preRequestScript?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testScript?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1000)
  @IsOptional()
  timeoutMs?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  followRedirects?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  retryCount?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(100)
  @IsOptional()
  retryDelayMs?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  order?: number;
}

export class UpdateRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: HttpMethod })
  @IsEnum(HttpMethod)
  @IsOptional()
  method?: HttpMethod;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ enum: ApiProtocol })
  @IsEnum(ApiProtocol)
  @IsOptional()
  protocol?: ApiProtocol;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  queryParams?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  pathParams?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  cookies?: Record<string, string>;

  @ApiPropertyOptional({ enum: ApiAuthType })
  @IsEnum(ApiAuthType)
  @IsOptional()
  authType?: ApiAuthType;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  authConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ApiBodyType })
  @IsEnum(ApiBodyType)
  @IsOptional()
  bodyType?: ApiBodyType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preRequestScript?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  testScript?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1000)
  @IsOptional()
  timeoutMs?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  followRedirects?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  retryCount?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(100)
  @IsOptional()
  retryDelayMs?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  order?: number;
}

export class ExecuteRequestDto {
  @ApiProperty({ enum: HttpMethod })
  @IsEnum(HttpMethod)
  method: HttpMethod;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  queryParams?: Record<string, string>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  pathParams?: Record<string, string>;

  @ApiPropertyOptional({ enum: ApiAuthType })
  @IsEnum(ApiAuthType)
  @IsOptional()
  authType?: ApiAuthType;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  authConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ApiBodyType })
  @IsEnum(ApiBodyType)
  @IsOptional()
  bodyType?: ApiBodyType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1000)
  @IsOptional()
  timeoutMs?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  followRedirects?: boolean;
}
