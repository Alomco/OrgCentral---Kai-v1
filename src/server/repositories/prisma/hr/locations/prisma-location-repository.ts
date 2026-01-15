import { randomUUID } from 'node:crypto';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type {
  ILocationRepository,
  LocationCreateInput,
  LocationRecord,
} from '@/server/repositories/contracts/hr/locations/location-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export class PrismaLocationRepository
  extends BasePrismaRepository
  implements ILocationRepository {
  async createLocation(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    input: LocationCreateInput,
  ): Promise<LocationRecord> {
    const authorization = this.normalizeAuthorizationContext(contextOrOrgId, 'location');
    this.validateTenantWriteAccess(authorization, authorization.orgId, 'write');
    const record = await this.prisma.location.create({
      data: {
        id: randomUUID(),
        orgId: authorization.orgId,
        name: input.name,
        address: input.address,
        phone: input.phone ?? null,
      },
    });
    this.assertTenantRecord(record, authorization, 'location');
    return record;
  }

  async listLocations(
    contextOrOrgId: RepositoryAuthorizationContext | string,
  ): Promise<LocationRecord[]> {
    const authorization = this.normalizeAuthorizationContext(contextOrOrgId, 'location');
    const records = await this.prisma.location.findMany({
      where: { orgId: authorization.orgId },
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.assertTenantRecord(record, authorization, 'location'));
  }
}
