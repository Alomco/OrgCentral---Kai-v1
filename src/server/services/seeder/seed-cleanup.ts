// src/server/services/seeder/seed-cleanup.ts
import { buildSeederServiceDependencies } from '@/server/repositories/providers/seeder/seeder-service-dependencies';
import { getDefaultOrg, SEEDED_METADATA_KEY, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function clearSeededDataInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();
        const { seederCleanupRepository } = buildSeederServiceDependencies();
        await seederCleanupRepository.clearSeededData(org.id, SEEDED_METADATA_KEY);

        return { success: true, message: 'Cleared all seeded data.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
