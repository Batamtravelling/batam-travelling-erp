import { BadRequestException, Body, Controller, Delete, Get, Inject, Injectable, Module, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';

class MediaDto {
  @IsString() fileName!: string;
  @IsString() mimeType!: string;
  @IsString() base64!: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsString() category?: string;
}

class PeriodDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(2000) @Max(2200) year?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12) month?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() sort?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) bookingPage?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) bookingPageSize?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) paymentPage?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) paymentPageSize?: number;
}

@Injectable()
class MediaService {
  constructor(@Inject(PrismaService) private readonly p: PrismaService) {}

  list(i: RequestIdentity) {
    return this.p.websiteMediaFile.findMany({ where: { tenantId: i.tenantId }, include: { uploadedBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async upload(i: RequestIdentity, d: MediaDto) {
    const ext: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    if (!ext[d.mimeType]) throw new BadRequestException('Format harus JPG, PNG, WEBP, atau GIF');
    const clean = d.base64.replace(/^data:[^;]+;base64,/, '');
    const bytes = Buffer.from(clean, 'base64');
    if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new BadRequestException('Ukuran gambar maksimal 8 MB');
    const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const secret = process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_MEDIA_BUCKET ?? 'erp-media';
    if (!url || !secret) throw new BadRequestException('Supabase Storage belum dikonfigurasi');
    const storedName = `${i.tenantId}/${randomUUID()}.${ext[d.mimeType]}`;
    const upload = await fetch(`${url}/storage/v1/object/${bucket}/${storedName}`, { method: 'POST', headers: { authorization: `Bearer ${secret}`, apikey: secret, 'content-type': d.mimeType, 'x-upsert': 'false' }, body: bytes });
    if (!upload.ok) throw new BadRequestException('Upload media gagal');
    const publicUrl = `${url}/storage/v1/object/public/${bucket}/${storedName}`;
    return this.p.websiteMediaFile.create({ data: { tenantId: i.tenantId, uploadedById: i.userId, originalName: d.fileName, storedName, mimeType: d.mimeType, size: bytes.length, url: publicUrl, altText: d.altText, category: d.category ?? 'WEBSITE' }, include: { uploadedBy: { select: { name: true } } } });
  }

  async remove(i: RequestIdentity, id: string) {
    const f = await this.p.websiteMediaFile.findFirst({ where: { id, tenantId: i.tenantId } });
    if (!f) throw new BadRequestException('File tidak ditemukan');
    const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const secret = process.env.SUPABASE_SECRET_KEY;
    const bucket = process.env.SUPABASE_MEDIA_BUCKET ?? 'erp-media';
    if (url && secret) await fetch(`${url}/storage/v1/object/${bucket}/${f.storedName}`, { method: 'DELETE', headers: { authorization: `Bearer ${secret}`, apikey: secret } });
    return this.p.websiteMediaFile.delete({ where: { id } });
  }
}

@Injectable()
class ReportsService {
  constructor(@Inject(PrismaService) private readonly p: PrismaService) {}

  private range(q: PeriodDto) {
    const now = new Date();
    const year = q.year ?? now.getFullYear();
    if (q.month) return { gte: new Date(Date.UTC(year, q.month - 1, 1)), lt: new Date(Date.UTC(year, q.month, 1)), label: `${year}-${String(q.month).padStart(2, '0')}` };
    return { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)), label: String(year) };
  }

  private bookingOrder(sort?: string) {
    if (sort === 'OLDEST') return { createdAt: 'asc' as const };
    if (sort === 'VALUE_DESC') return { totalAmount: 'desc' as const };
    return { createdAt: 'desc' as const };
  }

  private paymentOrder(sort?: string) {
    if (sort === 'OLDEST') return { receivedAt: 'asc' as const };
    if (sort === 'VALUE_DESC') return { amount: 'desc' as const };
    return { receivedAt: 'desc' as const };
  }

  async report(i: RequestIdentity, q: PeriodDto) {
    const r = this.range(q);
    const search = String(q.search || '').trim();
    const bookingPage = Math.max(1, Number(q.bookingPage || 1));
    const bookingPageSize = Math.max(1, Math.min(100, Number(q.bookingPageSize || 10)));
    const paymentPage = Math.max(1, Number(q.paymentPage || 1));
    const paymentPageSize = Math.max(1, Math.min(100, Number(q.paymentPageSize || 10)));

    const bookingWhere: any = {
      tenantId: i.tenantId,
      createdAt: { gte: r.gte, lt: r.lt },
      ...(search ? { OR: [
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { packageName: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { customer: { fullName: { contains: search, mode: 'insensitive' } } },
      ] } : {}),
    };

    const paymentWhere: any = {
      tenantId: i.tenantId,
      receivedAt: { gte: r.gte, lt: r.lt },
      ...(search ? { OR: [
        { paymentNumber: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { customer: { fullName: { contains: search, mode: 'insensitive' } } },
        { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
      ] } : {}),
    };

    const [invoiceRows, bookingTotal, bookingSums, paymentTotal, receivedSums, bookings, payments] = await Promise.all([
      this.p.invoice.findMany({ where: { tenantId: i.tenantId, issuedAt: { gte: r.gte, lt: r.lt } }, select: { totalAmount: true, paidAmount: true } }),
      this.p.booking.count({ where: bookingWhere }),
      this.p.booking.aggregate({ where: bookingWhere, _sum: { pax: true, totalAmount: true } }),
      this.p.payment.count({ where: paymentWhere }),
      this.p.payment.aggregate({ where: { ...paymentWhere, status: 'VERIFIED' }, _sum: { amount: true } }),
      this.p.booking.findMany({ where: bookingWhere, include: { customer: { select: { fullName: true, phone: true } }, invoice: { select: { invoiceNumber: true } }, package: { select: { name: true } } }, orderBy: this.bookingOrder(q.sort), skip: (bookingPage - 1) * bookingPageSize, take: bookingPageSize }),
      this.p.payment.findMany({ where: paymentWhere, include: { customer: { select: { fullName: true } }, invoice: { select: { invoiceNumber: true } }, receivedBy: { select: { name: true } }, verifiedBy: { select: { name: true } } }, orderBy: this.paymentOrder(q.sort), skip: (paymentPage - 1) * paymentPageSize, take: paymentPageSize }),
    ]);

    return {
      period: r.label,
      summary: {
        bookingCount: bookingTotal,
        pax: bookingSums._sum.pax ?? 0,
        bookingValue: Number(bookingSums._sum.totalAmount ?? 0),
        invoiced: invoiceRows.reduce((s, x) => s + Number(x.totalAmount), 0),
        received: Number(receivedSums._sum.amount ?? 0),
        outstanding: invoiceRows.reduce((s, x) => s + Number(x.totalAmount) - Number(x.paidAmount), 0),
        paymentCount: paymentTotal,
      },
      bookings: bookings.map((b) => ({ tanggal: b.createdAt, kode: b.bookingCode, pelanggan: b.customer.fullName, telepon: b.customer.phone, paket: b.package?.name ?? b.packageName, tanggalTrip: b.travelDate, pax: b.pax, status: b.status, total: Number(b.totalAmount), dibayar: Number(b.paidAmount), invoice: b.invoice?.invoiceNumber ?? '' })),
      payments: payments.map((p) => ({ tanggal: p.receivedAt, nomor: p.paymentNumber, invoice: p.invoice.invoiceNumber, pelanggan: p.customer.fullName, metode: p.method, status: p.status, jumlah: Number(p.amount), diterimaOleh: p.receivedBy?.name ?? '—', diverifikasiOleh: p.verifiedBy?.name ?? '' })),
      bookingsMeta: { page: bookingPage, pageSize: bookingPageSize, total: bookingTotal, totalPages: Math.max(1, Math.ceil(bookingTotal / bookingPageSize)) },
      paymentsMeta: { page: paymentPage, pageSize: paymentPageSize, total: paymentTotal, totalPages: Math.max(1, Math.ceil(paymentTotal / paymentPageSize)) },
    };
  }
}

@UseGuards(IdentityGuard,PermissionGuard)
@Controller('media')
class MediaController {
  constructor(@Inject(MediaService) private readonly s: MediaService) {}
  @Get() @Permissions('media.read') list(@CurrentIdentity() i: RequestIdentity) { return this.s.list(i); }
  @Post() @Permissions('media.manage') upload(@CurrentIdentity() i: RequestIdentity, @Body() d: MediaDto) { return this.s.upload(i, d); }
  @Delete(':id') @Permissions('media.manage') remove(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string) { return this.s.remove(i, id); }
}

@UseGuards(IdentityGuard,PermissionGuard)
@Controller('reports')
class ReportsController {
  constructor(@Inject(ReportsService) private readonly s: ReportsService) {}
  @Get('business') @Permissions('dashboard.owner') report(@CurrentIdentity() i: RequestIdentity, @Query() q: PeriodDto) { return this.s.report(i, q); }
}

@Module({ controllers: [MediaController, ReportsController], providers: [MediaService, ReportsService, PrismaService, IdentityGuard, PermissionGuard] })
export class MediaReportsModule {}
