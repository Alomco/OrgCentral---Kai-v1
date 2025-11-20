/**
 * Repository contract for User Sessions
 * Following SOLID principles with clear separation of concerns
 */
import type { UserSession } from '@/server/types/hr-types';

export interface IUserSessionRepository {
  /**
   * Create a new user session
   */
  createUserSession(
    tenantId: string,
    session: Omit<UserSession, 'id' | 'createdAt'>
  ): Promise<void>;

  /**
   * Update an existing user session
   */
  updateUserSession(
    tenantId: string,
    sessionId: string,
    updates: Partial<Omit<UserSession, 'id' | 'orgId' | 'userId' | 'sessionId' | 'createdAt'>>
  ): Promise<void>;

  /**
   * Get a specific user session by ID
   */
  getUserSession(
    tenantId: string,
    sessionId: string
  ): Promise<UserSession | null>;

  /**
   * Get user sessions by user ID
   */
  getUserSessionsByUser(
    tenantId: string,
    userId: string
  ): Promise<UserSession[]>;

  /**
   * Get all active user sessions for an organization
   */
  getUserSessionsByOrganization(
    tenantId: string,
    filters?: {
      isActive?: boolean;
      userId?: string;
      ipAddress?: string;
    }
  ): Promise<UserSession[]>;

  /**
   * Invalidate a specific user session
   */
  invalidateUserSession(
    tenantId: string,
    sessionId: string
  ): Promise<void>;

  /**
   * Invalidate all sessions for a specific user
   */
  invalidateUserSessionsByUser(
    tenantId: string,
    userId: string
  ): Promise<void>;

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(
    tenantId: string
  ): Promise<number>; // Returns number of sessions cleaned up
}