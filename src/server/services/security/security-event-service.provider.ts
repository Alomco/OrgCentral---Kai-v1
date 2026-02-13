import { randomUUID } from 'node:crypto';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EnhancedSecurityEvent } from '@/server/types/enhanced-security-types';
import type { ISecurityEventRepository } from '@/server/repositories/contracts/security/enhanced-security-repository-contracts';
import { createEnhancedSecurityEventRepository } from '@/server/repositories/providers/security/enhanced-security-event-repository-provider';
import type { SecurityEventServiceDependencies } from './security-event-service';
import { SecurityEventService } from './security-event-service';

class InMemorySecurityEventRepository implements ISecurityEventRepository {
    private readonly events: EnhancedSecurityEvent[] = [];

    createEvent(
        context: RepositoryAuthorizationContext,
        event: Omit<EnhancedSecurityEvent, 'id' | 'createdAt' | 'updatedAt'>,
    ): Promise<EnhancedSecurityEvent> {
        const { resolved, resolvedAt, resolvedBy, ...rest } = event;
        const record: EnhancedSecurityEvent = {
            ...rest,
            id: randomUUID(),
            createdAt: new Date(),
            resolved: resolved,
            resolvedAt: resolvedAt ?? null,
            resolvedBy: resolvedBy ?? null,
            tenantScope: context.tenantScope,
            dataClassification: context.dataClassification,
            dataResidency: context.dataResidency,
        };
        this.events.push(record);
        return Promise.resolve(record);
    }

    getEvent(context: RepositoryAuthorizationContext, eventId: string): Promise<EnhancedSecurityEvent | null> {
        const found = this.events.find((event) => event.id === eventId && event.orgId === context.orgId);
        return Promise.resolve(found ?? null);
    }

    getEventsByOrg(
        context: RepositoryAuthorizationContext,
        filters?: { startDate?: Date; endDate?: Date; severity?: string; eventType?: string; limit?: number; offset?: number },
    ): Promise<EnhancedSecurityEvent[]> {
        const filtered = this.events
            .filter((event) => event.orgId === context.orgId)
            .filter((event) => (filters?.severity ? event.severity === filters.severity : true))
            .filter((event) => (filters?.eventType ? event.eventType === filters.eventType : true))
            .filter((event) => (filters?.startDate ? event.createdAt >= filters.startDate : true))
            .filter((event) => (filters?.endDate ? event.createdAt <= filters.endDate : true));

        return Promise.resolve(
            filtered.slice(filters?.offset ?? 0, (filters?.offset ?? 0) + (filters?.limit ?? filtered.length)),
        );
    }

    countEventsByOrg(
        context: RepositoryAuthorizationContext,
        filters?: { startDate?: Date; endDate?: Date; severity?: string; eventType?: string },
    ): Promise<number> {
        const filtered = this.events
            .filter((event) => event.orgId === context.orgId)
            .filter((event) => (filters?.severity ? event.severity === filters.severity : true))
            .filter((event) => (filters?.eventType ? event.eventType === filters.eventType : true))
            .filter((event) => (filters?.startDate ? event.createdAt >= filters.startDate : true))
            .filter((event) => (filters?.endDate ? event.createdAt <= filters.endDate : true));

        return Promise.resolve(filtered.length);
    }
}

const defaultDependencies: SecurityEventServiceDependencies = {
    securityEventRepository: new InMemorySecurityEventRepository(),
};

let sharedService: SecurityEventService | null = null;
let sharedEnhancedService: SecurityEventService | null = null;

export function getSecurityEventService(
    overrides?: Partial<SecurityEventServiceDependencies>,
): SecurityEventService {
    if (!sharedService || overrides) {
        const dependencies: SecurityEventServiceDependencies = {
            ...defaultDependencies,
            ...(overrides ?? {}),
        };

        if (!overrides) {
            sharedService = new SecurityEventService(dependencies);
            return sharedService;
        }

        return new SecurityEventService(dependencies);
    }

    return sharedService;
}

export function getEnhancedSecurityEventService(
    overrides?: Partial<SecurityEventServiceDependencies>,
): SecurityEventService {
    if (!sharedEnhancedService || overrides) {
        const dependencies: SecurityEventServiceDependencies = {
            securityEventRepository: createEnhancedSecurityEventRepository(),
            ...(overrides ?? {}),
        };

        if (!overrides) {
            sharedEnhancedService = new SecurityEventService(dependencies);
            return sharedEnhancedService;
        }

        return new SecurityEventService(dependencies);
    }

    return sharedEnhancedService;
}

export type SecurityEventServiceContract = Pick<SecurityEventService, 'logSecurityEvent' | 'getSecurityEvent' | 'getSecurityEventsByOrg' | 'countSecurityEventsByOrg'>;
