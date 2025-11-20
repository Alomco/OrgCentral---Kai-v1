import type { WaitlistEntryInput } from './waitlist-repository.types';

export interface IWaitlistRepository {
    createEntry(entry: WaitlistEntryInput): Promise<void>;
}
