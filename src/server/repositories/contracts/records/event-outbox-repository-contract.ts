import type { EventOutbox } from '@prisma/client';
import type { EventOutboxFilters, EventOutboxCreationData, EventOutboxUpdateData } from '@/server/repositories/prisma/records/events/prisma-event-outbox-repository.types';

export interface IEventOutboxRepository {
    findById(id: string): Promise<EventOutbox | null>;
    findAll(filters?: EventOutboxFilters): Promise<EventOutbox[]>;
    findPendingEvents(limit?: number): Promise<EventOutbox[]>;
    findFailedEvents(limit?: number): Promise<EventOutbox[]>;
    create(data: EventOutboxCreationData): Promise<EventOutbox>;
    update(id: string, data: EventOutboxUpdateData): Promise<EventOutbox>;
    markAsProcessing(id: string): Promise<EventOutbox>;
    markAsProcessed(id: string): Promise<EventOutbox>;
    markAsFailed(id: string, error?: string): Promise<EventOutbox>;
    delete(id: string): Promise<EventOutbox>;
    cleanupProcessedEvents(orgId: string, olderThan: Date): Promise<number>;
}
