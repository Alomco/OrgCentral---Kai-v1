// src/server/services/seeder/seed-abac.ts
import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_ABAC_POLICIES } from '@/server/repositories/cache-scopes';
import { PrismaAbacPolicyRepository } from '@/server/repositories/prisma/org/abac/prisma-abac-policy-repository';
import { DEFAULT_BOOTSTRAP_POLICIES } from '@/server/security/abac-constants';
import { getDefaultOrg, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

// Revalidate path is probably needed here if we invalidate cache, but we can return paths to revalidate
// However, invalidateOrgCache handles cache tags. revalidatePath handles route cache.

export async function seedAbacPoliciesInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const repository = new PrismaAbacPolicyRepository();
        await repository.setPoliciesForOrg(org.id, DEFAULT_BOOTSTRAP_POLICIES);
        await invalidateOrgCache(org.id, CACHE_SCOPE_ABAC_POLICIES, org.dataClassification, org.dataResidency);

        return { success: true, message: `Seeded ${String(DEFAULT_BOOTSTRAP_POLICIES.length)} ABAC policies` };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}

export async function getAbacPolicyStatusInternal() {
    try {
        const org = await getDefaultOrg();
        const repository = new PrismaAbacPolicyRepository();
        const policies = await repository.getPoliciesForOrg(org.id);
        return { hasAbacPolicies: policies.length > 0, policyCount: policies.length };
    } catch {
        return { hasAbacPolicies: false, policyCount: 0 };
    }
}
