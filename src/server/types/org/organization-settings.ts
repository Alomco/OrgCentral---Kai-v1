import type { ContactInfo } from '@/server/types/leave-types';

export type { LeaveYearStartDate } from '@/server/types/org/leave-year-start-date';

export interface OrganizationContactDetails {
    primaryBusinessContact?: ContactInfo;
    accountsFinanceContact?: ContactInfo;
}
