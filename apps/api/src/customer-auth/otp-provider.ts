import { createHash, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';

export type OtpPurpose = 'REGISTER' | 'LOGIN';
export type OtpRegistration = { fullName: string; email: string; phone: string; acceptedTerms: boolean };
type Challenge = { id: string; email: string; purpose: OtpPurpose; hash: string; expiresAt: number; used: boolean; attempts: number; registration?: OtpRegistration };

export interface CustomerOtpProvider {
  issue(email: string, purpose: OtpPurpose, registration?: OtpRegistration): Promise<{ challengeId: string; expiresAt: Date; developmentOtp?: string }>;
  verify(challengeId: string, email: string, otp: string, purpose: OtpPurpose): Promise<{ registration?: OtpRegistration }>;
}

export class LocalCustomerOtpProvider implements CustomerOtpProvider {
  private readonly challenges = new Map<string, Challenge>();
  private hash(challengeId: string, otp: string) { return createHash('sha256').update(`${challengeId}:${otp}`).digest('hex'); }
  async issue(email: string, purpose: OtpPurpose, registration?: OtpRegistration) {
    const id = randomUUID(), otp = String(randomInt(0, 1_000_000)).padStart(6, '0'), expiresAt = Date.now() + 5 * 60_000;
    this.challenges.set(id, { id, email, purpose, hash: this.hash(id, otp), expiresAt, used: false, attempts: 0, registration });
    return { challengeId: id, expiresAt: new Date(expiresAt), developmentOtp: otp };
  }
  async verify(id: string, email: string, otp: string, purpose: OtpPurpose) {
    const c = this.challenges.get(id), supplied = this.hash(id, otp);
    if (!c || c.email !== email || c.purpose !== purpose || c.used || c.expiresAt <= Date.now()) throw new Error('OTP tidak valid atau kedaluwarsa');
    c.attempts += 1;
    if (c.attempts > 5 || !timingSafeEqual(Buffer.from(c.hash), Buffer.from(supplied))) throw new Error('OTP tidak valid atau kedaluwarsa');
    c.used = true; return { registration: c.registration };
  }
}

export class SupabaseCustomerOtpProvider implements CustomerOtpProvider {
  async issue(): Promise<never> { throw new Error('Supabase customer OTP adapter belum dikonfigurasi'); }
  async verify(): Promise<never> { throw new Error('Supabase customer OTP adapter belum dikonfigurasi'); }
}

export function createCustomerOtpProvider(): CustomerOtpProvider {
  const provider = process.env.CUSTOMER_AUTH_PROVIDER;
  if (provider === 'local' && process.env.NODE_ENV !== 'production') return new LocalCustomerOtpProvider();
  if (provider === 'supabase') return new SupabaseCustomerOtpProvider();
  throw new Error('CUSTOMER_AUTH_PROVIDER wajib dikonfigurasi; local hanya diizinkan pada development/test');
}
