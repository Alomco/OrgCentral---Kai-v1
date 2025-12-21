import { AbstractBaseService } from '@/server/services/abstract-base-service';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { buildSystemServiceContext, buildTenantServiceContext } from '@/server/services/auth/service-context';
import type {
    GetInvitationDetailsDependencies,
    GetInvitationDetailsInput,
    GetInvitationDetailsResult,
} from '@/server/use-cases/auth/get-invitation-details';
import { getInvitationDetails } from '@/server/use-cases/auth/get-invitation-details';
import { normalizeToken } from '@/server/use-cases/shared';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import { PrismaInvitationRepository } from '@/server/repositories/prisma/auth/invitations';
import { PrismaUserRepository } from '@/server/repositories/prisma/org/users';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import type { InvitationRecord } from '@/server/repositories/contracts/auth/invitations/invitation-repository.types';

const AUDIT_SOURCE = 'auth.invitation-service';

export interface InvitationServiceDependencies extends GetInvitationDetailsDependencies {
    organizationRepository?: IOrganizationRepository;
}

export class InvitationService extends AbstractBaseService {
    constructor(private readonly dependencies: InvitationServiceDependencies) {
        super();
    }

    async getDetails(input: GetInvitationDetailsInput): Promise<GetInvitationDetailsResult> {
        const token = normalizeToken(input.token);
        const context = await this.buildContext(token);
        return this.executeInServiceContext(context, 'auth.invitation.details', () =>
            getInvitationDetails(this.dependencies, { token }),
        );
    }

    private async buildContext(token: string): Promise<ServiceExecutionContext> {
        const record = await this.safeLookupInvitation(token);
        if (!record) {
            return buildSystemServiceContext({
                auditSource: AUDIT_SOURCE,
                metadata: { token },
            });
        }

        const organization = record.organizationId
            ? await this.dependencies.organizationRepository?.getOrganization(record.organizationId)
            : null;

        return buildTenantServiceContext({
            orgId: record.organizationId,
            userId: 'invitation-service',
            dataResidency: organization?.dataResidency ?? 'UK_ONLY',
            dataClassification: organization?.dataClassification ?? 'OFFICIAL',
            auditSource: AUDIT_SOURCE,
            metadata: { token, organizationId: record.organizationId },
        });
    }

    private async safeLookupInvitation(token: string): Promise<InvitationRecord | null> {
        try {
            return await this.dependencies.invitationRepository.findByToken(token);
        } catch (error) {
            this.logger.warn('auth.invitation.lookup.failed', { token, reason: (error as Error).message });
            return null;
        }
    }
}

let sharedService: InvitationService | null = null;

export function getInvitationService(
    overrides?: Partial<InvitationServiceDependencies>,
): InvitationService {
    if (!sharedService || overrides) {
        const dependencies: InvitationServiceDependencies = {
            invitationRepository:
                overrides?.invitationRepository ?? new PrismaInvitationRepository(),
            userRepository: overrides?.userRepository ?? new PrismaUserRepository(),
            organizationRepository:
                overrides?.organizationRepository ?? new PrismaOrganizationRepository(),
        };

        if (!overrides) {
            sharedService = new InvitationService(dependencies);
            return sharedService;
        }

        return new InvitationService(dependencies);
    }

    return sharedService;
}
