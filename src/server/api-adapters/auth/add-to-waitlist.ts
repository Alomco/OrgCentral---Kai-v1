import { PrismaWaitlistRepository } from '@/server/repositories/prisma/auth/waitlist';
import { addToWaitlist, type AddToWaitlistDependencies, type AddToWaitlistResult } from '@/server/use-cases/auth/add-to-waitlist';
import { waitlistEntrySchema, type WaitlistEntry } from '@/server/types/waitlist-types';

const waitlistRepository = new PrismaWaitlistRepository();

export const AddToWaitlistSchema = waitlistEntrySchema;

const defaultDependencies: AddToWaitlistDependencies = {
    waitlistRepository,
};

export type AddToWaitlistPayload = WaitlistEntry;

export async function addToWaitlistController(
    payload: unknown,
    dependencies: AddToWaitlistDependencies = defaultDependencies,
): Promise<AddToWaitlistResult> {
    const input = AddToWaitlistSchema.parse(payload);
    return addToWaitlist(dependencies, input);
}
