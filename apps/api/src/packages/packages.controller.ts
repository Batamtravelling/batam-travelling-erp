import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DepartureStatus, PackageStatus, SurchargeBasis } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { PackagesService } from './packages.service.js';

class DepartureDto{
  @IsDateString() startsAt!:string; @IsOptional() @IsDateString() endsAt?:string; @IsOptional() @IsDateString() bookingCloseAt?:string;
  @Type(()=>Number) @IsInt() @Min(1) minPax!:number; @Type(()=>Number) @IsInt() @Min(1) maxPax!:number;
  @IsOptional() @IsString() meetingPoint?:string; @IsOptional() @IsString() notes?:string; @IsOptional() @IsEnum(DepartureStatus) status?:DepartureStatus;
  @IsOptional() @IsString() surchargeLabel?:string; @Type(()=>Number) @IsNumber() @Min(0) surchargeAmount!:number; @IsEnum(SurchargeBasis) surchargeBasis!:SurchargeBasis;
}

@ApiTags('packages') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('packages')
export class PackagesController {
  constructor(@Inject(PackagesService) private readonly service: PackagesService) {}

  @Get() @Permissions('package.read') list(@CurrentIdentity() identity: RequestIdentity) {
    return this.service.list(identity);
  }

  @Post() @Permissions('package.create') create(@CurrentIdentity() identity: RequestIdentity, @Body() body: Record<string, unknown>) {
    return this.service.create(identity, {
      packageCode: String(body.packageCode ?? '').trim(),
      name: String(body.name ?? '').trim(),
      destination: body.destination ? String(body.destination) : undefined,
      durationDays: body.durationDays ? Number(body.durationDays) : undefined,
      sellingPrice: body.sellingPrice !== undefined ? Number(body.sellingPrice) : undefined,
      status: (body.status as PackageStatus | undefined) ?? 'DRAFT',
    });
  }

  @Patch(':id') @Permissions('package.update') update(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(identity, id, {
      packageCode: body.packageCode ? String(body.packageCode) : undefined,
      name: body.name ? String(body.name) : undefined,
      destination: body.destination ? String(body.destination) : undefined,
      durationDays: body.durationDays ? Number(body.durationDays) : undefined,
      sellingPrice: body.sellingPrice !== undefined ? Number(body.sellingPrice) : undefined,
      status: body.status as PackageStatus | undefined,
    });
  }

  @Delete(':id') @Permissions('package.update') remove(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    return this.service.remove(identity, id);
  }
  @Post(':id/departures') @Permissions('package.update') createDeparture(@CurrentIdentity()identity:RequestIdentity,@Param('id')id:string,@Body()body:DepartureDto){return this.service.createDeparture(identity,id,body)}
}
