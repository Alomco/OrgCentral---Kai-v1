/**
 * Central registry for HR resource and action identifiers.
 * Keeps ABAC/RBAC wiring consistent and type-safe across modules.
 */
export const HR_RESOURCE = {
    TIME_ENTRY: 'hr.time-entry',
    HR_SETTINGS: 'hr.settings',
    HR_POLICY: 'hr.policies.policy',
    HR_LEAVE_POLICY: 'hr.leavePolicies.policy',
    HR_LEAVE: 'hr.leave',
    HR_LEAVE_BALANCE: 'hr.leave.balance',
    HR_ABSENCE: 'hr.absence',
    HR_ABSENCE_SETTINGS: 'hr.absence-settings',
    HR_ABSENCE_AI_VALIDATION: 'hr.absence-ai-validation',
    HR_ONBOARDING: 'hr.onboarding',
    HR_EMPLOYEE_PROFILE: 'employeeProfile',
    HR_EMPLOYMENT_CONTRACT: 'employmentContract',
    HR_CHECKLIST_TEMPLATE: 'checklistTemplate',
    HR_TRAINING: 'hr.training',
    HR_NOTIFICATION: 'notification',
    HR_COMPLIANCE: 'hr.compliance',
    HR_PERFORMANCE: 'hr.performance',
} as const;

export type HrResourceType = (typeof HR_RESOURCE)[keyof typeof HR_RESOURCE];

export const HR_ACTION = {
    READ: 'read',
    LIST: 'list',
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    APPROVE: 'approve',
    ACKNOWLEDGE: 'acknowledge',
    ASSIGN: 'assign',
    CANCEL: 'cancel',
} as const;

export type HrAction = (typeof HR_ACTION)[keyof typeof HR_ACTION];

export function isHrResourceType(value: string): value is HrResourceType {
    return (Object.values(HR_RESOURCE) as string[]).includes(value);
}

export function isHrAction(value: string): value is HrAction {
    return (Object.values(HR_ACTION) as string[]).includes(value);
}
