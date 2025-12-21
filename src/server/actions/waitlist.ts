'use server';

import { addToWaitlistController, type AddToWaitlistPayload } from '@/server/api-adapters/auth/add-to-waitlist';
import type { AddToWaitlistResult } from '@/server/use-cases/auth/add-to-waitlist';

export async function addToWaitlistAction(payload: AddToWaitlistPayload): Promise<AddToWaitlistResult> {
    return addToWaitlistController(payload);
}
