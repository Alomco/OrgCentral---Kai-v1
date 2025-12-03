import type { WaitlistEntryInput } from './waitlist-repository.types';

export type { WaitlistEntryInput };

export interface IWaitlistRepository {
    createEntry(entry: WaitlistEntryInput): Promise<void>;
}
