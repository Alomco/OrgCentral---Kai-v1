import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getLeavePolicyService } from '@/server/services/hr/leave-policies/leave-policy-service.provider';
import type { UkJurisdiction } from '@/server/domain/leave/uk-leave-policy';
import type { LeaveAttachmentPayload } from '@/server/types/leave/leave-attachment';
import type { LeaveRequestFormState } from '../form-state';

export function readFormString(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
}

export function parseClientAttachments(raw: string | null): LeaveAttachmentPayload[] {
    if (!raw) { return []; }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) { return []; }

        const isAttachment = (value: unknown): value is LeaveAttachmentPayload =>
            Boolean(
                value
                && typeof value === 'object'
                && 'fileName' in value
                && typeof (value as Record<string, unknown>).fileName === 'string'
                && 'contentType' in value
                && typeof (value as Record<string, unknown>).contentType === 'string'
                && 'fileSize' in value
                && typeof (value as Record<string, unknown>).fileSize === 'number'
                && 'storageKey' in value
                && typeof (value as Record<string, unknown>).storageKey === 'string',
            );

        return parsed.filter(isAttachment).map((item) => ({ ...item }));
    } catch {
        return [];
    }
}

export function parseIsoDateInput(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error('Date is required.');
    }

    const date = new Date(`${trimmed}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid date.');
    }

    return date.toISOString();
}

export function toDateFieldError(
    field: 'startDate' | 'endDate',
    error: unknown,
    message: string,
): Pick<LeaveRequestFormState, 'status' | 'message' | 'fieldErrors'> {
    return {
        status: 'error',
        message,
        fieldErrors: {
            [field]: error instanceof Error
                ? error.message
                : field === 'startDate'
                    ? 'Invalid start date.'
                    : 'Invalid end date.',
        },
    };
}

export function resolveJurisdictionFromOrg(orgResidency?: string): UkJurisdiction {
    if (!orgResidency) {
        return 'england-wales';
    }
    const normalized = orgResidency.toLowerCase();
    if (normalized.includes('sct') || normalized.includes('scotland')) {
        return 'scotland';
    }
    if (normalized.includes('nir') || normalized.includes('northern') || normalized.includes('ni')) {
        return 'northern-ireland';
    }
    return 'england-wales';
}

export async function resolvePolicyOverrides(
    leaveType: string,
    authorization: RepositoryAuthorizationContext,
): Promise<{
    maxConsecutiveDays?: number;
    noticeMultiplier?: number;
    jurisdiction?: string;
    allowNegativeBalance: boolean;
}> {
    const leavePolicyService = getLeavePolicyService();
    const policies = await leavePolicyService.listLeavePolicies({
        authorization,
        payload: { orgId: authorization.orgId },
    });
    const policy = policies.find((p) => p.name === leaveType) ?? null;

    if (!policy) {
        return {
            maxConsecutiveDays: undefined,
            noticeMultiplier: undefined,
            jurisdiction: undefined,
            allowNegativeBalance: false,
        };
    }

    const noticeMultiplier =
        typeof policy.metadata === 'object'
            && policy.metadata
            && 'noticeMultiplier' in policy.metadata
            ? Number((policy.metadata).noticeMultiplier) || undefined
            : undefined;

    return {
        maxConsecutiveDays: policy.maxConsecutiveDays ?? undefined,
        noticeMultiplier,
        jurisdiction: policy.dataResidency,
        allowNegativeBalance: Boolean(policy.allowNegativeBalance),
    };
}
