import { PackageServiceLevel, PassengerType } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { canonicalizePackagePassengers } from './transactions.module.js';

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
