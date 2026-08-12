import { describe, expect, it } from 'vitest';
import { summarizeDepartureCapacity } from './core/departure-capacity-summary.js';

describe('open trip capacity summary', () => {
  it('counts passenger seats instead of booking rows', () => {
    expect(summarizeDepartureCapacity(20, [{ pax: 4 }, { pax: 7 }])).toEqual({
      reservedPax: 11,
      remainingPax: 9,
      occupancyPercent: 55,
      bookingCount: 2,
    });
  });

  it('does not expose negative remaining capacity', () => {
    expect(summarizeDepartureCapacity(10, [{ pax: 12 }])).toMatchObject({
      reservedPax: 12,
      remainingPax: 0,
      occupancyPercent: 100,
    });
  });
});
