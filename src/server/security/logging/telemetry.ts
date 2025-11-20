import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface TelemetryEmitter {
    recordMetric: (
        name: string,
        value: number,
        attributes?: Record<string, string | number | boolean>,
    ) => Promise<void> | void;
    recordEvent?: (
        name: string,
        attributes?: Record<string, string | number | boolean>,
    ) => Promise<void> | void;
    recordException?: (
        error: Error,
        attributes?: Record<string, string | number | boolean>,
    ) => Promise<void> | void;
}

export interface TelemetryContext {
    orgId: string;
    userId?: string;
    dataClassification?: DataClassificationLevel;
    dataResidency?: DataResidencyZone;
    auditSource?: string;
}

function formatAttributes(
    context: TelemetryContext,
    attributes?: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
    return {
        orgId: context.orgId,
        userId: context.userId ?? 'unknown',
        dataClassification: context.dataClassification ?? 'OFFICIAL',
        dataResidency: context.dataResidency ?? 'UNKNOWN',
        auditSource: context.auditSource ?? 'security',
        ...attributes,
    };
}

export function createSecurityTelemetry(
    emitter: TelemetryEmitter,
    context: TelemetryContext,
) {
    async function recordGuardDecision(
        guardName: string,
        decision: 'allow' | 'deny',
        attributes?: Record<string, string | number | boolean>,
    ): Promise<void> {
        const merged = formatAttributes(context, { guard: guardName, decision, ...attributes });
        await emitter.recordMetric('security.guard.decision', decision === 'allow' ? 1 : 0, merged);
        if (emitter.recordEvent) {
            await emitter.recordEvent('security.guard', merged);
        }
    }

    async function recordPolicyChange(
        policy: string,
        attributes?: Record<string, string | number | boolean>,
    ): Promise<void> {
        const merged = formatAttributes(context, { policy, ...attributes });
        await emitter.recordMetric('security.policy.change', 1, merged);
    }

    async function recordException(
        error: Error,
        attributes?: Record<string, string | number | boolean>,
    ): Promise<void> {
        if (emitter.recordException) {
            await emitter.recordException(error, formatAttributes(context, attributes));
        }
    }

    return {
        recordGuardDecision,
        recordPolicyChange,
        recordException,
    };
}
