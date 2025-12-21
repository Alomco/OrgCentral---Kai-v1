/**
 * Repository contract for User Membership/Relationships
 * Following SOLID principles with clear separation of concerns
 */
import type { User } from '@/server/types/hr-types';
import type { UserData } from '@/server/types/leave-types';
import type { Membership } from '@/server/types/membership';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  userExistsByEmail(email: string): Promise<boolean>;

  /**
   * Get user data by ID for a specific tenant
   */
  getUser(
    tenantId: string,
    userId: string
  ): Promise<UserData | null>;

  /**
   * Update user memberships
   */
  updateUserMemberships(
    context: RepositoryAuthorizationContext,
    userId: string,
    memberships: Membership[]
  ): Promise<void>;

  /**
   * Add user to an organization
   */
  addUserToOrganization(
    context: RepositoryAuthorizationContext,
    userId: string,
    organizationId: string,
    organizationName: string,
    roles: string[]
  ): Promise<void>;

  /**
   * Remove user from an organization
   */
  removeUserFromOrganization(
    context: RepositoryAuthorizationContext,
    userId: string,
    organizationId: string
  ): Promise<void>;

  /**
   * Get all users in an organization
   */
  getUsersInOrganization(
    context: RepositoryAuthorizationContext,
    organizationId: string
  ): Promise<UserData[]>;
}

export type IUserMembershipRepository = IUserRepository;
