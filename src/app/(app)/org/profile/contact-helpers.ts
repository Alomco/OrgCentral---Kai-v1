import { z } from 'zod';

import type { OrganizationProfileUpdateInput } from '@/server/validators/org/organization-profile';

import { normalizeOptionalText } from './profile-form-utils';

export const contactGroupSchema = z
    .object({
        name: z.string().trim().min(1, 'Name is required').max(120).optional(),
        email: z.email('Enter a valid email address').max(254).optional(),
        phone: z.string().trim().min(1).max(64).optional(),
    })
    .strict()
    .superRefine((value, context) => {
        const hasAny = Boolean(value.name ?? value.email ?? value.phone);
        if (!hasAny) {
            return;
        }

        if (!value.name) {
            context.addIssue({ code: 'custom', message: 'Name is required', path: ['name'] });
        }
        if (!value.email) {
            context.addIssue({ code: 'custom', message: 'Email is required', path: ['email'] });
        }
    });

type ContactGroupInput = z.infer<typeof contactGroupSchema>;
export type ContactParseResult = ReturnType<typeof contactGroupSchema.safeParse>;

type ContactInfoOutput = NonNullable<OrganizationProfileUpdateInput['contactDetails']>['primaryBusinessContact'];

export function collectFieldErrors(error: z.ZodError): Partial<Record<string, string[]>> {
    const out: Partial<Record<string, string[]>> = {};
    for (const issue of error.issues) {
        const key = typeof issue.path[0] === 'string' ? issue.path[0] : undefined;
        if (!key) {
            continue;
        }
        (out[key] ??= []).push(issue.message);
    }
    return out;
}

export function readContactGroup(formData: FormData, prefix: 'primary' | 'finance'): ContactGroupInput {
    const toKey = (field: 'Name' | 'Email' | 'Phone') => `${prefix}Contact${field}`;
    return {
        name: normalizeOptionalText(formData.get(toKey('Name'))),
        email: normalizeOptionalText(formData.get(toKey('Email'))),
        phone: normalizeOptionalText(formData.get(toKey('Phone'))),
    };
}

export function assignContactErrors(
    fieldErrors: Record<string, string[]>,
    prefix: 'primary' | 'finance',
    parsed: ContactParseResult,
): void {
    if (parsed.success) {
        return;
    }
    const errors = collectFieldErrors(parsed.error);
    const toKey = (field: 'Name' | 'Email' | 'Phone') => `${prefix}Contact${field}`;

    if (errors.name?.length) {
        fieldErrors[toKey('Name')] = errors.name;
    }
    if (errors.email?.length) {
        fieldErrors[toKey('Email')] = errors.email;
    }
    if (errors.phone?.length) {
        fieldErrors[toKey('Phone')] = errors.phone;
    }
}

export function buildContactDetails(
    primaryParsed: ContactParseResult,
    financeParsed: ContactParseResult,
    hasAnyContactInput: boolean,
): OrganizationProfileUpdateInput['contactDetails'] {
    if (!hasAnyContactInput) {
        return null;
    }
    return {
        primaryBusinessContact: toContactInfo(primaryParsed),
        accountsFinanceContact: toContactInfo(financeParsed),
    };
}

function toContactInfo(parsed: ContactParseResult): ContactInfoOutput | undefined {
    if (!parsed.success) {
        return undefined;
    }
    const { name, email, phone } = parsed.data;
    if (!name || !email) {
        return undefined;
    }
    return phone ? { name, email, phone } : { name, email };
}
