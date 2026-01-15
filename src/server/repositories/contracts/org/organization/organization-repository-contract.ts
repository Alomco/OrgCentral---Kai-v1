/**
 * Repository contract for Organization data
 * Following SOLID principles with clear separation of concerns
 */
import type { OrganizationData } from '@/server/types/leave-types';
import type { PrismaInputJsonObject } from '@/server/types/prisma';
import type { LeaveYearStartDate } from '@/server/types/org/leave-year-start-date';
import type { OrganizationContactDetails } from '@/server/types/org/organization-settings';

export interface OrganizationProfileUpdate {
    name?: string;
    address?: string | null;
    phone?: string | null;
    website?: string | null;
    companyType?: string | null;
    industry?: string | null;
    employeeCountRange?: string | null;
    incorporationDate?: string | null; // ISO date
    registeredOfficeAddress?: string | null;
    contactDetails?: OrganizationContactDetails | null;
}

export interface CreateOrganizationInput {
    slug: string;
    name: string;
    regionCode: string;
    tenantId: string;
    dataResidency?: OrganizationData['dataResidency'];
    dataClassification?: OrganizationData['dataClassification'];
}

export interface IOrganizationRepository {
    /**
     * Get organization data by ID
     */
    getOrganization(orgId: string): Promise<OrganizationData | null>;

    /**
     * Get organization data by slug
     */
    getOrganizationBySlug(slug: string): Promise<OrganizationData | null>;

    /**
     * Get leave entitlements for an organization
     */
    getLeaveEntitlements(orgId: string): Promise<Record<string, number>>;

    /**
     * Update organization leave settings
     */
    updateLeaveSettings(
        orgId: string,
        settings: {
            leaveEntitlements: Record<string, number>;
            primaryLeaveType: string;
            leaveYearStartDate: LeaveYearStartDate;
            leaveRoundingRule: string;
        },
    ): Promise<void>;

    /**
     * Update organization profile/settings fields
     */
    updateOrganizationProfile(orgId: string, updates: OrganizationProfileUpdate): Promise<OrganizationData>;

    /**
     * Create an organization (platform/self-signup provisioning)
     */
    createOrganization(input: CreateOrganizationInput): Promise<OrganizationData>;

    /**
     * Create a custom leave type
     */
    addCustomLeaveType(orgId: string, leaveType: string): Promise<void>;

    /**
     * Remove a leave type
     */
    removeLeaveType(orgId: string, leaveTypeKey: string): Promise<void>;

    getOrganizationSettings(orgId: string): Promise<PrismaInputJsonObject | null>;
    updateOrganizationSettings(orgId: string, settings: PrismaInputJsonObject): Promise<void>;
}
