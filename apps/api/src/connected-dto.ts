import { AssignmentRole, AssignmentStatus, CashDirection, CostType, ProjectStatus, TaskCommentType, TaskPriority, TaskStatus, TripStatus, VendorStatus } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, IsUrl, Max, MaxLength, Min } from 'class-validator';

export class PageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() @MaxLength(180) search?: string;
}

export class CreateTaskDto {
  @IsUUID() projectId!: string;
  @IsString() @MaxLength(240) title!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsUUID() assigneeId?: string;
  @IsOptional() @IsUUID() milestoneId?: string;
  @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsUUID('4', { each: true }) participantIds?: string[];
}

export class UpdateTaskDto {
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) progress?: number;
  @IsOptional() @IsString() @MaxLength(5000) comment?: string;
}

export class TaskCommentDto {
  @IsString() @MaxLength(5000) message!: string;
  @IsOptional() @IsEnum(TaskCommentType) type?: TaskCommentType;
}

export class CashflowQueryDto {
  @Type(() => Number) @IsInt() @Min(2000) @Max(2200) year!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(12) month!: number;
}

export class CreateCashflowDto {
  @IsEnum(CashDirection) direction!: CashDirection;
  @IsEnum(CostType) costType!: CostType;
  @IsString() @MaxLength(120) category!: string;
  @IsString() @MaxLength(1000) description!: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(1_000_000_000_000) amount!: number;
  @IsDateString() transactionDate!: string;
  @IsOptional() @IsString() @MaxLength(180) reference?: string;
  @IsOptional() @IsBoolean() fixedCost?: boolean;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
  @IsOptional() @IsUUID() projectId?: string;
  @IsOptional() @IsUUID() tripId?: string;
  @IsOptional() @IsUUID() vendorId?: string;
}

export class ReverseFinancialEntryDto {
  @IsString() @MaxLength(1000) reason!: string;
}

export class BusinessReportQueryDto extends PageQueryDto {
  @Type(() => Number) @IsInt() @Min(2000) @Max(2200) year!: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12) month?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) bookingPage?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) bookingPageSize?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) paymentPage?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) paymentPageSize?: number;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(10000) vision?: string;
  @IsOptional() @IsString() @MaxLength(10000) mission?: string;
  @IsOptional() @IsString() @MaxLength(10000) coreValues?: string;
  @IsOptional() @IsString() @MaxLength(30000) customerTerms?: string;
  @IsOptional() @IsString() @MaxLength(30000) privacyPolicy?: string;
  @IsOptional() @IsString() @MaxLength(30000) cancellationPolicy?: string;
  @IsOptional() @IsUrl({ require_tld: false }) websiteLogoUrl?: string;
  @IsOptional() @IsUrl({ require_tld: false }) erpLogoUrl?: string;
  @IsOptional() @IsUrl({ require_tld: false }) documentLogoUrl?: string;
  @IsOptional() @IsString() @MaxLength(30000) homepageSections?: string;
  @IsOptional() @IsString() @MaxLength(180) heroTitle?: string;
  @IsOptional() @IsString() @MaxLength(500) heroSubtitle?: string;
  @IsOptional() @IsUrl({ require_tld: false }) heroImageUrl?: string;
  @IsOptional() @IsString() @MaxLength(80) heroBadge?: string;
  @IsOptional() @IsString() @MaxLength(80) heroCtaPrimary?: string;
  @IsOptional() @IsString() @MaxLength(80) heroCtaSecondary?: string;
  @IsOptional() @IsString() @MaxLength(180) featureHeadline?: string;
  @IsOptional() @IsString() @MaxLength(2000) featureText?: string;
  @IsOptional() @IsString() @MaxLength(180) howToBookTitle?: string;
  @IsOptional() @IsString() @MaxLength(5000) howToBookText?: string;
  @IsOptional() @IsString() @MaxLength(180) aboutTitle?: string;
  @IsOptional() @IsString() @MaxLength(10000) aboutText?: string;
  @IsOptional() @IsString() @MaxLength(40) whatsappNumber?: string;
  @IsOptional() @IsString() @MaxLength(40) whatsappNumberSecondary?: string;
  @IsOptional() @IsString() @MaxLength(180) contactEmail?: string;
  @IsOptional() @IsString() @MaxLength(1000) contactAddress?: string;
  @IsOptional() @IsString() @MaxLength(500) contactHours?: string;
  @IsOptional() @IsUrl({ require_tld: false }) instagramUrl?: string;
  @IsOptional() @IsUrl({ require_tld: false }) facebookUrl?: string;
  @IsOptional() @IsUrl({ require_tld: false }) tiktokUrl?: string;
  @IsOptional() @IsUrl({ require_tld: false }) youtubeUrl?: string;
}

export class CreateTripDto {
  @IsUUID() bookingId!: string;
  @IsOptional() @IsString() @MaxLength(240) title?: string;
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
  @IsOptional() @IsString() @MaxLength(300) departure?: string;
  @IsOptional() @IsString() @MaxLength(500) meetingPoint?: string;
  @IsOptional() @IsString() @MaxLength(180) vehicle?: string;
  @IsOptional() @IsString() @MaxLength(30000) itinerary?: string;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
}

export class TransitionTripDto {
  @IsEnum(TripStatus) status!: TripStatus;
  @IsOptional() @IsString() @MaxLength(1000) reason?: string;
}

export class AssignTripDto {
  @IsUUID() employeeId!: string;
  @IsEnum(AssignmentRole) role!: AssignmentRole;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsString() @MaxLength(2000) taskNote?: string;
}

export class UpdateAssignmentDto {
  @IsEnum(AssignmentStatus) status!: AssignmentStatus;
}

export class CreateEmployeeDto {
  @IsString() @MaxLength(180) name!: string;
  @IsEmail() @MaxLength(180) email!: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(180) jobTitle?: string;
  @IsOptional() @IsString() @MaxLength(5000) skills?: string;
  @IsOptional() @IsString() @MaxLength(5000) availability?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(20) @IsUUID('4', { each: true }) roleIds?: string[];
}
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsOptional() @IsBoolean() active?: boolean;
}

export class CreateProjectDto {
  @IsString() @MaxLength(40) code!: string;
  @IsString() @MaxLength(240) name!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsUUID() ownerId?: string;
}
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class CreateVendorDto {
  @IsString() @MaxLength(240) name!: string;
  @IsString() @MaxLength(120) category!: string;
  @IsOptional() @IsEnum(VendorStatus) status?: VendorStatus;
  @IsOptional() @IsString() @MaxLength(180) contactName?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsEmail() @MaxLength(180) email?: string;
  @IsOptional() @IsString() @MaxLength(1000) address?: string;
  @IsOptional() @IsUUID() picEmployeeId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(3650) paymentTermsDays?: number;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
}
export class UpdateVendorDto extends PartialType(CreateVendorDto) {}
