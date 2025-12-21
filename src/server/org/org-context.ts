import { headers } from 'next/headers';
import { z } from 'zod';

import {
    DATA_CLASSIFICATION_LEVELS,
    DATA_RESIDENCY_ZONES,
    type DataClassificationLevel,
    type DataResidencyZone,
} from '@/server/types/tenant';

export interface OrgContext {
    orgId: string;
    residency: DataResidencyZone;
    classification: DataClassificationLevel;
}

const orgContextSchema = z.object({
    orgId: z.string().trim().min(1).default('public'),
    residency: z.enum(DATA_RESIDENCY_ZONES).default('UK_ONLY'),
    classification: z.enum(DATA_CLASSIFICATION_LEVELS).default('OFFICIAL'),
});

export async function resolveOrgContext(input?: Partial<OrgContext>): Promise<OrgContext> {
    const headerStore = await headers();

    const parsed = orgContextSchema.parse({
        orgId: input?.orgId ?? headerStore.get('x-org-id') ?? 'public',
        residency: input?.residency ?? headerStore.get('x-data-residency') ?? 'UK_ONLY',
        classification: input?.classification ?? headerStore.get('x-data-classification') ?? 'OFFICIAL',
    });

    return parsed;
}
