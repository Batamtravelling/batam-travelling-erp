import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class HousekeepingService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  onModuleInit() {
    const interval = Math.max(300_000, Number(process.env.HOUSEKEEPING_INTERVAL_MS ?? 3_600_000));
    this.timer = setInterval(() => { void this.run(); }, interval);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async run() {
    const now = new Date();
    const attemptsBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    try {
      const [idempotency, accessAttempts] = await this.prisma.$transaction([
        this.prisma.idempotencyRecord.deleteMany({ where: { expiresAt: { lt: now } } }),
        this.prisma.publicAccessAttempt.deleteMany({ where: { windowStartedAt: { lt: attemptsBefore } } }),
      ]);
      if (idempotency.count || accessAttempts.count) console.info(JSON.stringify({ level: 'info', event: 'housekeeping.completed', idempotencyDeleted: idempotency.count, accessAttemptsDeleted: accessAttempts.count }));
    } catch (error) {
      console.error(JSON.stringify({ level: 'error', event: 'housekeeping.failed', errorName: error instanceof Error ? error.name : 'UnknownError' }));
    }
  }
}
