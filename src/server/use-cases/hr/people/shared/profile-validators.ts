import type { PeopleListFilters, ContractListFilters } from '@/server/types/hr/people';

function normalizeDateString(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function normalizeProfileFilters(filters?: PeopleListFilters): PeopleListFilters | undefined {
  if (!filters) {
    return undefined;
  }
  return {
    startDate: normalizeDateString(filters.startDate),
    endDate: normalizeDateString(filters.endDate),
    employmentStatus: filters.employmentStatus,
  };
}

export function normalizeContractFilters(filters?: ContractListFilters): ContractListFilters | undefined {
  if (!filters) {
    return undefined;
  }

  return {
    ...filters,
    startDate: normalizeDateString(filters.startDate),
    endDate: normalizeDateString(filters.endDate),
  };
}
