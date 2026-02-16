import 'dotenv/config';
import { prisma } from '@/server/lib/prisma';
import { runRealisticTestAccountSeed } from './test-accounts/realistic-seeding';

async function main(): Promise<void> {
    await runRealisticTestAccountSeed(prisma);
}

main()
    .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Realistic seeding failed: ${message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
