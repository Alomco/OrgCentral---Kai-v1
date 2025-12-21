import type { AddToWaitlistInput, AddToWaitlistResult } from '@/server/use-cases/auth/add-to-waitlist';
import { getWaitlistService, type WaitlistService } from '@/server/services/auth/waitlist-service';

export interface SubmitWaitlistEntryOptions {
    service?: WaitlistService;
}

export async function submitWaitlistEntry(
    input: AddToWaitlistInput,
    options?: SubmitWaitlistEntryOptions,
): Promise<AddToWaitlistResult> {
    const service = options?.service ?? getWaitlistService();
    return service.addEntry(input);
}
