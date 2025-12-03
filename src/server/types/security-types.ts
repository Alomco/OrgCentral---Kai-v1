import type { SecurityEvent } from './hr-types';

// DTOs and surface types for security / audit use-cases.
export interface LogSecurityEventInput {
    orgId: string;
    userId: string; // The user associated with the event (can be acting or affected)
    eventType: string; // e.g., 'login', 'failed_login', 'permission_denied', 'data_access'
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    ipAddress?: string;
    userAgent?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
}

export type LogSecurityEventRequest = Omit<LogSecurityEventInput, 'userId'>;

export interface LogSecurityEventOutput {
    success: true;
}

export type SecurityEventCreatePayload = Omit<SecurityEvent, 'id' | 'createdAt' | 'updatedAt'>;

// Zod schema for runtime validation of the LogSecurityEventInput boundary
// Keep schema next to shared types for discoverability. Use controllers/adapters
// to validate external input before forwarding to use-cases/services.
import { z } from 'zod';

const LogSecurityEventBaseSchema = z.object({
    orgId: z.string().min(1),
    eventType: z.string().min(1),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string().min(1),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    resourceId: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export const LogSecurityEventInputSchema = LogSecurityEventBaseSchema.extend({
    userId: z.string().min(1),
});

export const LogSecurityEventRequestSchema = LogSecurityEventBaseSchema;

export type LogSecurityEventInputParsed = z.infer<typeof LogSecurityEventInputSchema>;
export type LogSecurityEventRequestParsed = z.infer<typeof LogSecurityEventRequestSchema>;
