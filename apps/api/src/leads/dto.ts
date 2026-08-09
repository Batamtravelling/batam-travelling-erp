import { LeadPriority, LeadStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLeadDto {
  @IsUUID() customerId!: string;
  @IsString() source!: string;
  @IsOptional() @IsString() requirement?: string;
  @IsOptional() @IsString() destination?: string;
  @IsOptional() @IsDateString() travelDate?: string;
  @IsOptional() @IsDateString() returnDate?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pax?: number;
  @IsOptional() @Type(() => Number) @Min(0) estimatedValue?: number;
  @IsOptional() @IsUUID() assignedUserId?: string;
  @IsOptional() @IsEnum(LeadPriority) priority?: LeadPriority;
  @IsOptional() @IsString() notes?: string;
}
export class UpdateLeadDto extends CreateLeadDto { @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus; }
export class TransitionLeadDto { @IsEnum(LeadStatus) status!: LeadStatus; @IsOptional() @IsString() reason?: string; }

