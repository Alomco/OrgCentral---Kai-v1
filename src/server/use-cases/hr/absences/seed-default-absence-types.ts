import type { IAbsenceTypeConfigRepository } from '@/server/repositories/contracts/hr/absences/absence-type-config-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { toJsonValue } from '@/server/domain/absences/conversions';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface AbsenceTypeSeed {
    key: string;
    label: string;
    tracksBalance?: boolean;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
}

export const DEFAULT_ABSENCE_TYPE_SEEDS: readonly AbsenceTypeSeed[] = [
    {
        key: 'sickness',
        label: 'Sickness',
        tracksBalance: true,
    },
    {
        key: 'personal-leave',
        label: 'Personal leave',
        tracksBalance: true,
    },
    {
        key: 'unpaid-leave',
        label: 'Unpaid leave',
        tracksBalance: true,
    },
] as const;

export interface SeedDefaultAbsenceTypesDependencies {
    typeConfigRepository: Pick<IAbsenceTypeConfigRepository, 'getConfigs' | 'createConfig'>;
}

export interface SeedDefaultAbsenceTypesInput {
    authorization: RepositoryAuthorizationContext;
    dataResidency?: DataResidencyZone;
    dataClassification?: DataClassificationLevel;
}

export async function seedDefaultAbsenceTypes(
    deps: SeedDefaultAbsenceTypesDependencies,
    input: SeedDefaultAbsenceTypesInput,
): Promise<void> {
    const classification = input.dataClassification ?? input.authorization.dataClassification;
    const residency = input.dataResidency ?? input.authorization.dataResidency;
    const existing = await deps.typeConfigRepository.getConfigs(input.authorization, { includeInactive: true });
    const existingKeys = new Set(existing.map((type) => type.key));

    for (const seed of DEFAULT_ABSENCE_TYPE_SEEDS) {
        if (existingKeys.has(seed.key)) {
            continue;
        }

        await deps.typeConfigRepository.createConfig(input.authorization, {
            orgId: input.authorization.orgId,
            key: seed.key,
            label: seed.label,
            tracksBalance: seed.tracksBalance ?? true,
            isActive: seed.isActive ?? true,
            metadata: toJsonValue(buildMetadata(seed, classification, residency)),
        });
    }
}

function buildMetadata(
    seed: AbsenceTypeSeed,
    dataClassification?: DataClassificationLevel,
    dataResidency?: DataResidencyZone,
): Record<string, unknown> {
    const metadata: Record<string, unknown> = {
        seeded: true,
        seedKey: seed.key,
    };

    if (dataResidency) {
        metadata.dataResidency = dataResidency;
    }

    if (dataClassification) {
        metadata.dataClassification = dataClassification;
    }

    if (seed.metadata) {
        Object.assign(metadata, seed.metadata);
    }

    return metadata;
}
