import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartureCapacityService {
  async assertAvailable(tx: Prisma.TransactionClient, tenantId: string, departureId: string, requestedPax: number) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${tenantId}:departure:${departureId}`}, 0))`;

    const departure = await tx.packageDeparture.findFirst({
      where: { id: departureId, tenantId },
      select: { status: true, bookingCloseAt: true, maxPax: true },
    });
    if (!departure) throw new BadRequestException('Jadwal Open Trip tidak valid');
    if (!['OPEN', 'SCHEDULED'].includes(departure.status)) throw new BadRequestException('Open Trip tidak menerima booking');
    if (departure.bookingCloseAt && departure.bookingCloseAt < new Date()) throw new BadRequestException('Booking Open Trip sudah ditutup');

    const reserved = await tx.booking.aggregate({
      _sum: { pax: true },
      where: { tenantId, departureId, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
    });
    const sold = Number(reserved._sum.pax ?? 0);
    if (sold + requestedPax > departure.maxPax) {
      throw new BadRequestException(`Sisa kursi hanya ${Math.max(0, departure.maxPax - sold)} pax`);
    }
  }
}
