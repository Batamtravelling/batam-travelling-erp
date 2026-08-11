import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingCodeService {
  private periodFromTravelDate(travelDate: Date) {
    const year = travelDate.getUTCFullYear();
    const month = String(travelDate.getUTCMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  async next(tx: Prisma.TransactionClient, tenantId: string, travelDate: Date) {
    const period = this.periodFromTravelDate(travelDate);
    const prefix = `BTV-${period}-`;

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${tenantId}:${period}`}, 0))`;

    const latest = await tx.booking.findFirst({
      where: { tenantId, bookingCode: { startsWith: prefix } },
      orderBy: { bookingCode: 'desc' },
      select: { bookingCode: true },
    });

    const previous = latest?.bookingCode.match(/^BTV-\d{6}-(\d{4})$/);
    const sequence = Number(previous?.[1] ?? 0) + 1;
    if (sequence > 9999) throw new ConflictException(`Nomor booking untuk periode ${period} sudah penuh`);

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
