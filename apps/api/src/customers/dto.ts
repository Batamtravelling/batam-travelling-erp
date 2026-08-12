import { CustomerStatus, CustomerType } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString() @MaxLength(160) fullName!: string;
  @IsOptional() @IsEnum(CustomerType) type?: CustomerType;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() @MaxLength(2) country?: string;
  @IsOptional() @IsString() leadSource?: string;
  @IsOptional() @IsString() notes?: string;
}
export class UpdateCustomerDto extends PartialType(CreateCustomerDto) { @IsOptional() @IsEnum(CustomerStatus) status?: CustomerStatus; }

