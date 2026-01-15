import type { PrismaJsonValue } from '@/server/types/prisma';
import type { ContactInfo, OrganizationData, OrganizationRecord } from '@/server/types/leave-types';
import { normalizeLeaveYearStartDate, type LeaveYearStartDate } from '@/server/types/org/leave-year-start-date';

interface OrganizationLegacyColumns {
    // Organization profile + legacy fields
    address: string | null;
    phone: string | null;
    website: string | null;
    companyType: string | null;
    industry: string | null;
    employeeCountRange: string | null;
    incorporationDate: Date | null;
    registeredOfficeAddress: string | null;
    contactDetails: PrismaJsonValue | null;

    // Leave settings legacy columns
    primaryLeaveType: string | null;
    leaveYearStartDate: Date | null;

    // Admin + subscription legacy fields
    availablePermissions: PrismaJsonValue | null;
}

type OrganizationWithLegacyColumns = OrganizationRecord & Partial<OrganizationLegacyColumns>;

function normalizeRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }
    return value as Record<string, unknown>;
}

function readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) {
        return undefined;
    }

    const items = value.filter((item) => typeof item === 'string' && item.length > 0);
    return items.length > 0 ? (items as string[]) : undefined;
}

function readContactInfo(value: unknown): ContactInfo | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }

    const record = value as Record<string, unknown>;
    const name = readString(record.name);
    const email = readString(record.email);
    if (!name || !email) {
        return undefined;
    }

    const phone = readString(record.phone);
    return phone ? { name, email, phone } : { name, email };
}

function normalizeLeaveRoundingRule(value: unknown): OrganizationData['leaveRoundingRule'] | undefined {
    if (value === 'nearest_half') {
        return 'half_day';
    }
    if (value === 'round_up') {
        return 'full_day';
    }

    if (value === 'half_day' || value === 'full_day' || value === 'quarter_day') {
        return value;
    }

    return undefined;
}

function tryNormalizeLeaveYearStartDate(value: unknown): LeaveYearStartDate | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    try {
        return normalizeLeaveYearStartDate(trimmed);
    } catch {
        return undefined;
    }
}

function formatMonthDay(date: Date): string {
    // YYYY-MM-DDTHH:mm:ss.sssZ -> MM-DD
    return date.toISOString().slice(5, 10);
}

export function mapOrganizationToData(organization: OrganizationWithLegacyColumns): OrganizationData {
    const settings = normalizeRecord(organization.settings);
    const leaveSettings = (settings.leave as Record<string, unknown> | undefined) ?? {};

    const entitlements = leaveSettings.entitlements as Record<string, number> | undefined;
    const leaveEntitlements = entitlements ?? {};

    const primaryLeaveType =
        readString(organization.primaryLeaveType) ?? readString(leaveSettings.primaryLeaveType) ?? 'annual';

    const leaveYearStartDate: LeaveYearStartDate =
        (organization.leaveYearStartDate
            ? normalizeLeaveYearStartDate(formatMonthDay(organization.leaveYearStartDate))
            : undefined) ??
        tryNormalizeLeaveYearStartDate(leaveSettings.leaveYearStartDate) ??
        normalizeLeaveYearStartDate('01-01');

    const leaveRoundingRule = normalizeLeaveRoundingRule(leaveSettings.leaveRoundingRule) ?? 'full_day';

    const profile = normalizeRecord(settings.profile);

    const contactDetails = normalizeRecord(organization.contactDetails ?? profile.contactDetails);
    const primaryBusinessContact = readContactInfo(contactDetails.primaryBusinessContact);
    const accountsFinanceContact = readContactInfo(contactDetails.accountsFinanceContact);

    const leaveTypes = readStringArray(leaveSettings.customTypes) ?? readStringArray(settings.leaveTypes);

    const governance = normalizeRecord(organization.governanceTags);
    const auditSettingsRaw = governance.audit;
    const auditSettings =
        auditSettingsRaw && typeof auditSettingsRaw === 'object' && !Array.isArray(auditSettingsRaw)
            ? (auditSettingsRaw as Record<string, unknown>)
            : {};
    const auditSource = typeof auditSettings.source === 'string' ? auditSettings.source : undefined;
    const auditBatchId = typeof auditSettings.batchId === 'string' ? auditSettings.batchId : undefined;

    const dataResidency = typeof organization.dataResidency === 'string' ? organization.dataResidency : 'UK_ONLY';
    const dataClassification =
        typeof organization.dataClassification === 'string' ? organization.dataClassification : 'OFFICIAL';

    const availablePermissions =
        readStringArray(organization.availablePermissions) ?? readStringArray(settings.availablePermissions);

    return {
        id: organization.id,
        slug: organization.slug,
        regionCode: organization.regionCode,
        dataResidency,
        dataClassification,
        auditSource: auditSource ?? 'org-repository',
        auditBatchId,
        name: organization.name,
        address: organization.address ?? readString(profile.address),
        phone: organization.phone ?? readString(profile.phone),
        website: organization.website ?? readString(profile.website),
        companyType: organization.companyType ?? readString(profile.companyType),
        incorporationDate: organization.incorporationDate
            ? organization.incorporationDate.toISOString()
            : readString(profile.incorporationDate),
        registeredOfficeAddress:
            organization.registeredOfficeAddress ?? readString(profile.registeredOfficeAddress),
        industry: organization.industry ?? readString(profile.industry),
        employeeCountRange: organization.employeeCountRange ?? readString(profile.employeeCountRange),
        primaryBusinessContact,
        accountsFinanceContact,
        leaveTypes,
        leaveEntitlements,
        primaryLeaveType,
        leaveYearStartDate,
        leaveRoundingRule,
        availablePermissions: availablePermissions ?? undefined,
        createdAt: organization.createdAt.toISOString(),
        updatedAt: organization.updatedAt.toISOString(),
    } satisfies OrganizationData;
}
