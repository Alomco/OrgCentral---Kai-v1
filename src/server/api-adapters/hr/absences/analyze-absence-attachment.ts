import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    analyzeAbsenceAttachmentSchema,
    type AnalyzeAbsenceAttachmentPayload,
} from '@/server/types/hr-absence-schemas';
import {
    defaultAbsenceControllerDependencies,
    resolveAbsenceControllerDependencies,
    type AbsenceControllerDependencies,
} from './common';

interface AnalyzeAttachmentControllerInput {
    request: Request;
    absenceId: string;
}

export async function analyzeAbsenceAttachmentController(
    { request, absenceId }: AnalyzeAttachmentControllerInput,
    dependencies: AbsenceControllerDependencies = defaultAbsenceControllerDependencies,
) {
    const raw: unknown = await request.json();
    const payload: AnalyzeAbsenceAttachmentPayload = analyzeAbsenceAttachmentSchema.parse(raw);
    const { session, service } = resolveAbsenceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredRoles: ['orgAdmin'],
        auditSource: 'api:hr:absences:ai-analyze',
        action: 'update',
        resourceType: 'hr.absence-ai-validation',
        resourceAttributes: {
            scope: 'unplanned',
            absenceId,
            attachmentId: payload.attachmentId ?? null,
            force: payload.force,
        },
    });

    return service.analyzeAttachment({
        authorization,
        absenceId,
        payload,
    });
}
