import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import {
    withRepositoryAuthorization,
    type RepositoryAuthorizationContext,
} from '@/server/repositories/security';
import { ValidationError } from '@/server/errors';
import {
    absenceAiValidationJobSchema,
    type AbsenceAiValidationJob,
} from './ai-validation.types';

export function parseAbsenceAiJob(payload: unknown): ResultAsync<AbsenceAiValidationJob, Error> {
    const result = absenceAiValidationJobSchema.safeParse(payload);
    if (!result.success) {
        return errAsync(new ValidationError(result.error.message));
    }
    return okAsync(result.data);
}

export function authorizeAbsenceAiJob(
    parsed: AbsenceAiValidationJob,
): ResultAsync<{ parsed: AbsenceAiValidationJob; authorization: RepositoryAuthorizationContext }, Error> {
    return ResultAsync.fromPromise<RepositoryAuthorizationContext, Error>(
        withRepositoryAuthorization(
            {
                orgId: parsed.orgId,
                userId: parsed.authorization.userId,
                requiredPermissions:
                    parsed.authorization.requiredPermissions ?? { organization: ['update'] },
                requiredAnyPermissions: parsed.authorization.requiredAnyPermissions,
                expectedResidency: parsed.storage.dataResidency,
                expectedClassification: parsed.storage.dataClassification,
                auditSource: parsed.authorization.auditSource,
                correlationId: parsed.authorization.correlationId,
                action: 'update',
                resourceType: 'hr.absence-ai-validation',
                resourceAttributes: {
                    absenceId: parsed.absenceId,
                    attachmentId: parsed.attachmentId ?? null,
                    storageKey: parsed.storage.storageKey,
                },
            },
            (context) => Promise.resolve(context),
        ),
        (error) => (error instanceof Error ? error : new Error(String(error))),
    ).map((authorization) => ({ parsed, authorization }));
}
