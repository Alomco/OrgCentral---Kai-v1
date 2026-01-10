import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_LEAVE_POLICIES } from '@/server/repositories/cache-scopes';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { LeavePolicy, LeavePolicyType } from '@/server/types/leave-types';
import type { TenantScope } from '@/server/types/tenant';

const POLICY_TYPE_MATCHERS: readonly { type: LeavePolicyType; keywords: string[] }[] = [
    { type: 'ANNUAL', keywords: ['annual', 'vacation', 'holiday', 'paid time off', 'pto'] },
    { type: 'SICK', keywords: ['sick', 'ill', 'illness', 'medical', 'doctor', 'hospital', 'injury'] },
    { type: 'MATERNITY', keywords: ['maternity', 'pregnancy', 'pregnant', 'antenatal', 'prenatal'] },
    { type: 'PATERNITY', keywords: ['paternity', 'paternal', 'partner leave'] },
    { type: 'ADOPTION', keywords: ['adoption', 'adoptive', 'foster'] },
    { type: 'UNPAID', keywords: ['unpaid', 'leave without pay', 'loss of pay', 'lop', 'lwop'] },
    { type: 'EMERGENCY', keywords: ['emergency', 'urgent', 'compassionate', 'bereavement', 'funeral', 'crisis'] },
];

interface ResolvedPolicyShape {
    name: string;
    policyType: LeavePolicyType;
    normalizedKey: string;
}

export interface ResolveLeavePolicyOptions {
    primaryLeaveType?: string;
}

export interface LeavePolicyResolverDependencies {
    leavePolicyRepository: ILeavePolicyRepository;
}

export async function resolveLeavePolicyId(
    { leavePolicyRepository }: LeavePolicyResolverDependencies,
    tenant: TenantScope,
    leaveType: string,
    options?: ResolveLeavePolicyOptions,
): Promise<string> {
    const resolved = resolvePolicyShape(leaveType);
    const lookupNames = uniqueStrings([resolved.name, leaveType]);

    for (const candidate of lookupNames) {
        const existingPolicy = await leavePolicyRepository.getLeavePolicyByName(tenant, candidate);
        if (existingPolicy) {
            return existingPolicy.id;
        }
    }

    const isDefault = options?.primaryLeaveType
        ? normalizeKey(options.primaryLeaveType) === resolved.normalizedKey
        : false;

    await leavePolicyRepository.createLeavePolicy(tenant, buildDefaultPolicy(tenant, resolved, leaveType, isDefault));
    await invalidateOrgCache(tenant.orgId, CACHE_SCOPE_LEAVE_POLICIES, tenant.dataClassification, tenant.dataResidency);

    const createdPolicy = await leavePolicyRepository.getLeavePolicyByName(tenant, resolved.name);
    if (!createdPolicy) {
        throw new Error('Failed to resolve leave policy');
    }

    return createdPolicy.id;
}

export function mapToPolicyType(leaveType: string): LeavePolicyType {
    const normalized = normalizeLabel(leaveType);
    if (!normalized) {
        return 'SPECIAL';
    }

    for (const matcher of POLICY_TYPE_MATCHERS) {
        for (const keyword of matcher.keywords) {
            if (normalized.includes(keyword)) {
                return matcher.type;
            }
        }
    }

    return 'SPECIAL';
}

function resolvePolicyShape(leaveType: string): ResolvedPolicyShape {
    const normalizedKey = normalizeKey(leaveType);
    const name = formatPolicyName(leaveType);
    const policyType = mapToPolicyType(leaveType);

    return { name, policyType, normalizedKey };
}

function buildDefaultPolicy(
    tenant: TenantScope,
    policy: ResolvedPolicyShape,
    legacyLabel: string,
    isDefault: boolean,
): Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date().toISOString();
    return {
        orgId: tenant.orgId,
        dataResidency: tenant.dataResidency,
        dataClassification: tenant.dataClassification,
        auditSource: tenant.auditSource,
        auditBatchId: tenant.auditBatchId,
        name: policy.name,
        policyType: policy.policyType,
        accrualFrequency: 'NONE',
        accrualAmount: 0,
        carryOverLimit: undefined,
        requiresApproval: true,
        isDefault,
        activeFrom: now,
        activeTo: undefined,
        statutoryCompliance: false,
        maxConsecutiveDays: null,
        allowNegativeBalance: false,
        metadata: { createdFromLeaveService: true, legacyLabel },
    };
}

function formatPolicyName(value: string): string {
    const normalized = normalizeLabel(value);
    if (!normalized) {
        return 'Special Leave';
    }

    const tokens = normalized.split(' ').filter(Boolean);
    const base = tokens.map(capitalize).join(' ');
    const hasLeaveWord = tokens.some((token) => token === 'leave');
    return hasLeaveWord ? base : `${base} Leave`;
}

function normalizeLabel(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function normalizeKey(value: string): string {
    return value.trim().toLowerCase();
}

function capitalize(token: string): string {
    if (!token) {
        return token;
    }
    return token[0].toUpperCase() + token.slice(1);
}

function uniqueStrings(values: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const value of values) {
        const trimmed = value.trim();
        if (!trimmed || seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        result.push(trimmed);
    }
    return result;
}
