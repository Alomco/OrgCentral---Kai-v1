import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IWaitlistRepository, WaitlistEntryInput } from '@/server/repositories/contracts/auth/waitlist';

interface WaitlistDelegate {
    create(args: {
        data: {
            name: string;
            email: string;
            industry: string;
            metadata: Record<string, unknown> | null;
        };
    }): Promise<void>;
    findFirst(args: { where: { email?: string } }): Promise<{
        id: string;
        name: string;
        email: string;
        industry: string;
        metadata: Record<string, unknown> | null;
        createdAt: Date;
    } | null>;
}

export class PrismaWaitlistRepository extends BasePrismaRepository implements IWaitlistRepository {
    async createEntry(entry: WaitlistEntryInput): Promise<void> {
        await getWaitlistDelegate(this.prisma).create({
            data: {
                name: entry.name,
                email: entry.email.toLowerCase(),
                industry: entry.industry,
                metadata: entry.metadata ?? null,
            },
        });
    }

    async findByEmail(email: string): Promise<WaitlistEntryInput | null> {
        const normalized = email.toLowerCase();
        const result = await getWaitlistDelegate(this.prisma).findFirst({ where: { email: normalized } });
        if (!result) {
            return null;
        }

        return {
            name: result.name,
            email: result.email,
            industry: result.industry,
            metadata: result.metadata ?? undefined,
        } satisfies WaitlistEntryInput;
    }
}

function getWaitlistDelegate(prisma: unknown): WaitlistDelegate {
    const delegateHolder = prisma as { waitlistEntry?: unknown };
    const delegate = delegateHolder.waitlistEntry;
    if (!delegate || typeof delegate !== 'object') {
        throw new Error('Waitlist delegate is not available on the Prisma client.');
    }

    const candidate = delegate as Partial<WaitlistDelegate>;
    if (typeof candidate.create !== 'function') {
        throw new Error('Waitlist delegate is missing required methods.');
    }

    return candidate as WaitlistDelegate;
}
