import { describe, expect, it } from 'vitest';
import { PackagesService } from './packages.service.js';

describe('PackagesService', () => {
  it('creates, lists, updates, and removes packages', () => {
    const service = new PackagesService();

    const created = service.create({
      packageCode: 'PKG-100',
      name: 'Nusa Penida Escape',
      destination: 'Nusa Penida',
      durationDays: 4,
      sellingPrice: 2400000,
    });

    expect(created.id).toBeTruthy();
    expect(service.list()).toHaveLength(1);

    const updated = service.update(created.id, { status: 'ACTIVE' });
    expect(updated).not.toBeNull();
    if (!updated) throw new Error('Expected the package to be updated');
    expect(updated.status).toBe('ACTIVE');

    expect(service.remove(created.id)).toEqual({ deleted: true, id: created.id });
    expect(service.list()).toHaveLength(0);
  });
});
