export interface PackageRecord {
  id: string;
  packageCode: string;
  name: string;
  destination: string;
  durationDays: number;
  sellingPrice: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}

export class PackagesService {
  private records: PackageRecord[] = [];

  list(): PackageRecord[] {
    return this.records;
  }

  create(input: Omit<PackageRecord, 'id' | 'status'> & { status?: PackageRecord['status'] }): PackageRecord {
    const record: PackageRecord = {
      id: `pkg-${Date.now()}`,
      status: 'DRAFT',
      ...input,
    };
    this.records.push(record);
    return record;
  }

  update(id: string, updates: Partial<PackageRecord>): PackageRecord | null {
    const record = this.records.find((item) => item.id === id);
    if (!record) return null;
    Object.assign(record, updates);
    return record;
  }

  remove(id: string): { deleted: boolean; id: string } {
    this.records = this.records.filter((item) => item.id !== id);
    return { deleted: true, id };
  }
}
