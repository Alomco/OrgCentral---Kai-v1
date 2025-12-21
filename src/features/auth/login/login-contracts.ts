import { z } from 'zod';

export const RESIDENCY_VALUES = ['UK_ONLY', 'UK_AND_EEA', 'GLOBAL_RESTRICTED'] as const;
export type ResidencyValue = (typeof RESIDENCY_VALUES)[number];

export const CLASSIFICATION_VALUES = ['PUBLIC', 'OFFICIAL', 'OFFICIAL_SENSITIVE'] as const;
export type ClassificationValue = (typeof CLASSIFICATION_VALUES)[number];

export const loginSchema = z.object({
    email: z.email('Enter a valid work email address').min(3, 'Email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    orgSlug: z
        .string()
        .min(2, 'Organization slug is required')
        .max(80, 'Organization slug is too long')
        .regex(/^[a-z0-9-]+$/, 'Slugs may contain lowercase letters, digits, and dashes.'),
    residency: z.enum(RESIDENCY_VALUES),
    classification: z.enum(CLASSIFICATION_VALUES),
    rememberMe: z.boolean().optional().default(true),
    userAgent: z.string().optional(),
});

export type LoginActionInput = z.infer<typeof loginSchema>;

export interface LoginActionSuccess {
    ok: true;
    message: string;
    redirectUrl?: string;
}

export type LoginFieldErrors = Record<string, string>;

export interface LoginActionFailure {
    ok: false;
    message: string;
    code?: string;
    fieldErrors?: LoginFieldErrors;
}

export type LoginActionResult = LoginActionSuccess | LoginActionFailure;

export function toFieldErrors(error: z.ZodError<LoginActionInput>): LoginFieldErrors {
    return error.issues.reduce<LoginFieldErrors>((accumulator, issue) => {
        const key = issue.path[0];
        if (typeof key === 'string' && !accumulator[key]) {
            accumulator[key] = issue.message;
        }
        return accumulator;
    }, {});
}
