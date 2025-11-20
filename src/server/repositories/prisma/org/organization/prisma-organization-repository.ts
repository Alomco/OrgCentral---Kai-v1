import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type { OrganizationData } from '@/server/types/leave-types';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type { PrismaClient } from '@prisma/client';
import { OrgScopedPrismaRepository } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';

export class PrismaOrganizationRepository
    extends OrgScopedPrismaRepository
    implements IOrganizationRepository {
    constructor(prisma: PrismaClient) {
        super({ prisma });
    }

    async getOrganization(orgId: string): Promise<OrganizationData | null> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            return null;
        }

        const settings = (organization.settings as Record<string, unknown> | null) ?? {};
        const leaveSettings = (settings.leave as Record<string, unknown> | undefined) ?? {};

        const governance = (organization.governanceTags as Record<string, unknown> | null) ?? {};
        const auditSettings = (governance.audit as Record<string, unknown> | undefined) ?? {};

        return {
            id: organization.id,
            dataResidency: organization.dataResidency as DataResidencyZone,
            dataClassification: organization.dataClassification as DataClassificationLevel,
            auditSource: (auditSettings.source as string | undefined) ?? 'org-repository',
            auditBatchId: auditSettings.batchId as string | undefined,
            name: organization.name,
            leaveEntitlements: (leaveSettings.entitlements as Record<string, number>) ?? {},
            primaryLeaveType: (leaveSettings.primaryLeaveType as string) ?? 'annual',
            leaveYearStartDate: (leaveSettings.leaveYearStartDate as string) ?? '01-01',
            leaveRoundingRule: (leaveSettings.leaveRoundingRule as OrganizationData['leaveRoundingRule']) ?? 'full_day',
            createdAt: organization.createdAt.toISOString(),
            updatedAt: organization.updatedAt.toISOString(),
        } as OrganizationData;
    }

    async getLeaveEntitlements(orgId: string): Promise<Record<string, number>> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            return {};
        }

        const settings = (organization.settings as Record<string, unknown> | null) ?? {};
        const leaveSettings = (settings.leave as Record<string, unknown> | undefined) ?? {};

        return (leaveSettings.entitlements as Record<string, number>) ?? {};
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
            throw new Error('Organization not found');
        }

        const currentSettings = (organization.settings as Record<string, unknown> | null) ?? {};

        await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                settings: {
                    ...currentSettings,
                    leave: {
                        ...(currentSettings.leave as Record<string, unknown> | undefined),
                        entitlements: settings.leaveEntitlements,
                        primaryLeaveType: settings.primaryLeaveType,
                        leaveYearStartDate: settings.leaveYearStartDate,
                        leaveRoundingRule: settings.leaveRoundingRule,
                    },
                },
            },
        });
    }

    async addCustomLeaveType(orgId: string, leaveType: string): Promise<void> {
        const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!organization) {
            throw new Error('Organization not found');
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
        delete entitlements[leaveTypeKey];

        await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                settings: {
                    ...settings,
                    leave: {
                        ...leaveSettings,
                        customTypes: Array.from(customTypes),
                        entitlements,
                    },
                },
            },
        });
    }
}
