import type { TimeEntry } from '@/server/types/hr-ops-types';

export interface ITimeEntryRepository {
  createTimeEntry(orgId: string, input: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: TimeEntry['status'] }): Promise<TimeEntry>;
  updateTimeEntry(
    orgId: string,
    id: string,
    updates: Partial<Pick<TimeEntry, 'clockIn' | 'clockOut' | 'totalHours' | 'breakDuration' | 'project' | 'tasks' | 'notes' | 'status' | 'approvedByOrgId' | 'approvedByUserId' | 'approvedAt' | 'dataClassification' | 'residencyTag' | 'metadata'>>
  ): Promise<TimeEntry>;
  getTimeEntry(orgId: string, id: string): Promise<TimeEntry | null>;
  listTimeEntries(orgId: string, filters?: { userId?: string; status?: TimeEntry['status']; from?: Date; to?: Date }): Promise<TimeEntry[]>;
}
