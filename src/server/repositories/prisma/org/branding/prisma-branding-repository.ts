import type { PrismaClient } from '@prisma/client';
import type { IBrandingRepository } from '@/server/repositories/contracts/org/branding/branding-repository-contract';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { mapOrgBrandingRecordToDomain, mapOrgBrandingUpdateToRecord } from '@/server/repositories/mappers/org/branding/branding-mapper';
import type { OrgBranding } from '@/server/types/branding-types';
import { getModelDelegate } from '@/server/repositories/prisma/helpers/prisma-utils';
import { stampUpdate } from '@/server/repositories/prisma/helpers/timestamps';
import { registerOrgCacheTag, invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_BRANDING } from '@/server/repositories/cache-scopes';

type OrganizationDelegate = PrismaClient['organization'];
type OrganizationUpdateData = Parameters<OrganizationDelegate['update']>[0]['data'];
export class PrismaBrandingRepository extends BasePrismaRepository implements IBrandingRepository {
    private delegate(): OrganizationDelegate {
        return getModelDelegate(this.prisma, 'organization');
    }

    async getBranding(orgId: string): Promise<OrgBranding | null> {
        const record = await this.delegate().findUnique({ where: { id: orgId } });
        const brandingData = record ? (record as { branding?: OrgBranding | null; updatedAt?: Date | string }).branding ?? null : null;
        registerOrgCacheTag(orgId, CACHE_SCOPE_BRANDING);
        return mapOrgBrandingRecordToDomain(
            record
                ? {
                    orgId,
                    branding: brandingData,
                    updatedAt: (record as { updatedAt?: Date | string | null }).updatedAt ?? null,
                }
                : null,
        );
    }

    async updateBranding(orgId: string, updates: Partial<OrgBranding>): Promise<OrgBranding> {
        const data: OrganizationUpdateData = stampUpdate({
            branding: mapOrgBrandingUpdateToRecord(updates).branding,
        });
        const record = await this.delegate().update({
            where: { id: orgId },
            data,
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_BRANDING);
        const mapped = mapOrgBrandingRecordToDomain({
            orgId,
            branding: (record as { branding?: OrgBranding | null }).branding ?? null,
            updatedAt: (record as { updatedAt?: Date | string | null }).updatedAt ?? null,
        });
        if (!mapped) {
            throw new Error('Failed to map branding record');
        }
        return mapped;
    }

    async resetBranding(orgId: string): Promise<void> {
        const data: OrganizationUpdateData = stampUpdate({ branding: null });
        await this.delegate().update({
            where: { id: orgId },
            data,
        });
        await invalidateOrgCache(orgId, CACHE_SCOPE_BRANDING);
    }
}
