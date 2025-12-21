import { AbstractBaseService } from '@/server/services/abstract-base-service';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { buildSystemServiceContext } from '@/server/services/auth/service-context';
import type {
    AddToWaitlistDependencies,
    AddToWaitlistInput,
    AddToWaitlistResult,
} from '@/server/use-cases/auth/add-to-waitlist';
import { addToWaitlist } from '@/server/use-cases/auth/add-to-waitlist';
import { PrismaWaitlistRepository } from '@/server/repositories/prisma/auth/waitlist';

const AUDIT_SOURCE = 'auth.waitlist-service';

export type WaitlistServiceDependencies = AddToWaitlistDependencies;

export class WaitlistService extends AbstractBaseService {
    constructor(private readonly dependencies: WaitlistServiceDependencies) {
        super();
    }

    async addEntry(input: AddToWaitlistInput): Promise<AddToWaitlistResult> {
        const context = this.buildContext(input);
        return this.executeInServiceContext(context, 'auth.waitlist.add', () =>
            addToWaitlist(this.dependencies, input),
        );
    }

    private buildContext(input: AddToWaitlistInput): ServiceExecutionContext {
        return buildSystemServiceContext({
            auditSource: AUDIT_SOURCE,
            metadata: {
                email: input.email,
                industry: input.industry,
            },
        });
    }
}

let sharedService: WaitlistService | null = null;

export function getWaitlistService(
    overrides?: Partial<WaitlistServiceDependencies>,
): WaitlistService {
    if (!sharedService || overrides) {
        const dependencies: WaitlistServiceDependencies = {
            waitlistRepository: overrides?.waitlistRepository ?? new PrismaWaitlistRepository(),
        };
        if (!overrides) {
            sharedService = new WaitlistService(dependencies);
            return sharedService;
        }
        return new WaitlistService(dependencies);
    }

    return sharedService;
}
