export function summarizeDepartureCapacity(maxPax: number, bookings: { pax: number }[]) {
  const reservedPax = bookings.reduce((sum, booking) => sum + booking.pax, 0);
  const remainingPax = Math.max(0, maxPax - reservedPax);
  const occupancyPercent = maxPax > 0 ? Math.min(100, Math.round((reservedPax / maxPax) * 100)) : 0;
  return { reservedPax, remainingPax, occupancyPercent, bookingCount: bookings.length };
}
