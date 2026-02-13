import { Prisma } from '@/server/types/prisma';
import type { ISupportTicketRepository } from '@/server/repositories/contracts/platform/admin/support-ticket-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { SupportTicket } from '@/server/types/platform/support-tickets';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import { supportTicketSchema } from '@/server/validators/platform/admin/support-ticket-validators';
import { toPrismaInputJson, type JsonLike } from '@/server/repositories/prisma/helpers/prisma-utils';
import { ValidationError } from '@/server/errors';

const SUPPORT_TICKETS_KEY = 'platform-support-tickets';
const MAX_WRITE_RETRIES = 5;

interface TicketStoreSnapshot {
    tickets: SupportTicket[];
    updatedAt: Date | null;
}

export class PrismaSupportTicketRepository extends BasePrismaRepository implements ISupportTicketRepository {
    async listTickets(context: RepositoryAuthorizationContext): Promise<SupportTicket[]> {
        const snapshot = await this.loadSnapshot();
        return snapshot.tickets.filter((ticket) => ticket.orgId === context.orgId);
    }

    async getTicket(context: RepositoryAuthorizationContext, ticketId: string): Promise<SupportTicket | null> {
        const tickets = await this.listTickets(context);
        return tickets.find((ticket) => ticket.id === ticketId) ?? null;
    }

    async createTicket(context: RepositoryAuthorizationContext, ticket: SupportTicket): Promise<SupportTicket> {
        const created = await this.mutateTickets((tickets) => ({
            result: ticket,
            nextTickets: [ticket, ...tickets],
        }));

        if (!created) {
            throw new ValidationError('Unable to create support ticket.');
        }

        return created;
    }

    async updateTicket(
        context: RepositoryAuthorizationContext,
        ticket: SupportTicket,
        expectedVersion: number,
    ): Promise<SupportTicket | null> {
        return this.mutateTickets((tickets) => {
            const index = tickets.findIndex((item) => item.id === ticket.id && item.orgId === context.orgId);
            if (index < 0) {
                return null;
            }

            const current = tickets[index];
            if (current.version !== expectedVersion) {
                return null;
            }

            const nextTicket: SupportTicket = {
                ...ticket,
                version: expectedVersion + 1,
            };

            const nextTickets = [...tickets];
            nextTickets[index] = nextTicket;
            return { result: nextTicket, nextTickets };
        });
    }

    private async mutateTickets<TResult>(
        mutator: (tickets: SupportTicket[]) => { result: TResult; nextTickets: SupportTicket[] } | null,
    ): Promise<TResult | null> {
        for (let attempt = 0; attempt < MAX_WRITE_RETRIES; attempt += 1) {
            const snapshot = await this.loadSnapshot();
            const mutation = mutator(snapshot.tickets);
            if (!mutation) {
                return null;
            }

            const saved = await this.saveSnapshot(snapshot.updatedAt, mutation.nextTickets);
            if (saved) {
                return mutation.result;
            }
        }

        throw new ValidationError('Support ticket write conflict detected. Please retry.');
    }

    private async loadSnapshot(): Promise<TicketStoreSnapshot> {
        const record = await this.prisma.platformSetting.findUnique({
            where: { id: SUPPORT_TICKETS_KEY },
            select: { metadata: true, updatedAt: true },
        });

        if (!record) {
            return { tickets: [], updatedAt: null };
        }

        const parsed = supportTicketSchema.array().safeParse(record.metadata);
        if (!parsed.success) {
            return { tickets: [], updatedAt: record.updatedAt };
        }

        return { tickets: parsed.data, updatedAt: record.updatedAt };
    }

    private async saveSnapshot(updatedAt: Date | null, tickets: SupportTicket[]): Promise<boolean> {
        const metadata = toPrismaInputJson(tickets as unknown as JsonLike) ?? Prisma.JsonNull;

        if (!updatedAt) {
            try {
                await this.prisma.platformSetting.create({
                    data: {
                        id: SUPPORT_TICKETS_KEY,
                        metadata,
                    },
                });
                return true;
            } catch (error) {
                if (this.isUniqueConstraintError(error)) {
                    return false;
                }
                throw error;
            }
        }

        const result = await this.prisma.platformSetting.updateMany({
            where: {
                id: SUPPORT_TICKETS_KEY,
                updatedAt,
            },
            data: {
                metadata,
            },
        });

        return result.count === 1;
    }

    private isUniqueConstraintError(error: unknown): boolean {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        );
    }
}
