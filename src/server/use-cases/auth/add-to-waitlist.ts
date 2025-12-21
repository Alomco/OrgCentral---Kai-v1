import type {
    IWaitlistRepository,
    WaitlistEntryInput,
} from '@/server/repositories/contracts/auth/waitlist/waitlist-repository-contract';
import { normalizeString, normalizeEmail, assertNonEmpty } from '@/server/use-cases/shared';

export interface AddToWaitlistDependencies {
    waitlistRepository: IWaitlistRepository;
}

export type AddToWaitlistInput = WaitlistEntryInput;

export interface AddToWaitlistResult {
    success: true;
}

export async function addToWaitlist(
    { waitlistRepository }: AddToWaitlistDependencies,
    input: AddToWaitlistInput,
): Promise<AddToWaitlistResult> {
    const cleaned = normalizeEntry(input);
    // Early-exit: idempotent write. If the email already exists, do not create a duplicate.
    // This ensures clients can safely retry without creating duplicates.
    const existing = await waitlistRepository.findByEmail(cleaned.email);
    if (existing) {
        // Optionally we could merge metadata or update fields here, but to keep
        // the behavior simple and predictable, we return success if a waitlist
        // entry is already present for the same email.
        return { success: true };
    }

    await waitlistRepository.createEntry(cleaned);
    return { success: true };
}

function normalizeEntry(entry: AddToWaitlistInput): WaitlistEntryInput {
    const name = normalizeString(entry.name);
    const email = normalizeEmail(entry.email);
    const industry = normalizeString(entry.industry);

    assertNonEmpty(name, 'Contact name');
    assertNonEmpty(email, 'Email address');
    assertNonEmpty(industry, 'Industry description');

    return {
        name,
        email,
        industry,
        metadata: entry.metadata,
    } satisfies WaitlistEntryInput;
}
