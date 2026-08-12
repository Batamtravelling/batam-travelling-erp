import { BookingSource, BookingStatus, PackageServiceLevel, PassengerType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from 'class-validator';

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
  @Type(() => Number) @IsInt() @Min(1) @Max(100000) quantity!: number;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1_000_000_000_000) unitPrice!: number;
  @IsOptional() @IsString() @MaxLength(2000) notes?: string;
}

export class CreateBookingDto {
  @IsUUID() customerId!: string;
  @IsEnum(BookingSource) source!: BookingSource;
  @IsOptional() @IsUUID() packageId?: string;
  @IsOptional() @IsUUID() departureId?: string;
  @IsString() packageName!: string;
  @IsDateString() travelDate!: string;
  @IsOptional() @IsDateString() returnDate?: string;
  @Type(() => Number) @IsInt() @Min(1) pax!: number;
  @Type(() => Number) @IsNumber() @Min(0) totalAmount!: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => BookingPassengerDto)
  passengers?: BookingPassengerDto[];
}

export class ConfirmBookingDto {
  @IsString() @MinLength(3) @MaxLength(1000) reason!: string;
}

export class CreatePaymentDto {
  @IsUUID() invoiceId!: string;
  @Type(() => Number) @IsNumber() @Min(0.01) amount!: number;
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() notes?: string;
}

export class VerifyPaymentDto {
  @IsEnum(PaymentStatus) status!: PaymentStatus;
}
