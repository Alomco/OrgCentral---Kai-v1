import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { PrismaClient, Invitation as PrismaInvitation } from '@prisma/client';
import type {
    IInvitationRepository,
    InvitationRecord,
    InvitationStatusUpdate,
} from '@/server/repositories/contracts/auth/invitations';
import { resolveIdentityCacheScopes } from '@/server/lib/cache-tags/identity';

type InvitationEntity = PrismaInvitation;

type InvitationDelegate = PrismaClient['invitation'];

import { mapPrismaInvitationToInvitationRecord } from '@/server/repositories/mappers/auth/invitation-mapper';

function mapInvitation(record: InvitationEntity): InvitationRecord {
    return {
        ...mapPrismaInvitationToInvitationRecord(record),
    };
}

export class PrismaInvitationRepository extends BasePrismaRepository implements IInvitationRepository {
    async findByToken(token: string): Promise<InvitationRecord | null> {
        const record = await getInvitationDelegate(this.prisma).findUnique({ where: { token } });
        if (!record) {
            return null;
        }

        return mapInvitation(record);
    }

    async updateStatus(token: string, update: InvitationStatusUpdate): Promise<void> {
        const existing = await getInvitationDelegate(this.prisma).findUnique({ where: { token } });
        await getInvitationDelegate(this.prisma).update({
            where: { token },
            data: {
                status: update.status,
                acceptedByUserId: update.acceptedByUserId,
                acceptedAt: update.acceptedAt,
            },
        });

        const orgId = existing?.orgId;
        if (orgId) {
            await this.invalidateAfterWrite(orgId, resolveIdentityCacheScopes());
        }
    }
}

function getInvitationDelegate(prisma: unknown): InvitationDelegate {
    const delegateHolder = prisma as { invitation?: unknown };
    const delegate = delegateHolder.invitation;
    if (!delegate || typeof delegate !== 'object') {
        throw new Error('Invitation delegate is not available on the Prisma client.');
    }

    const candidate = delegate as Partial<InvitationDelegate>;
    if (typeof candidate.findUnique !== 'function' || typeof candidate.update !== 'function') {
        throw new Error('Invitation delegate is missing required methods.');
    }

    return candidate as InvitationDelegate;
}
