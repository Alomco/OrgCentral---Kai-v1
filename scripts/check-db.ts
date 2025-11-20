import { prisma } from '../src/server/lib/prisma';

async function main() {
    try {
        const count = await prisma.organization.count();
        console.log('organizations:', count);
    } catch (err) {
        console.error('DB test error: ', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
