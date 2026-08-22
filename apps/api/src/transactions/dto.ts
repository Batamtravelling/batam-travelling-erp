import { BookingSource, BookingStatus, PackageServiceLevel, PassengerType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

export class PageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() @MaxLength(180) search?: string;
}
export class BookingQueryDto extends PageQueryDto { @IsOptional() @IsEnum(BookingStatus) status?: BookingStatus; }
export class PaymentQueryDto extends PageQueryDto { @IsOptional() @IsEnum(PaymentStatus) status?: PaymentStatus; }
export enum InvoiceSortDto { LATEST='LATEST', OLDEST='OLDEST', VALUE_DESC='VALUE_DESC' }
export class InvoiceQueryDto extends PageQueryDto { @IsOptional() @IsEnum(InvoiceSortDto) sort?: InvoiceSortDto; @IsOptional() @IsDateString() from?:string; @IsOptional() @IsDateString() to?:string; }

export class BookingPassengerDto {
  @IsOptional() @IsUUID() packageId?: string;
  @IsEnum(PackageServiceLevel) serviceLevel!: PackageServiceLevel;
  @IsEnum(PassengerType) passengerType!: PassengerType;
  @Type(() => Number) @IsInt() @Min(1) @Max(100_000) quantity!: number;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1_000_000_000_000) unitPrice!: number;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class CreateBookingDto {
  @IsUUID() customerId!: string;
  @IsOptional() @IsUUID() leadId?: string;
  @IsEnum(BookingSource) source!: BookingSource;
  @IsOptional() @IsUUID() packageId?: string;
  @IsOptional() @IsUUID() departureId?: string;
  @IsString() @MaxLength(300) packageName!: string;
  @IsDateString() travelDate!: string;
  @IsOptional() @IsDateString() returnDate?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(100_000) pax!: number;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1_000_000_000_000) totalAmount!: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => BookingPassengerDto)
  passengers?: BookingPassengerDto[];
}

export class ConfirmBookingDto {
  @IsString() @MinLength(3) @MaxLength(1000) reason!: string;
  @IsOptional() @IsBoolean() overrideDp?: boolean;
}

export class CreatePaymentDto {
  @IsUUID() invoiceId!: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(1_000_000_000_000) amount!: number;
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @IsOptional() @IsString() @MaxLength(300) reference?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class PosPaymentDto {
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(1_000_000_000_000) amount!: number;
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @IsOptional() @IsString() @MaxLength(300) reference?: string;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class CreatePosTransactionDto {
  @ValidateNested() @Type(() => CreateBookingDto) booking!: CreateBookingDto;
  @IsOptional() @ValidateNested() @Type(() => PosPaymentDto) payment?: PosPaymentDto;
}

export class VerifyPaymentDto {
  @IsEnum(PaymentStatus) status!: PaymentStatus;
}

export class UpdatePaymentPolicyDto {
  @IsBoolean() requireSeparateVerifier!: boolean;
}
