/**
 * Repository contract for Security Events
 * Following SOLID principles with clear separation of concerns
 */
import type { SecurityEvent } from '@/server/types/hr-types';

export interface ISecurityEventRepository {
  /**
   * Create a new security event
   */
  createSecurityEvent(
    tenantId: string,
    event: Omit<SecurityEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  /**
   * Update an existing security event
   */
  updateSecurityEvent(
    tenantId: string,
    eventId: string,
    updates: Partial<Omit<SecurityEvent, 'id' | 'orgId' | 'userId' | 'createdAt' | 'occurredAt'>>
  ): Promise<void>;

  /**
   * Get a specific security event by ID
   */
  getSecurityEvent(
    tenantId: string,
    eventId: string
  ): Promise<SecurityEvent | null>;

  /**
   * Get security events for a specific user
   */
  getSecurityEventsByUser(
    tenantId: string,
    userId: string,
    filters?: {
      eventType?: string;
      severity?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<SecurityEvent[]>;

  /**
   * Get security events for an organization with optional filters
   */
  getSecurityEventsByOrganization(
    tenantId: string,
    filters?: {
      eventType?: string;
      severity?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<SecurityEvent[]>;

  /**
   * Mark a security event as resolved
   */
  resolveSecurityEvent(
    tenantId: string,
    eventId: string,
    resolverId: string,
    resolutionNotes?: string
  ): Promise<void>;
}