import { z } from 'zod';

const jsonSchema = z.record(z.string(), z.any()).optional().nullable();

export const invitationMetadataSchema = jsonSchema;
export const securityContextSchema = jsonSchema;

export const onboardingDataSchema = z.object({
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    email: z.string().email(),
    displayName: z.string().min(1),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    startDate: z.union([z.string(), z.date()]).optional(),
    employeeId: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    employmentType: z.string().optional(),
    salary: z.union([z.number(), z.string()]).optional().nullable(),
    payFrequency: z.string().optional(),
    managerId: z.string().optional(),
    roles: z.array(z.string()).optional(),
    payBasis: z.string().optional().nullable(),
    paySchedule: z.string().optional().nullable(),
    eligibleLeaveTypes: z.array(z.string()).optional(),
    onboardingTemplateId: z.string().optional().nullable(),
});
