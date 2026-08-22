import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum QuotationStatusDto {
  DRAFT = 'DRAFT',
  READY = 'READY',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  NEGOTIATION = 'NEGOTIATION',
  ACCEPTED = 'ACCEPTED',
  CONVERTED = 'CONVERTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export class QuotationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() @MaxLength(180) search?: string;
  @IsOptional() @IsEnum(QuotationStatusDto) status?: QuotationStatusDto;
}

export class QuotationItemDto {
  @IsOptional() @IsUUID() serviceProductId?: string;
  @IsOptional() @IsString() @MaxLength(180) name?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(100000) quantity!: number;
  @IsOptional() @IsString() @MaxLength(30) unit?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1_000_000_000_000) unitPrice?: number;
}

export class CreateQuotationDto {
  @IsUUID() customerId!: string;
  @IsOptional() @IsUUID() leadId?: string;
  @IsOptional() @IsUUID() packageId?: string;
  @IsOptional() @IsUUID() departureId?: string;
  @IsDateString() travelDate!: string;
  @IsOptional() @IsDateString() returnDate?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(100000) pax!: number;
  @IsOptional() @IsString() @MaxLength(180) destination?: string;
  @IsDateString() validUntil!: string;
  @IsOptional() @IsString() @MaxLength(10000) terms?: string;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100)
  @ValidateNested({ each: true }) @Type(() => QuotationItemDto)
  items?: QuotationItemDto[];
}

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {}

export enum QuotationAcceptanceMethodDto {
  PORTAL = 'PORTAL',
  MANUAL = 'MANUAL',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  OTHER = 'OTHER',
}

export class AcceptQuotationDto {
  @IsEnum(QuotationAcceptanceMethodDto) method!: QuotationAcceptanceMethodDto;
}

export class RejectQuotationDto {
  @IsString() @Length(3, 1000) reason!: string;
}

export class ConvertQuotationDto {
  @IsOptional() @IsDateString() dueDate?: string;
}
