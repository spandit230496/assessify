import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteCandidateDto {
  @ApiProperty()
  @IsString()
  assessmentId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsDateString()
  expiresAt: string;
}
