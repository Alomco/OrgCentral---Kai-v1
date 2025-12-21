import type { WaitlistEntryInput } from './waitlist-repository.types';

export type { WaitlistEntryInput };

export interface IWaitlistRepository {
    createEntry(entry: WaitlistEntryInput): Promise<void>;
    /**
     * Find a waitlist entry by email. Returns null if no entry exists.
     * Implementations should treat email lookup in a case-insensitive manner.
     */
    findByEmail(email: string): Promise<WaitlistEntryInput | null>;
}
