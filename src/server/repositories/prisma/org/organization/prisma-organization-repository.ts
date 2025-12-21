import { Prisma } from '@prisma/client';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type {
    CreateOrganizationInput,
    OrganizationProfileUpdate,
} from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { OrganizationData } from '@/server/types/leave-types';
import { OrgScopedPrismaRepository } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { mapOrganizationToData } from '@/server/repositories/mappers/org/organization-mapper';
import type { LeaveYearStartDate, OrganizationContactDetails } from '@/server/types/org/organization-settings';
import { normalizeLeaveYearStartDate } from '@/server/types/org/leave-year-start-date';

const ORGANIZATION_NOT_FOUND_MESSAGE = 'Organization not found';

function parseMonthDayToAnchorDate(value: LeaveYearStartDate): Date {
    const match = /^\d{2}-\d{2}$/.exec(value);
    if (!match) {
        throw new Error('leaveYearStartDate must be MM-DD');
    }

    // Anchor year is arbitrary; we only care about month/day.
    // Use UTC to avoid timezone drift.
    return new Date(`2000-${value}T00:00:00.000Z`);
}

function normalizeLeaveRoundingRule(value: string): string {
    if (value === 'nearest_half') {
        return 'half_day';
    }
    if (value === 'round_up') {
        return 'full_day';
    }
    return value;
}

function parseIncorporationDate(value: string): Date | null {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export class PrismaOrganizationRepository
    extends OrgScopedPrismaRepository
    implements IOrganizationRepository {

    async getOrganization(orgId: string): Promise<OrganizationData | null> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        return organization ? mapOrganizationToData(organization) : null;
    }

    async getOrganizationBySlug(slug: string): Promise<OrganizationData | null> {
        const organization = await this.prisma.organization.findUnique({ where: { slug } });
        return organization ? mapOrganizationToData(organization) : null;
    }

    async getLeaveEntitlements(orgId: string): Promise<Record<string, number>> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            return {};
        }

        const settings = (organization.settings as Record<string, unknown> | null) ?? {};
        const leaveSettings = (settings.leave as Record<string, unknown> | undefined) ?? {};
        const entitlements = leaveSettings.entitlements as Record<string, number> | undefined;

        return entitlements ?? {};
    }

    async updateLeaveSettings(
        orgId: string,
        settings: {
            leaveEntitlements: Record<string, number>;
            primaryLeaveType: string;
            leaveYearStartDate: string;
            leaveRoundingRule: string;
        },
    ): Promise<void> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            throw new Error(ORGANIZATION_NOT_FOUND_MESSAGE);
        }

        const currentSettings = (organization.settings as Record<string, unknown> | null) ?? {};
        const leaveYearStartDate = normalizeLeaveYearStartDate(settings.leaveYearStartDate);
        const leaveRoundingRule = normalizeLeaveRoundingRule(settings.leaveRoundingRule);
        const anchoredStartDate = parseMonthDayToAnchorDate(leaveYearStartDate);

        await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                primaryLeaveType: settings.primaryLeaveType,
                leaveYearStartDate: anchoredStartDate,
                settings: {
                    ...currentSettings,
                    leave: {
                        ...(currentSettings.leave as Record<string, unknown> | undefined),
                        entitlements: settings.leaveEntitlements,
                        primaryLeaveType: settings.primaryLeaveType,
                        leaveYearStartDate,
                        leaveRoundingRule,
                    },
                },
            },
        });
    }

    async updateOrganizationProfile(orgId: string, updates: OrganizationProfileUpdate): Promise<OrganizationData> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            throw new Error(ORGANIZATION_NOT_FOUND_MESSAGE);
        }

        const incorporationDate =
            updates.incorporationDate === undefined
                ? undefined
                : updates.incorporationDate === null
                    ? null
                    : parseIncorporationDate(updates.incorporationDate);

        if (updates.incorporationDate && !incorporationDate) {
            throw new Error('Invalid incorporationDate value');
        }

        const next = await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                name: updates.name ?? undefined,
                address: updates.address === undefined ? undefined : updates.address,
                phone: updates.phone === undefined ? undefined : updates.phone,
                website: updates.website === undefined ? undefined : updates.website,
                companyType: updates.companyType === undefined ? undefined : updates.companyType,
                industry: updates.industry === undefined ? undefined : updates.industry,
                employeeCountRange:
                    updates.employeeCountRange === undefined ? undefined : updates.employeeCountRange,
                incorporationDate,
                registeredOfficeAddress:
                    updates.registeredOfficeAddress === undefined ? undefined : updates.registeredOfficeAddress,
                contactDetails:
                    updates.contactDetails === undefined
                        ? undefined
                        : updates.contactDetails === null
                            ? Prisma.JsonNull
                            : (updates.contactDetails as unknown as OrganizationContactDetails as Prisma.InputJsonValue),
            },
        });

        return mapOrganizationToData(next);
    }

    async createOrganization(input: CreateOrganizationInput): Promise<OrganizationData> {
        const created = await this.prisma.organization.create({
            data: {
                slug: input.slug,
                name: input.name,
                regionCode: input.regionCode,
                tenantId: input.tenantId,
                dataResidency: input.dataResidency ?? 'UK_ONLY',
                dataClassification: input.dataClassification ?? 'OFFICIAL',
                settings: {},
            },
        });
        return mapOrganizationToData(created);
    }

    async addCustomLeaveType(orgId: string, leaveType: string): Promise<void> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            throw new Error(ORGANIZATION_NOT_FOUND_MESSAGE);
        }

        const settings = (organization.settings as Record<string, unknown> | null) ?? {};
        const leaveSettings = ((settings.leave as Record<string, unknown> | undefined) ?? {}) as {
            customTypes?: string[];
        };

        const customTypes = new Set(leaveSettings.customTypes ?? []);
        customTypes.add(leaveType);

        await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                settings: {
                    ...settings,
                    leave: {
                        ...leaveSettings,
                        customTypes: Array.from(customTypes),
                    },
                },
            },
        });
    }

    async removeLeaveType(orgId: string, leaveTypeKey: string): Promise<void> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            throw new Error('Organization not found');
        }

        const settings = (organization.settings as Record<string, unknown> | null) ?? {};
        const leaveSettings = ((settings.leave as Record<string, unknown> | undefined) ?? {}) as {
            customTypes?: string[];
            entitlements?: Record<string, number>;
        };

        const customTypes = new Set(leaveSettings.customTypes ?? []);
        customTypes.delete(leaveTypeKey);

        const entitlements = { ...(leaveSettings.entitlements ?? {}) };
        const { [leaveTypeKey]: removed, ...remainingEntitlements } = entitlements;
        void removed;

        await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                settings: {
                    ...settings,
                    leave: {
                        ...leaveSettings,
                        customTypes: Array.from(customTypes),
                        entitlements: remainingEntitlements,
                    },
                },
            },
        });
    }
}
