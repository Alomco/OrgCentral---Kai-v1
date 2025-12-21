import type { Invitation as PrismaInvitation } from '@prisma/client';
import type { InvitationRecord } from '@/server/repositories/contracts/auth/invitations';
import type { OnboardingData } from '@/server/types/auth-types';
import type { AbacSubjectAttributes } from '@/server/types/abac-subject-attributes';

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    return value.every((entry) => typeof entry === 'string') ? [...value] : undefined;
}

function isAbacPrimitive(value: unknown): value is string | number | boolean | null {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null
    );
}

function coerceAbacSubjectAttributes(value: unknown): AbacSubjectAttributes | undefined {
    if (!isPlainObject(value)) {
        return undefined;
    }

    const record = value;
    const result: AbacSubjectAttributes = {};

    for (const [key, raw] of Object.entries(record)) {
        if (key.trim().length === 0) {
            continue;
        }

        if (isAbacPrimitive(raw)) {
            result[key] = raw;
            continue;
        }

        if (Array.isArray(raw) && raw.every(isAbacPrimitive)) {
            result[key] = [...raw];
        }
    }

    return Object.keys(result).length > 0 ? result : undefined;
}

export function coerceOnboardingData(raw: unknown, fallbackEmail: string): InvitationRecord['onboardingData'] {
    const onboarding: InvitationRecord['onboardingData'] = {
        email: fallbackEmail,
        displayName: '',
    };

    if (!isPlainObject(raw)) {
        return onboarding;
    }

    const payload = raw as Partial<OnboardingData>;

    if (typeof payload.email === 'string') {
        onboarding.email = payload.email;
    }

    if (typeof payload.displayName === 'string') {
        onboarding.displayName = payload.displayName;
    }

    if (typeof payload.firstName === 'string') {
        onboarding.firstName = payload.firstName;
    }

    if (typeof payload.lastName === 'string') {
        onboarding.lastName = payload.lastName;
    }

    const startDate = payload.startDate;
    if (typeof startDate === 'string' || startDate instanceof Date) {
        onboarding.startDate = startDate;
    }

    if (typeof payload.employeeId === 'string') {
        onboarding.employeeId = payload.employeeId;
    }

    if (typeof payload.position === 'string') {
        onboarding.position = payload.position;
    }

    if (typeof payload.department === 'string') {
        onboarding.department = payload.department;
    }

    if (typeof payload.employmentType === 'string') {
        onboarding.employmentType = payload.employmentType;
    }

    const salary = payload.salary;
    if (typeof salary === 'number' || typeof salary === 'string' || salary === null) {
        onboarding.salary = salary;
    }

    if (typeof payload.payFrequency === 'string') {
        onboarding.payFrequency = payload.payFrequency;
    }

    if (typeof payload.managerId === 'string') {
        onboarding.managerId = payload.managerId;
    }

    const roles = toStringArray(payload.roles);
    if (roles) {
        onboarding.roles = roles;
    }

    if (typeof payload.payBasis === 'string' || payload.payBasis === null) {
        onboarding.payBasis = payload.payBasis;
    }

    if (typeof payload.paySchedule === 'string' || payload.paySchedule === null) {
        onboarding.paySchedule = payload.paySchedule;
    }

    const eligibleLeaveTypes = toStringArray(payload.eligibleLeaveTypes);
    if (eligibleLeaveTypes) {
        onboarding.eligibleLeaveTypes = eligibleLeaveTypes;
    }

    if (typeof payload.onboardingTemplateId === 'string' || payload.onboardingTemplateId === null) {
        onboarding.onboardingTemplateId = payload.onboardingTemplateId;
    }

    const abacSubjectAttributes = coerceAbacSubjectAttributes(
        (payload as Partial<OnboardingData> & { abacSubjectAttributes?: unknown }).abacSubjectAttributes,
    );
    if (abacSubjectAttributes) {
        onboarding.abacSubjectAttributes = abacSubjectAttributes;
    }

    return onboarding;
}

export function mapPrismaInvitationToInvitationRecord(record: PrismaInvitation): InvitationRecord {
    return {
        token: record.token,
        status: record.status,
        targetEmail: record.targetEmail,
        organizationId: record.orgId,
        organizationName: record.organizationName,
        invitedByUid: record.invitedByUserId ?? undefined,
        onboardingData: coerceOnboardingData(record.onboardingData, record.targetEmail),
        invitedByUserId: record.invitedByUserId ?? undefined,
        acceptedAt: record.acceptedAt ?? undefined,
        acceptedByUserId: record.acceptedByUserId ?? undefined,
        expiresAt: record.expiresAt ?? undefined,
        updatedAt: record.updatedAt,
    };
}
