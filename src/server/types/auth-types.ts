import type { InvitationStatus as PrismaInvitationStatus } from '@/server/types/prisma';

export type InvitationStatus = PrismaInvitationStatus;

export interface OnboardingData {
    email: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    startDate?: string | Date;
    employeeId?: string;
    position?: string;
    department?: string;
    employmentType?: string;
    salary?: number | string | null;
    payFrequency?: string;
    managerId?: string;
    roles?: string[];
    payBasis?: string | null;
    paySchedule?: string | null;
    eligibleLeaveTypes?: string[];
    onboardingTemplateId?: string | null;
}

export interface InvitationData {
    token: string;
    status: InvitationStatus;
    targetEmail: string;
    organizationId: string;
    organizationName: string;
    invitedByUid?: string;
    onboardingData: OnboardingData;
}
