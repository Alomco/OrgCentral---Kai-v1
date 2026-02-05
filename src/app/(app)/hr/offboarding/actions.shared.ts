import { z } from 'zod';
import type { OffboardingMode } from '@/server/use-cases/hr/offboarding/start-offboarding';

export interface OffboardingActionState {
    status: 'idle' | 'success' | 'error';
    message?: string;
}

export const startSchema = z.object({
    profileId: z.uuid(),
    mode: z.enum(['DIRECT', 'CHECKLIST']),
    templateId: z.uuid().optional(),
    reason: z.string().min(1).max(500),
});

export const completeSchema = z.object({
    offboardingId: z.uuid(),
});

export const cancelSchema = z.object({
    offboardingId: z.uuid(),
    reason: z.string().max(500).optional(),
});

export const EMPLOYEES_PATH = '/hr/employees';
export const OFFBOARDING_PATH = '/hr/offboarding';

export function readFormString(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === 'string' ? value.trim() : '';
}

export type { OffboardingMode };
