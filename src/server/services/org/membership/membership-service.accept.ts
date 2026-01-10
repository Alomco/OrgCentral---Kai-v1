import type { AcceptInvitationResult, AcceptInvitationDependencies } from '@/server/use-cases/auth/accept-invitation';
import { acceptInvitation } from '@/server/use-cases/auth/accept-invitation';
import { EntityNotFoundError } from '@/server/errors';
import { normalizeRoles } from '@/server/use-cases/shared';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { buildAuthorizationContext } from './membership-service.helpers';
import type {
    AcceptInvitationExecutor,
    AcceptInvitationServiceInput,
    MembershipServiceDependencies,
} from './membership-service.types';

export async function runAcceptInvitation(
    dependencies: MembershipServiceDependencies,
    executor: AcceptInvitationExecutor,
    input: AcceptInvitationServiceInput,
): Promise<AcceptInvitationResult> {
    const invitation = await dependencies.invitationRepository.findByToken(input.token.trim());
    if (!invitation) {
        throw new EntityNotFoundError('Invitation', { token: input.token });
    }

    const authorization = await buildAuthorizationContext({
        organizationRepository: dependencies.organizationRepository,
        orgId: invitation.organizationId,
        userId: input.actor.userId,
        correlationId: input.correlationId,
    });

    const context: ServiceExecutionContext = executor.buildContext(authorization, {
        correlationId: authorization.correlationId,
    });

    const deps: AcceptInvitationDependencies = {
        invitationRepository: dependencies.invitationRepository,
        userRepository: dependencies.userRepository,
        membershipRepository: dependencies.membershipRepository,
        organizationRepository: dependencies.organizationRepository,
        generateEmployeeNumber: dependencies.generateEmployeeNumber,
        employeeProfileRepository: dependencies.employeeProfileRepository,
        checklistTemplateRepository: dependencies.checklistTemplateRepository,
        checklistInstanceRepository: dependencies.checklistInstanceRepository,
    } satisfies AcceptInvitationDependencies;

    const result = await executor.execute<AcceptInvitationResult>(
        context,
        'identity.accept-invitation',
        () => acceptInvitation(deps, input),
    );
    await dependencies.billingService?.syncSeats({ authorization });
    return result;
}

export function normalizeInviteRoles(roles: string[]): string[] {
    const normalized = normalizeRoles(roles);
    return normalized.length > 0 ? normalized : ['member'];
}
