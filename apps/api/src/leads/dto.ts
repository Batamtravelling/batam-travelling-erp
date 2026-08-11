import { FollowUpStatus, LeadPriority, LeadStatus } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLeadDto {
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsString() senderName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() message?: string;
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

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
  @IsOptional() @IsDateString() nextFollowUpAt?: string;
}

export class TransitionLeadDto {
  @IsEnum(LeadStatus) status!: LeadStatus;
  @IsOptional() @IsString() reason?: string;
}

export class VerifyLeadDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateFollowUpDto {
  @IsDateString() dueAt!: string;
  @IsString() channel!: string;
  @IsString() subject!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() nextAction?: string;
  @IsOptional() @IsDateString() nextFollowUpAt?: string;
}

export class UpdateFollowUpDto {
  @IsOptional() @IsEnum(FollowUpStatus) status?: FollowUpStatus;
  @IsOptional() @IsString() result?: string;
  @IsOptional() @IsString() nextAction?: string;
  @IsOptional() @IsDateString() nextFollowUpAt?: string;
}
