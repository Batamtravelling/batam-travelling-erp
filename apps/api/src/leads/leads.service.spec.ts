import { describe, expect, it } from 'vitest';
import { canTransitionLead } from './leads.service.js';

describe('lead state transitions', () => {
  it('allows the supported sales path', () => {
    expect(canTransitionLead('NEW', 'CONTACTED')).toBe(true);
    expect(canTransitionLead('CONTACTED', 'QUALIFIED')).toBe(true);
    expect(canTransitionLead('QUALIFIED', 'QUOTATION')).toBe(true);
    expect(canTransitionLead('QUOTATION', 'WON')).toBe(true);
  });

  it('rejects skipping states and transitions from terminal states', () => {
    expect(canTransitionLead('NEW', 'WON')).toBe(false);
    expect(canTransitionLead('WON', 'CONTACTED')).toBe(false);
    expect(canTransitionLead('LOST', 'NEW')).toBe(false);
  });
});
