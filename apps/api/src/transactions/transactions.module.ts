import { BadRequestException, Body, Controller, Get, Inject, Injectable, Module, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { ConfirmBookingDto, CreateBookingDto, CreatePaymentDto, VerifyPaymentDto } from './dto.js';
@Injectable() class TransactionsService {
  constructor(@Inject(PrismaService) private readonly prisma:PrismaService){}
  async listBookings(i:RequestIdentity, query: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(query.pageSize || 12)));
    const search = String(query.search || '').trim();
    const where = {
      tenantId: i.tenantId,
      ...(query.status ? { status: query.status as any } : {}),
      ...(search ? {
        OR: [
          { bookingCode: { contains: search, mode: 'insensitive' as const } },
          { packageName: { contains: search, mode: 'insensitive' as const } },
          { notes: { contains: search, mode: 'insensitive' as const } },
          { customer: { fullName: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true } },
          package: { select: { id: true, name: true } },
          departure: { select: { id: true, startsAt: true, status: true, maxPax: true } },
          trip: { select: { id: true, tripCode: true } },
          passengers: { include: { package: { select: { id: true, name: true, serviceLevel: true } } }, orderBy: { createdAt: 'asc' } },
          invoice: { include: { payments: { orderBy: { receivedAt: 'desc' } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }
  async createBooking(i:RequestIdentity,d:CreateBookingDto){
    const customer=await this.prisma.customer.findFirst({where:{id:d.customerId,tenantId:i.tenantId}});if(!customer)throw new BadRequestException('Customer tidak valid');
    const pkg=d.packageId?await this.prisma.travelPackage.findFirst({where:{id:d.packageId,tenantId:i.tenantId}}):null;if(d.packageId&&!pkg)throw new BadRequestException('Package tidak valid');
    if((d.passengers?.length??0)>0&&!d.packageId)throw new BadRequestException('Pilih paket utama sebelum menambahkan peserta');
    if(d.passengers?.some(x=>x.packageId&&x.packageId!==d.packageId))throw new BadRequestException('Booking hanya dapat memakai satu paket trip');
    const departure=d.departureId?await this.prisma.packageDeparture.findFirst({where:{id:d.departureId,tenantId:i.tenantId},include:{bookings:{where:{status:{notIn:['CANCELLED','REFUNDED']}},select:{pax:true}}}}):null;
    if(d.departureId&&!departure)throw new BadRequestException('Jadwal Open Trip tidak valid');
    if(departure){
      if(!['OPEN','SCHEDULED'].includes(departure.status))throw new BadRequestException('Open Trip tidak menerima booking');
      if(d.packageId&&departure.packageId!==d.packageId)throw new BadRequestException('Paket tidak sesuai dengan jadwal Open Trip');
      if(departure.bookingCloseAt&&departure.bookingCloseAt<new Date())throw new BadRequestException('Booking Open Trip sudah ditutup');
      const reserved=departure.bookings.reduce((sum,x)=>sum+x.pax,0);if(reserved+d.pax>departure.maxPax)throw new BadRequestException(`Sisa kursi hanya ${Math.max(0,departure.maxPax-reserved)} pax`);
    }
    return this.prisma.$transaction(async tx=>{
      const n=await tx.booking.count({where:{tenantId:i.tenantId}})+1;
      const booking=await tx.booking.create({data:{tenantId:i.tenantId,bookingCode:`BKG-${String(n).padStart(6,'0')}`,customerId:d.customerId,source:d.source,packageId:d.packageId,departureId:d.departureId,packageName:d.packageName,travelDate:departure?.startsAt??new Date(d.travelDate),returnDate:d.returnDate?new Date(d.returnDate):undefined,pax:d.pax,totalAmount:d.totalAmount,status:'PENDING_PAYMENT',notes:d.notes}});
      if(d.passengers?.length){await tx.bookingPassenger.createMany({data:d.passengers.map(x=>({tenantId:i.tenantId,bookingId:booking.id,packageId:x.packageId??d.packageId,serviceLevel:x.serviceLevel,passengerType:x.passengerType,quantity:x.quantity,unitPrice:x.unitPrice,totalPrice:Number(x.unitPrice)*x.quantity,notes:x.notes}))})}
      const m=await tx.invoice.count({where:{tenantId:i.tenantId}})+1;await tx.invoice.create({data:{tenantId:i.tenantId,invoiceNumber:`INV-${String(m).padStart(6,'0')}`,bookingId:booking.id,customerId:d.customerId,totalAmount:d.totalAmount,dueDate:d.dueDate?new Date(d.dueDate):undefined}});
      if(departure){const reserved=departure.bookings.reduce((sum,x)=>sum+x.pax,0)+d.pax;if(reserved>=departure.maxPax)await tx.packageDeparture.update({where:{id:departure.id},data:{status:'FULL'}})}
      return tx.booking.findUniqueOrThrow({where:{id:booking.id},include:{customer:true,invoice:true,departure:true}})
    })
  }
  async listInvoices(i:RequestIdentity, query: { page?: number; pageSize?: number; search?: string; sort?: string } = {}) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(query.pageSize || 12)));
    const search = String(query.search || '').trim();
    const orderBy = query.sort === 'OLDEST' ? { issuedAt: 'asc' as const } : query.sort === 'VALUE_DESC' ? { totalAmount: 'desc' as const } : { issuedAt: 'desc' as const };
    const where = {
      tenantId: i.tenantId,
      ...(search ? {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
          { customer: { fullName: { contains: search, mode: 'insensitive' as const } } },
          { booking: { bookingCode: { contains: search, mode: 'insensitive' as const } } },
          { booking: { packageName: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({ where, include: { customer: { select: { id: true, fullName: true } }, booking: { select: { bookingCode: true, packageName: true } }, payments: true }, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }
  async confirmBooking(i:RequestIdentity,id:string,d:ConfirmBookingDto){const booking=await this.prisma.booking.findFirst({where:{id,tenantId:i.tenantId},include:{trip:true}});if(!booking)throw new NotFoundException('Booking tidak ditemukan');if(booking.trip)throw new BadRequestException('Booking sudah memiliki Trip');if(['CANCELLED','REFUNDED'].includes(booking.status))throw new BadRequestException('Booking batal/refund tidak dapat dikonfirmasi');if(booking.status==='CONFIRMED')return booking;return this.prisma.booking.update({where:{id},data:{status:'CONFIRMED',notes:[booking.notes,`Konfirmasi manual oleh ${i.userId}: ${d.reason}`].filter(Boolean).join('\n')}})}
  listPayments(i:RequestIdentity){return this.prisma.payment.findMany({where:{tenantId:i.tenantId},include:{customer:{select:{fullName:true}},invoice:{select:{invoiceNumber:true}},receivedBy:{select:{name:true}},verifiedBy:{select:{name:true}}},orderBy:{receivedAt:'desc'}})}
  async createPayment(i:RequestIdentity,d:CreatePaymentDto){const invoice=await this.prisma.invoice.findFirst({where:{id:d.invoiceId,tenantId:i.tenantId}});if(!invoice)throw new NotFoundException('Invoice tidak ditemukan');if(d.amount>Number(invoice.totalAmount)-Number(invoice.paidAmount))throw new BadRequestException('Pembayaran melebihi outstanding invoice');const n=await this.prisma.payment.count({where:{tenantId:i.tenantId}})+1;return this.prisma.payment.create({data:{tenantId:i.tenantId,paymentNumber:`PAY-${String(n).padStart(6,'0')}`,invoiceId:invoice.id,customerId:invoice.customerId,amount:d.amount,method:d.method,reference:d.reference,notes:d.notes,receivedById:i.userId}})}
  async verifyPayment(i:RequestIdentity,id:string,d:VerifyPaymentDto){if(d.status==='PENDING')throw new BadRequestException('Verifikasi harus VERIFIED atau REJECTED');return this.prisma.$transaction(async tx=>{const payment=await tx.payment.findFirst({where:{id,tenantId:i.tenantId}});if(!payment)throw new NotFoundException('Payment tidak ditemukan');if(payment.status!=='PENDING')throw new BadRequestException('Payment sudah diverifikasi');const updated=await tx.payment.update({where:{id},data:{status:d.status,verifiedById:i.userId,verifiedAt:new Date(),receiptNumber:d.status==='VERIFIED'?`RCT-${payment.paymentNumber.slice(4)}`:undefined}});if(d.status==='VERIFIED'){const invoice=await tx.invoice.findUniqueOrThrow({where:{id:payment.invoiceId}});const result=await tx.payment.aggregate({_sum:{amount:true},where:{invoiceId:invoice.id,status:'VERIFIED'}});const paid=Number(result._sum.amount??0),total=Number(invoice.totalAmount);await tx.invoice.update({where:{id:invoice.id},data:{paidAmount:paid,status:paid>=total?'PAID':'PARTIALLY_PAID'}});await tx.booking.update({where:{id:invoice.bookingId},data:{paidAmount:paid,status:paid>=total?'CONFIRMED':'PARTIALLY_PAID'}})}return updated})}
}
@UseGuards(IdentityGuard,PermissionGuard) @Controller('bookings') class BookingsController{constructor(@Inject(TransactionsService)private readonly s:TransactionsService){}@Get()@Permissions('booking.read')list(@CurrentIdentity()i:RequestIdentity,@Query('page')page?:string,@Query('pageSize')pageSize?:string,@Query('search')search?:string,@Query('status')status?:string){return this.s.listBookings(i,{page:page?Number(page):undefined,pageSize:pageSize?Number(pageSize):undefined,search,status})}@Post()@Permissions('booking.manage')create(@CurrentIdentity()i:RequestIdentity,@Body()d:CreateBookingDto){return this.s.createBooking(i,d)}@Patch(':id/confirm')@Permissions('booking.manage')confirm(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:ConfirmBookingDto){return this.s.confirmBooking(i,id,d)}}
@UseGuards(IdentityGuard,PermissionGuard) @Controller('invoices') class InvoicesController{constructor(@Inject(TransactionsService)private readonly s:TransactionsService){}@Get()@Permissions('invoice.read')list(@CurrentIdentity()i:RequestIdentity,@Query('page')page?:string,@Query('pageSize')pageSize?:string,@Query('search')search?:string,@Query('sort')sort?:string){return this.s.listInvoices(i,{page:page?Number(page):undefined,pageSize:pageSize?Number(pageSize):undefined,search,sort})}}
@UseGuards(IdentityGuard,PermissionGuard) @Controller('payments') class PaymentsController{constructor(@Inject(TransactionsService)private readonly s:TransactionsService){}@Get()@Permissions('payment.read')list(@CurrentIdentity()i:RequestIdentity){return this.s.listPayments(i)}@Post()@Permissions('payment.manage')create(@CurrentIdentity()i:RequestIdentity,@Body()d:CreatePaymentDto){return this.s.createPayment(i,d)}@Patch(':id/verify')@Permissions('payment.verify')verify(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:VerifyPaymentDto){return this.s.verifyPayment(i,id,d)}}
@Module({controllers:[BookingsController,InvoicesController,PaymentsController],providers:[TransactionsService,PrismaService,IdentityGuard,PermissionGuard]})export class TransactionsModule{}
