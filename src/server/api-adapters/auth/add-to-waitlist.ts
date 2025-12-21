import { getWaitlistService } from '@/server/services/auth/waitlist-service';
import type { WaitlistService } from '@/server/services/auth/waitlist-service';
import type { AddToWaitlistResult } from '@/server/use-cases/auth/add-to-waitlist';
import { submitWaitlistEntry } from '@/server/use-cases/auth/add-to-waitlist-action';
import { waitlistEntrySchema, type WaitlistEntry } from '@/server/types/waitlist-types';

export const AddToWaitlistSchema = waitlistEntrySchema;

export type AddToWaitlistPayload = WaitlistEntry;

const waitlistService = getWaitlistService();

export async function addToWaitlistController(
    payload: unknown,
    service: WaitlistService = waitlistService,
): Promise<AddToWaitlistResult> {
    const input = AddToWaitlistSchema.parse(payload);
    return submitWaitlistEntry(input, { service });
}
