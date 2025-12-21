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
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

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
        requiredPermissions: { organization: ['update'] },
        auditSource: 'api:hr:absences:ai-analyze',
        action: HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_ABSENCE_AI_VALIDATION,
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
