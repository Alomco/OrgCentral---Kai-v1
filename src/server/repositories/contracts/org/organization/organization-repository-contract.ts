/**
 * Repository contract for Organization data
 * Following SOLID principles with clear separation of concerns
 */
import type { OrganizationData } from '@/server/types/leave-types';

export interface IOrganizationRepository {
    /**
     * Get organization data by ID
     */
    getOrganization(orgId: string): Promise<OrganizationData | null>;

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
            leaveYearStartDate: string;
            leaveRoundingRule: string;
        },
    ): Promise<void>;

    /**
     * Create a custom leave type
     */
    addCustomLeaveType(orgId: string, leaveType: string): Promise<void>;

    /**
     * Remove a leave type
     */
    removeLeaveType(orgId: string, leaveTypeKey: string): Promise<void>;
}
