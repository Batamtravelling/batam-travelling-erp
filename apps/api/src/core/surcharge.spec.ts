import { describe, expect, it } from 'vitest';
import { calculateDepartureSurcharge } from './surcharge.js';

describe('departure surcharge', () => {
  it('calculates a per-passenger surcharge', () => expect(calculateDepartureSurcharge(100_000, 'PER_PAX', 31)).toBe(3_100_000));
  it('calculates a per-booking surcharge once', () => expect(calculateDepartureSurcharge(400_000, 'PER_BOOKING', 35)).toBe(400_000));
  it('rejects invalid values', () => expect(() => calculateDepartureSurcharge(-1, 'PER_PAX', 2)).toThrow());
});
