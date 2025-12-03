import { z } from 'zod';

/**
 * Canonical schema for waitlist submissions shared across server and UI layers.
 */
export const waitlistEntrySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email({ message: 'A valid email is required' }),
    industry: z.string().min(1, 'Industry is required'),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>;
