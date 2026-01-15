// src/server/services/seeder/seed-stats.ts
import { buildSeederServiceDependencies } from '@/server/repositories/providers/seeder/seeder-service-dependencies';
import { getDefaultOrg, SEEDED_METADATA_KEY } from './utils';

export async function getSeededDataStatsInternal() {
    try {
        const org = await getDefaultOrg();
        const { seederStatsRepository } = buildSeederServiceDependencies();
        return await seederStatsRepository.getSeededStats(org.id, SEEDED_METADATA_KEY);
    } catch {
        return {
            employees: 0,
            absences: 0,
            timeEntries: 0,
            training: 0,
            reviews: 0,
            security: 0,
            notifications: 0,
            invoices: 0,
            policies: 0,
            checklistInstances: 0,
            leavePolicies: 0,
        };
    }
}
