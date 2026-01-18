import { z } from 'zod';

export const onboardingInviteSchema = z.object({
    email: z.email(),
    displayName: z.string().trim().min(1).max(120),
    firstName: z.string().trim().min(1).max(120).optional(),
    lastName: z.string().trim().min(1).max(120).optional(),
    employeeNumber: z.string().trim().min(1).max(64),
    jobTitle: z.string().trim().max(120).optional(),
    departmentId: z.uuid().optional(),
    employmentType: z.string().trim().max(60).optional(),
    startDate: z.string().trim().optional(),
    managerEmployeeNumber: z.string().trim().max(64).optional(),
    annualSalary: z.coerce.number().min(0).optional(),
    hourlyRate: z.coerce.number().min(0).optional(),
    salaryCurrency: z.string().trim().max(8).optional(),
    salaryBasis: z.enum(['ANNUAL', 'HOURLY']).optional(),
    paySchedule: z.enum(['MONTHLY', 'BI_WEEKLY']).optional(),
    eligibleLeaveTypes: z.array(z.string().trim().min(1)).max(20).optional(),
    onboardingTemplateId: z.uuid().nullable().optional(),
    roles: z.array(z.string().trim().min(1)).max(10).optional(),
});

export type OnboardingInvitePayload = z.infer<typeof onboardingInviteSchema>;
