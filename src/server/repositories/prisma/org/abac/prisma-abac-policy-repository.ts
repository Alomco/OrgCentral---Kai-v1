import { type Prisma } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import type { AbacPolicy } from '@/server/security/abac-types';

export class PrismaAbacPolicyRepository extends BasePrismaRepository implements IAbacPolicyRepository {
  async getPoliciesForOrg(orgId: string): Promise<AbacPolicy[]> {
    const organization = getModelDelegate(this.prisma, 'organization');
    const org = await organization.findUnique({ where: { id: orgId }, select: { settings: true } });
    if (!org) { return []; }
    const settings = (org.settings as Record<string, unknown> | null) ?? {};
    return (settings.abacPolicies as AbacPolicy[] | undefined) ?? [];
  }

  async setPoliciesForOrg(orgId: string, policies: AbacPolicy[]): Promise<void> {
    const organization = getModelDelegate(this.prisma, 'organization');
    const org = await organization.findUnique({ where: { id: orgId }, select: { settings: true } });
    if (!org) { throw new Error('Organization not found'); }
    const settings = (org.settings as Record<string, unknown> | null) ?? {};
    const updatedSettings = { ...(settings), abacPolicies: policies };
    await organization.update({
      where: { id: orgId },
      data: {
        settings: updatedSettings as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
