import type { EmploymentContract } from '@/server/types/hr-types';
import {
  mapDomainEmploymentContractToPrisma,
  mapDomainEmploymentContractToPrismaUpdate,
  mapPrismaEmploymentContractToDomain,
} from '@/server/repositories/mappers/hr/people/employment-contract-mapper';
import {
  buildPrismaCreateFromDomain as buildPrismaProfileCreateFromDomain,
  buildPrismaUpdateFromDomain as buildPrismaProfileUpdateFromDomain,
  mapPrismaEmployeeProfileToDomain,
} from '@/server/repositories/mappers/hr/people/employee-profile-mapper';
import type { EmployeeProfileDTO } from '@/server/types/hr/people';

// Lightweight wrappers to keep use-cases free of Prisma-specific types
export const toPrismaProfileCreate = buildPrismaProfileCreateFromDomain;
export const toPrismaProfileUpdate = buildPrismaProfileUpdateFromDomain;
export const toDomainProfile = mapPrismaEmployeeProfileToDomain;

export const toPrismaContractCreate = mapDomainEmploymentContractToPrisma;
export const toPrismaContractUpdate = mapDomainEmploymentContractToPrismaUpdate;
export const toDomainContract = mapPrismaEmploymentContractToDomain;

export type ProfileCreateInput = Omit<EmployeeProfileDTO, 'id' | 'createdAt' | 'updatedAt'>;
export type ContractCreateInput = Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt'>;
