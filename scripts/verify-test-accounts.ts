import 'dotenv/config';
import { prisma } from '@/server/lib/prisma';
import { resolveSeedRuntimeConfig } from './test-accounts/config';
import { verifySeededAccounts } from './test-accounts/verification';

async function main(): Promise<void> {
    const config = resolveSeedRuntimeConfig({ requireDatabaseUrl: true });
    const result = await verifySeededAccounts(prisma, config.localCatalogPath);

    if (result.failures.length > 0) {
        console.error('Test account verification failed.');
        for (const failure of result.failures) {
            console.error(`- ${failure}`);
        }
        process.exitCode = 1;
        return;
    }

    console.log(
        `Verified ${String(result.personaCount)} personas across ${String(result.organizationCount)} organizations.`,
    );
}

main()
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Verification failed: ${message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
