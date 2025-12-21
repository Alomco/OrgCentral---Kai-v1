import { z } from 'zod';
import {
  contractListFiltersSchema,
  contractMutationPayloadSchema,
  createEmploymentContractInputSchema,
  createEmployeeProfileInputSchema,
  deleteEmploymentContractInputSchema,
  deleteEmployeeProfileInputSchema,
  peopleListFiltersSchema,
  profileMutationPayloadSchema,
} from '@/server/types/hr-people-schemas';
import {
  CONTRACT_TYPE_VALUES,
  EMPLOYMENT_TYPE_VALUES,
} from '@/server/types/hr/people';

const dateInputSchema = z.union([z.coerce.date(), z.string().min(1)]);
const profileChangeSchema = profileMutationPayloadSchema.shape.changes;
const contractChangeSchema = contractMutationPayloadSchema.shape.changes;

export const getEmployeeProfilePayloadSchema = z.object({
  profileId: z.uuid(),
});

export const getEmployeeProfileByUserPayloadSchema = z.object({
  userId: z.uuid(),
});

export const listEmployeeProfilesPayloadSchema = z.object({
  filters: peopleListFiltersSchema.optional(),
});

export const countEmployeeProfilesPayloadSchema = listEmployeeProfilesPayloadSchema;

export const createEmployeeProfilePayloadSchema = z.object({
  profileData: createEmployeeProfileInputSchema.shape.changes.extend({
    userId: z.uuid(),
    employeeNumber: z.string().min(1),
    employmentType: z.enum(EMPLOYMENT_TYPE_VALUES),
  }),
});

export const updateEmployeeProfilePayloadSchema = z.object({
  profileId: z.uuid(),
  profileUpdates: profileChangeSchema,
});

export const deleteEmployeeProfilePayloadSchema = z.object({
  profileId: deleteEmployeeProfileInputSchema.shape.profileId,
});

export const getEmploymentContractPayloadSchema = z.object({
  contractId: z.uuid(),
});

export const getEmploymentContractByEmployeePayloadSchema = z.object({
  employeeId: z.uuid(),
});

export const listEmploymentContractsPayloadSchema = z.object({
  filters: contractListFiltersSchema.optional(),
});

export const createEmploymentContractPayloadSchema = z.object({
  contractData: createEmploymentContractInputSchema.shape.changes.extend({
    userId: z.uuid(),
    contractType: z.enum(CONTRACT_TYPE_VALUES),
    jobTitle: z.string().min(1),
    startDate: dateInputSchema,
  }),
});

export const updateEmploymentContractPayloadSchema = z.object({
  contractId: z.uuid(),
  contractUpdates: contractChangeSchema,
});

export const deleteEmploymentContractPayloadSchema = z.object({
  contractId: deleteEmploymentContractInputSchema.shape.contractId,
});
