import type { LogSecurityEventInput, LogSecurityEventOutput } from '@/server/types/security-types';
import {
    getSecurityEventService,
    type SecurityEventService,
} from '@/server/services/auth/security-event-service';

export interface RecordSecurityEventOptions {
    service?: SecurityEventService;
}

export async function recordSecurityEvent(
    input: LogSecurityEventInput,
    options?: RecordSecurityEventOptions,
): Promise<LogSecurityEventOutput> {
    const service = options?.service ?? getSecurityEventService();
    return service.logEvent(input);
}
