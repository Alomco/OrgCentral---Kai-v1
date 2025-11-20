import { evaluateAbac, makeResource, makeSubject } from '../abac';
import type { OrgAccessContext } from '../guards';

export interface AbacEvaluationRequest {
    orgId: string;
    userId: string;
    action: string;
    resourceType: string;
    roles?: string[];
    subjectAttributes?: Record<string, unknown>;
    resourceAttributes?: Record<string, unknown>;
    guardContext?: OrgAccessContext;
}

export interface AbacDecision {
    allowed: boolean;
    reasons: string[];
}

function compileSubject(request: AbacEvaluationRequest): Record<string, unknown> {
    return makeSubject(
        request.orgId,
        request.userId,
        request.roles,
        {
            clearance: request.guardContext?.dataClassification,
            residency: request.guardContext?.dataResidency,
            ...request.subjectAttributes,
        },
    );
}

function compileResource(request: AbacEvaluationRequest): Record<string, unknown> {
    return makeResource({
        classification: request.guardContext?.dataClassification,
        residency: request.guardContext?.dataResidency,
        ...request.resourceAttributes,
    });
}

export async function evaluateAbacWithContext(
    request: AbacEvaluationRequest,
): Promise<AbacDecision> {
    const allowed = await evaluateAbac(
        request.orgId,
        request.action,
        request.resourceType,
        compileSubject(request),
        compileResource(request),
    );
    return {
        allowed,
        reasons: allowed
            ? []
            : [
                  `ABAC denial for action ${request.action} on resource ${request.resourceType}.`,
              ],
    };
}

export async function requireAbacAllowance(
    request: AbacEvaluationRequest,
): Promise<void> {
    const decision = await evaluateAbacWithContext(request);
    if (!decision.allowed) {
        const reason = decision.reasons.at(0) ?? 'ABAC policy denied request.';
        throw new Error(reason);
    }
}

export async function withAbacGuard<TResult>(
    request: AbacEvaluationRequest,
    handler: () => Promise<TResult>,
): Promise<TResult> {
    await requireAbacAllowance(request);
    return handler();
}
