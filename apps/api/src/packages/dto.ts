import { PartialType } from '@nestjs/swagger';
import { DepartureStatus, PackageStatus, SurchargeBasis } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreatePackageDto {
  @IsString() @Matches(/^[A-Z0-9][A-Z0-9-]{1,39}$/) packageCode!: string;
  @IsString() @MaxLength(180) name!: string;
  @IsOptional() @IsString() @MaxLength(180) destination?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(365) durationDays?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1_000_000_000_000) sellingPrice?: number;
  @IsOptional() @IsEnum(PackageStatus) status?: PackageStatus;
}

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}

export class DepartureDto {
  @IsDateString() startsAt!: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsDateString() bookingCloseAt?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(100000) minPax!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(100000) maxPax!: number;
  @IsOptional() @IsString() @MaxLength(300) meetingPoint?: string;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
  @IsOptional() @IsString() @MaxLength(5000) publicNotes?: string;
  @IsOptional() @IsString() @MaxLength(5000) internalNotes?: string;
  @IsOptional() @IsEnum(DepartureStatus) status?: DepartureStatus;
  @IsOptional() @IsString() @MaxLength(180) surchargeLabel?: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1_000_000_000_000) surchargeAmount!: number;
  @IsEnum(SurchargeBasis) surchargeBasis!: SurchargeBasis;
}

export class PackageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() @MaxLength(180) search?: string;
}
