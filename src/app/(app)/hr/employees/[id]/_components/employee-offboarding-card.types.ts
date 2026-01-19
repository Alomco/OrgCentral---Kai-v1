import type { ChecklistInstanceStatus } from '@/server/types/onboarding-types';

export interface ChecklistProgressInfo {
    completed: number;
    total: number;
    percent: number;
    status: ChecklistInstanceStatus | null;
}
