import { BookingSource, PackageServiceLevel, PassengerType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class BookingPassengerDto {
  @IsOptional() @IsUUID() packageId?: string;
  @IsEnum(PackageServiceLevel) serviceLevel!: PackageServiceLevel;
  @IsEnum(PassengerType) passengerType!: PassengerType;
  @Type(() => Number) @IsInt() @Min(1) quantity!: number;
  @Type(() => Number) @IsNumber() @Min(0) unitPrice!: number;
  @IsOptional() @IsString() notes?: string;
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
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => BookingPassengerDto)
  passengers?: BookingPassengerDto[];
}

export class ConfirmBookingDto {
  @IsOptional() @IsString() reason?: string;
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
