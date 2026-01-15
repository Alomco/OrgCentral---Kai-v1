import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export interface LocationCreateInput {
  name: string;
  address: string;
  phone?: string | null;
}

export interface LocationRecord {
  id: string;
  orgId: string;
  name: string;
  address: string;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocationRepository {
  createLocation(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    input: LocationCreateInput,
  ): Promise<LocationRecord>;

  listLocations(
    contextOrOrgId: RepositoryAuthorizationContext | string,
  ): Promise<LocationRecord[]>;
}
