import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface ResidencyMetadata {
    zone: DataResidencyZone;
    classification: DataClassificationLevel;
    contractId?: string;
    reason?: string;
}

export interface ResidencyExpectation {
    expectedZone?: DataResidencyZone;
    expectedClassification?: DataClassificationLevel;
}

export interface ResidencyAssertion {
    ok: boolean;
    reasons: string[];
}

export type ResidencyTagged<TRecord> = TRecord & {
    residency: ResidencyMetadata;
};

export function tagResidency<TRecord>(
    record: TRecord,
    metadata: ResidencyMetadata,
): ResidencyTagged<TRecord> {
    return {
        ...record,
        residency: { ...metadata },
    };
}

export function assertResidency(
    metadata: ResidencyMetadata,
    expectation: ResidencyExpectation,
): ResidencyAssertion {
    const reasons: string[] = [];
    if (expectation.expectedZone && metadata.zone !== expectation.expectedZone) {
        reasons.push(`Residency mismatch: expected ${expectation.expectedZone}, got ${metadata.zone}.`);
    }
    if (expectation.expectedClassification) {
        const expected = expectation.expectedClassification;
        if (metadata.classification !== expected) {
            reasons.push(
                `Classification mismatch: expected ${expected}, got ${metadata.classification}.`,
            );
        }
    }
    return {
        ok: reasons.length === 0,
        reasons,
    };
}
