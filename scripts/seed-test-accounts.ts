import 'dotenv/config';
import { prisma } from '@/server/lib/prisma';
import { resolveSeedRuntimeConfig } from './test-accounts/config';
import { writeLocalCatalog } from './test-accounts/catalog';
import { ensureOrganizations, seedRbacAbacFoundations, applyOrgSecurityAndAbsenceDefaults } from './test-accounts/rbac-abac';
import { seedPersonas } from './test-accounts/persona-seeding';

async function main(): Promise<void> {
    const config = resolveSeedRuntimeConfig({ requireDatabaseUrl: true });

    const organizations = await ensureOrganizations(prisma);
    await seedRbacAbacFoundations(organizations);

    const { catalog, actors } = await seedPersonas(prisma, organizations, config);
    await applyOrgSecurityAndAbsenceDefaults(organizations, actors);
    await seedRbacAbacFoundations(organizations);
    await writeLocalCatalog(config, catalog);

    console.log('Test account seeding complete.');
    console.log(`- Catalog JSON: ${config.localCatalogPath}`);
    console.log(`- Catalog Guide: ${config.localGuidePath}`);
    console.log(`- Personas: ${String(catalog.length)}`);
}

main()
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Seeding failed: ${message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
