import 'dotenv/config';
import { prisma } from '@/server/lib/prisma';
import { resetRealisticTestAccountSeed } from './test-accounts/realistic-reset';
import { runRealisticTestAccountSeed } from './test-accounts/realistic-seeding';

async function main(): Promise<void> {
    console.log('Resetting realistic test-account seeded data...');
    await resetRealisticTestAccountSeed(prisma);
    console.log('Reseeding realistic test-account data...');
    await runRealisticTestAccountSeed(prisma);
}

main()
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Reset + reseed failed: ${message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
