import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { EmployeeProfile } from '@/server/types/hr-types';
import type { PeopleListFilters } from '@/server/types/hr/people';
import { EntityNotFoundError } from '@/server/errors';

// Profile helper functions that contain the business logic

export type ProfileQueryFilters = PeopleListFilters;

/**
 * Get a specific employee profile by ID
 */
export async function getEmployeeProfile(
  profileRepository: IEmployeeProfileRepository,
  orgId: string,
  profileId: string,
): Promise<EmployeeProfile> {
  const profile = await profileRepository.getEmployeeProfile(orgId, profileId);
  
  if (!profile) {
    throw new EntityNotFoundError('EmployeeProfile', { orgId, profileId });
  }
  
  return profile;
}

/**
 * Get an employee profile by user ID
 */
export async function getEmployeeProfileByUser(
  profileRepository: IEmployeeProfileRepository,
  orgId: string,
  userId: string,
): Promise<EmployeeProfile> {
  const profile = await profileRepository.getEmployeeProfileByUser(orgId, userId);
  
  if (!profile) {
    throw new EntityNotFoundError('EmployeeProfile', { orgId, userId });
  }
  
  return profile;
}

/**
 * List employee profiles for an organization with optional filters
 */
export async function listEmployeeProfiles(
  profileRepository: IEmployeeProfileRepository,
  orgId: string,
  filters?: ProfileQueryFilters,
): Promise<EmployeeProfile[]> {
  const normalizedFilters = filters
    ? normalizeFilters(filters)
    : undefined;
  return profileRepository.getEmployeeProfilesByOrganization(orgId, normalizedFilters);
}

function normalizeFilters(filters: ProfileQueryFilters): ProfileQueryFilters {
  const start = filters.startDate ? new Date(filters.startDate) : undefined;
  const end = filters.endDate ? new Date(filters.endDate) : undefined;

  return {
    startDate: start && !Number.isNaN(start.getTime()) ? start.toISOString() : undefined,
    endDate: end && !Number.isNaN(end.getTime()) ? end.toISOString() : undefined,
  };
}

/**
 * Create a new employee profile
 */
export async function createEmployeeProfile(
  profileRepository: IEmployeeProfileRepository,
  orgId: string,
  profileData: Omit<EmployeeProfile, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>,
): Promise<EmployeeProfile> {
  const newProfile: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'> = {
    ...profileData,
    orgId,
  };

  await profileRepository.createEmployeeProfile(orgId, newProfile);
  
  // Return the profile that was created (fetch again for full data including ID)
  return getEmployeeProfileByUser(profileRepository, orgId, profileData.userId);
}

/**
 * Update an existing employee profile
 */
export async function updateEmployeeProfile(
  profileRepository: IEmployeeProfileRepository,
  orgId: string,
  profileId: string,
  updates: Partial<Omit<EmployeeProfile, 'id' | 'orgId' | 'userId' | 'createdAt' | 'employeeNumber'>>,
): Promise<EmployeeProfile> {
  await profileRepository.updateEmployeeProfile(orgId, profileId, updates);
  
  // Return updated profile
  return getEmployeeProfile(profileRepository, orgId, profileId);
}

/**
 * Delete an employee profile
 */
export async function deleteEmployeeProfile(
  profileRepository: IEmployeeProfileRepository,
  orgId: string,
  profileId: string,
): Promise<void> {
  await profileRepository.deleteEmployeeProfile(orgId, profileId);
}
