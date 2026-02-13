import 'dotenv/config';
import { resolveSeedRuntimeConfig } from './test-accounts/config';
import { readSeedCatalogFile } from './test-accounts/catalog-schema';

async function main(): Promise<void> {
    const config = resolveSeedRuntimeConfig();
    const catalog = await readSeedCatalogFile(config.localCatalogPath);

    console.log(`Generated: ${catalog.generatedAt}`);
    console.log(`Seed source: ${catalog.seedSource}`);
    console.log('');
    console.table(
        catalog.personas.map((persona) => ({
            persona: persona.key,
            email: persona.email,
            password: persona.password ?? '(set-password required)',
            org: persona.organizationSlug ?? '(none)',
            role: persona.roleKey,
            state: persona.state,
        })),
    );
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Unable to list test accounts: ${message}`);
    process.exitCode = 1;
});
