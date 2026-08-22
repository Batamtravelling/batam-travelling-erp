import { PackageServiceLevel, PassengerType } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { assertPaymentCollectible, assertSeparatePaymentVerifier, bookingStatusAfterVerifiedPayment, canonicalizePackagePassengers, canVerifyPayment } from './transactions.module.js';

describe('canonical booking passengers', () => {
  it('overrides client-controlled package, service level, and price', () => {
    const submitted = [{
      packageId: 'client-package',
      serviceLevel: PackageServiceLevel.REGULAR,
      passengerType: PassengerType.CHILD,
      quantity: 2,
      unitPrice: 1,
      notes: 'Kebutuhan kursi anak',
    }];

    const result = canonicalizePackagePassengers(
      submitted,
      'approved-package',
      PackageServiceLevel.PREMIUM,
      (type) => type === PassengerType.CHILD ? 500_000 : 1_000_000,
    );

    expect(result).toEqual([{
      packageId: 'approved-package',
      serviceLevel: PackageServiceLevel.PREMIUM,
      passengerType: PassengerType.CHILD,
      quantity: 2,
      unitPrice: 500_000,
      notes: 'Kebutuhan kursi anak',
    }]);
    expect(submitted[0]).toMatchObject({
      packageId: 'client-package',
      serviceLevel: PackageServiceLevel.REGULAR,
      unitPrice: 1,
    });
  });
});

describe('payment alignment across booking and finance', () => {
  it('does not regress a confirmed or operational booking after a partial payment', () => {
    expect(bookingStatusAfterVerifiedPayment('CONFIRMED', 500_000, 1_000_000)).toBe('CONFIRMED');
    expect(bookingStatusAfterVerifiedPayment('IN_PREPARATION', 500_000, 1_000_000)).toBe('IN_PREPARATION');
    expect(bookingStatusAfterVerifiedPayment('READY', 500_000, 1_000_000)).toBe('READY');
  });

  it('promotes an unpaid booking only when payment reaches the invoice total', () => {
    expect(bookingStatusAfterVerifiedPayment('PENDING_PAYMENT', 500_000, 1_000_000)).toBe('PARTIALLY_PAID');
    expect(bookingStatusAfterVerifiedPayment('PARTIALLY_PAID', 1_000_000, 1_000_000)).toBe('CONFIRMED');
  });

  it('blocks collection against cancelled and refunded commercial records', () => {
    expect(() => assertPaymentCollectible('CANCELLED', 'PENDING_PAYMENT')).toThrow('dibatalkan/refund');
    expect(() => assertPaymentCollectible('ISSUED', 'REFUNDED')).toThrow('dibatalkan/refund');
    expect(() => assertPaymentCollectible('ISSUED', 'CONFIRMED')).not.toThrow();
  });

  it('enforces Four Eyes only when the tenant policy requires it', () => {
    expect(canVerifyPayment(true, 'user-a', 'user-a')).toBe(false);
    expect(canVerifyPayment(true, 'user-a', 'user-b')).toBe(true);
    expect(canVerifyPayment(false, 'user-a', 'user-a')).toBe(true);
    expect(() => assertSeparatePaymentVerifier(true, 'user-a', 'user-a')).toThrow('Four Eyes');
    expect(() => assertSeparatePaymentVerifier(true, 'user-a', 'user-b')).not.toThrow();
    expect(() => assertSeparatePaymentVerifier(false, 'user-a', 'user-a')).not.toThrow();
  });
});
