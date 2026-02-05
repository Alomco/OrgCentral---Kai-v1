import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ApplyOnboardingAutomationDependencies } from './apply-onboarding-automation';
import type { JsonRecord, JsonValue } from '@/server/types/json';

export interface NormalizedSequenceStep {
    key: string;
    scheduledAt: Date;
    metadata: JsonRecord;
}

export function normalizeSequenceSteps(steps: JsonValue): NormalizedSequenceStep[] {
    if (!Array.isArray(steps)) {
        return [];
    }

    const now = new Date();
    return steps
        .map((step, index) => {
            if (!isJsonRecord(step)) {
                return null;
            }
            const key = typeof step.key === 'string' ? step.key : `step-${String(index + 1)}`;
            const delayDays = typeof step.delayDays === 'number' ? step.delayDays : 0;
            const delayHours = typeof step.delayHours === 'number' ? step.delayHours : 0;
            const scheduledAt = new Date(now.getTime() + (delayDays * 24 + delayHours) * 60 * 60 * 1000);
            return {
                key,
                scheduledAt,
                metadata: step,
            } satisfies NormalizedSequenceStep;
        })
        .filter((value): value is NormalizedSequenceStep => Boolean(value));
}

export async function ensureMetricDefinition(
    deps: ApplyOnboardingAutomationDependencies,
    authorization: RepositoryAuthorizationContext,
    key: string,
    label: string,
): Promise<{ id: string; key: string } | null> {
    const definitions = await deps.onboardingMetricDefinitionRepository.listDefinitions(
        authorization.orgId,
        { isActive: true },
    );
    const existing = definitions.find((definition) => definition.key === key);
    if (existing) {
        return { id: existing.id, key: existing.key };
    }
    const created = await deps.onboardingMetricDefinitionRepository.createDefinition({
        orgId: authorization.orgId,
        key,
        label,
        unit: 'count',
        targetValue: null,
        thresholds: null,
        isActive: true,
        metadata: { source: 'system' },
        dataClassification: authorization.dataClassification,
        residencyTag: authorization.dataResidency,
        auditSource: authorization.auditSource,
        correlationId: authorization.correlationId,
        createdBy: authorization.userId,
    });
    return { id: created.id, key: created.key };
}

function isJsonRecord(value: JsonValue): value is JsonRecord {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
