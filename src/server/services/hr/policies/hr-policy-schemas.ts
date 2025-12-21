import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DATA_CLASSIFICATION_LEVELS, DATA_RESIDENCY_ZONES } from '@/server/types/tenant';

export const POLICY_CATEGORY_VALUES = [
    'HR_POLICIES',
    'CODE_OF_CONDUCT',
    'HEALTH_SAFETY',
    'IT_SECURITY',
    'BENEFITS',
    'PROCEDURES',
    'COMPLIANCE',
    'OTHER',
] as const;

const POLICY_ID_UUID_MESSAGE = 'policyId must be a valid UUID.';
const USER_ID_UUID_MESSAGE = 'userId must be a valid UUID.';

const dateInputSchema = z.coerce.date();

const isJsonValue = (value: unknown): value is Prisma.JsonValue => {
    if (value === null) {
        return true;
    }

    const valueType = typeof value;

    if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
        return true;
    }

    if (Array.isArray(value)) {
        return value.every(isJsonValue);
    }

    if (valueType === 'object') {
        return Object.values(value as Record<string, unknown>).every(isJsonValue);
    }

    return false;
};

const jsonValueSchema = z.custom<Prisma.JsonValue>((value) => isJsonValue(value), {
    message: 'Invalid JSON value.',
});

const policyBaseSchema = z
    .object({
        title: z.string('Policy title is required.').min(1, 'Policy title is required.'),
        content: z.string('Policy content is required.').min(1, 'Policy content is required.'),
        category: z.enum(POLICY_CATEGORY_VALUES, 'Policy category is required.'),
        version: z.string('Policy version is required.').min(1, 'Policy version is required.'),
        effectiveDate: dateInputSchema,
        expiryDate: dateInputSchema.nullable().optional(),
        applicableRoles: jsonValueSchema.optional(),
        applicableDepartments: jsonValueSchema.optional(),
        requiresAcknowledgment: z.boolean('requiresAcknowledgment is required.'),
        status: z.string().min(1, 'status cannot be empty.').optional(),
        dataClassification: z.enum(DATA_CLASSIFICATION_LEVELS, 'dataClassification is required.'),
        residencyTag: z.enum(DATA_RESIDENCY_ZONES, 'residencyTag is required.'),
        metadata: jsonValueSchema.optional(),
    })
    .superRefine((value, context) => {
        if (value.expiryDate) {
            const effective = value.effectiveDate;
            const expiry = value.expiryDate;

            if (expiry.getTime() < effective.getTime()) {
                context.addIssue({
                    code: 'custom',
                    path: ['expiryDate'],
                    message: 'expiryDate cannot be before effectiveDate.',
                });
            }
        }
    });

export const createHrPolicyPayloadSchema = z.object({
    policy: policyBaseSchema,
});

export const updateHrPolicyPayloadSchema = z
    .object({
        policyId: z.uuid({ message: POLICY_ID_UUID_MESSAGE }),
        updates: policyBaseSchema.partial(),
    })
    .superRefine((value, context) => {
        const hasUpdates = Object.keys(value.updates).length > 0;
        if (!hasUpdates) {
            context.addIssue({
                code: 'custom',
                path: ['updates'],
                message: 'At least one update field is required.',
            });
        }

        if (value.updates.expiryDate && value.updates.effectiveDate) {
            const effective = new Date(value.updates.effectiveDate);
            const expiry = new Date(value.updates.expiryDate);
            if (!Number.isNaN(effective.getTime()) && !Number.isNaN(expiry.getTime())) {
                if (expiry.getTime() < effective.getTime()) {
                    context.addIssue({
                        code: 'custom',
                        path: ['updates', 'expiryDate'],
                        message: 'expiryDate cannot be before effectiveDate.',
                    });
                }
            }
        }
    });

const STATUS_EMPTY_MESSAGE = 'status cannot be empty.';
const CATEGORY_INVALID_MESSAGE = 'category is invalid.';
const VERSION_REQUIRED_MESSAGE = 'version is required.';
const IP_REQUIRED_MESSAGE = 'ipAddress cannot be empty.';

export const listHrPoliciesPayloadSchema = z.object({
    filters: z
        .object({
            status: z.string().min(1, STATUS_EMPTY_MESSAGE).optional(),
            category: z.enum(POLICY_CATEGORY_VALUES, CATEGORY_INVALID_MESSAGE).optional(),
        })
        .optional(),
});

export const getHrPolicyPayloadSchema = z.object({
    policyId: z.uuid({ message: POLICY_ID_UUID_MESSAGE }),
});

export const acknowledgeHrPolicyPayloadSchema = z.object({
    userId: z.uuid({ message: USER_ID_UUID_MESSAGE }),
    policyId: z.uuid({ message: POLICY_ID_UUID_MESSAGE }),
    version: z.string(VERSION_REQUIRED_MESSAGE).min(1, VERSION_REQUIRED_MESSAGE),
    acknowledgedAt: dateInputSchema.optional(),
    ipAddress: z.string().min(1, IP_REQUIRED_MESSAGE).nullable().optional(),
    metadata: jsonValueSchema.optional(),
});

export const getHrPolicyAcknowledgmentPayloadSchema = z.object({
    userId: z.uuid({ message: USER_ID_UUID_MESSAGE }),
    policyId: z.uuid({ message: POLICY_ID_UUID_MESSAGE }),
});

export const listPolicyAcknowledgmentsPayloadSchema = z.object({
    policyId: z.uuid({ message: POLICY_ID_UUID_MESSAGE }),
    version: z.string(VERSION_REQUIRED_MESSAGE).min(1, VERSION_REQUIRED_MESSAGE).optional(),
});

export const assignHrPolicyPayloadSchema = z
    .object({
        policyId: z.uuid({ message: POLICY_ID_UUID_MESSAGE }),
        assignment: z.object({
            applicableRoles: z.array(z.string().min(1, 'role cannot be empty.')).optional(),
            applicableDepartments: z.array(z.string().min(1, 'department cannot be empty.')).optional(),
            requiresAcknowledgment: z.boolean().optional(),
        }),
    })
    .superRefine((value, context) => {
        const hasUpdates = Object.keys(value.assignment).length > 0;
        if (!hasUpdates) {
            context.addIssue({
                code: 'custom',
                path: ['assignment'],
                message: 'At least one assignment field is required.',
            });
        }
    });

export type CreateHrPolicyPayload = z.infer<typeof createHrPolicyPayloadSchema>;
export type UpdateHrPolicyPayload = z.infer<typeof updateHrPolicyPayloadSchema>;
export type ListHrPoliciesPayload = z.infer<typeof listHrPoliciesPayloadSchema>;
export type GetHrPolicyPayload = z.infer<typeof getHrPolicyPayloadSchema>;
export type AcknowledgeHrPolicyPayload = z.infer<typeof acknowledgeHrPolicyPayloadSchema>;
export type GetHrPolicyAcknowledgmentPayload = z.infer<typeof getHrPolicyAcknowledgmentPayloadSchema>;
export type ListPolicyAcknowledgmentsPayload = z.infer<typeof listPolicyAcknowledgmentsPayloadSchema>;
export type AssignHrPolicyPayload = z.infer<typeof assignHrPolicyPayloadSchema>;
