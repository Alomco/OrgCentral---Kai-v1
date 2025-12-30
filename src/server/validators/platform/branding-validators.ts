import { z } from 'zod';

const jsonSchema = z.record(z.string(), z.any()).optional().nullable();

export const platformBrandingSchema = z.object({
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    logoUrl: z.string().url().optional().nullable(),
    primaryColor: z.string().optional().nullable(),
    secondaryColor: z.string().optional().nullable(),

    companyName: z.string().optional().nullable(),
    customCss: z.string().optional().nullable(),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    faviconUrl: z.string().url().optional().nullable(),
    metadata: jsonSchema,
    updatedAt: z.date().optional().nullable(),
});
