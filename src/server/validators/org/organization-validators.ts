import { z } from 'zod';

const contactInfoSchema = z.object({
    name: z.string(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    email: z.string().email(),
    phone: z.string().optional(),
});

export const organizationContactDetailsSchema = z.object({
    primaryBusinessContact: contactInfoSchema.optional(),
    accountsFinanceContact: contactInfoSchema.optional(),
});
