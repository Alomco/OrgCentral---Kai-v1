import { vi } from 'vitest';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import type { MockedFunction } from 'vitest';

/**
 * Mock factory for ITimeEntryRepository
 * Usage:
 *   const mockRepo = createMockTimeEntryRepository();
 *   mockRepo.createTimeEntry.mockResolvedValue(buildMockTimeEntry());
 */
export type MockTimeEntryRepository = {
    [K in keyof ITimeEntryRepository]: MockedFunction<ITimeEntryRepository[K]>;
};

export function createMockTimeEntryRepository(): MockTimeEntryRepository {
    return {
        createTimeEntry: vi.fn(),
        updateTimeEntry: vi.fn(),
        getTimeEntry: vi.fn(),
        listTimeEntries: vi.fn(),
    };
}
