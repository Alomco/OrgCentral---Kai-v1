import type { IOrganizationRepository, CreateOrganizationInput, OrganizationProfileUpdate } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import { normalizeLeaveYearStartDate, type LeaveYearStartDate } from '@/server/types/org/leave-year-start-date';
import type { OrganizationData } from '@/server/types/leave-types';
import type { PrismaInputJsonObject } from '@/server/types/prisma';

const resolveValue = <T>(value: T): Promise<T> => Promise.resolve(value);
const resolveVoid = (): Promise<void> => Promise.resolve();

export class FakeOrganizationRepository implements IOrganizationRepository {
    getOrganization(orgId: string): Promise<OrganizationData | null> {
        return resolveValue({
            id: orgId,
            slug: `slug-${orgId}`,
            regionCode: 'UK-LON',
            dataResidency: 'UK_ONLY',
            dataClassification: 'OFFICIAL',
            auditSource: 'test',
            auditBatchId: undefined,
            name: 'Org One',
            leaveEntitlements: { annual: 25 },
            primaryLeaveType: 'annual',
            leaveYearStartDate: normalizeLeaveYearStartDate('2025-01-01'),
            leaveRoundingRule: 'full_day',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    getOrganizationBySlug(slug: string): Promise<OrganizationData | null> {
        const orgId = slug.replace('slug-', '') || 'org-1';
        return this.getOrganization(orgId);
    }

    getLeaveEntitlements(orgId: string): Promise<Record<string, number>> {
        void orgId;
        return resolveValue({});
    }

    updateLeaveSettings(
        orgId: string,
        settings: {
            leaveEntitlements: Record<string, number>;
            primaryLeaveType: string;
            leaveYearStartDate: LeaveYearStartDate;
            leaveRoundingRule: string;
        },
    ): Promise<void> {
        void orgId;
        void settings;
        return resolveVoid();
    }

    async updateOrganizationProfile(orgId: string, updates: OrganizationProfileUpdate): Promise<OrganizationData> {
        const org = await this.getOrganization(orgId);
        if (!org) {
            throw new Error('Organization not found');
        }
        return {
            ...org,
            name: updates.name ?? org.name,
            address: updates.address === null ? undefined : updates.address ?? org.address,
            phone: updates.phone === null ? undefined : updates.phone ?? org.phone,
            website: updates.website === null ? undefined : updates.website ?? org.website,
            companyType: updates.companyType === null ? undefined : updates.companyType ?? org.companyType,
            industry: updates.industry === null ? undefined : updates.industry ?? org.industry,
            employeeCountRange:
                updates.employeeCountRange === null ? undefined : updates.employeeCountRange ?? org.employeeCountRange,
            incorporationDate:
                updates.incorporationDate === null ? undefined : updates.incorporationDate ?? org.incorporationDate,
            registeredOfficeAddress:
                updates.registeredOfficeAddress === null ? undefined : updates.registeredOfficeAddress ?? org.registeredOfficeAddress,
        };
    }

    createOrganization(input: CreateOrganizationInput): Promise<OrganizationData> {
        return resolveValue({
            id: 'org-created',
            slug: input.slug,
            name: input.name,
            regionCode: 'UK-LON',
            dataResidency: input.dataResidency ?? 'UK_ONLY',
            dataClassification: input.dataClassification ?? 'OFFICIAL',
            auditSource: 'test',
            auditBatchId: undefined,
            leaveEntitlements: { annual: 25 },
            primaryLeaveType: 'annual',
            leaveYearStartDate: normalizeLeaveYearStartDate('2025-01-01'),
            leaveRoundingRule: 'full_day',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }

    addCustomLeaveType(orgId: string, leaveType: string): Promise<void> {
        void orgId;
        void leaveType;
        return resolveVoid();
    }

    removeLeaveType(orgId: string, leaveTypeKey: string): Promise<void> {
        void orgId;
        void leaveTypeKey;
        return resolveVoid();
    }

    getOrganizationSettings(orgId: string): Promise<PrismaInputJsonObject | null> {
        void orgId;
        return resolveValue({} as PrismaInputJsonObject);
    }

    updateOrganizationSettings(orgId: string, settings: PrismaInputJsonObject): Promise<void> {
        void orgId;
        void settings;
        return resolveVoid();
    }
}
