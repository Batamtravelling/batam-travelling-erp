import { SurchargeBasis } from '@prisma/client';

export function calculateDepartureSurcharge(amount: number, basis: SurchargeBasis, pax: number) {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(pax) || pax < 1) throw new Error('Surcharge input tidak valid');
  return amount * (basis === 'PER_PAX' ? pax : 1);
}
