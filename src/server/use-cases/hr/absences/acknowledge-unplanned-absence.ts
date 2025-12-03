import { EntityNotFoundError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgAbsenceActor } from '@/server/security/authorization';
import type { AcknowledgeAbsencePayload } from '@/server/types/hr-absence-schemas';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import { normalizeString } from '@/server/use-cases/shared';
import {
    mutateAbsenceMetadata,
    mergeMetadata,
    type AbsenceAcknowledgementEntry,
} from '@/server/domain/absences/metadata';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface AcknowledgeUnplannedAbsenceDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface AcknowledgeUnplannedAbsenceInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    payload: AcknowledgeAbsencePayload;
}

export interface AcknowledgeUnplannedAbsenceResult {
    absence: UnplannedAbsence;
}

export async function acknowledgeUnplannedAbsence(
    deps: AcknowledgeUnplannedAbsenceDependencies,
    input: AcknowledgeUnplannedAbsenceInput,
): Promise<AcknowledgeUnplannedAbsenceResult> {
    assertPrivilegedOrgAbsenceActor(input.authorization);

    const orgId = input.authorization.orgId;
    const absence = await deps.absenceRepository.getAbsence(orgId, input.absenceId);
    if (!absence) {
        throw new EntityNotFoundError('Unplanned absence', { id: input.absenceId });
    }

    const note = normalizeString(input.payload.note ?? undefined);
    const metadata = mutateAbsenceMetadata(absence.metadata, (store) => {
        const entries: AbsenceAcknowledgementEntry[] = Array.isArray(store.acknowledgements)
            ? [...store.acknowledgements]
            : [];
        entries.push(buildAcknowledgementEntry(input.authorization.userId, note));
        store.acknowledgements = entries.slice(-10); // keep recent acknowledgements only
        mergeMetadata(store, input.payload.metadata);
    });

    const updated = await deps.absenceRepository.updateAbsence(orgId, absence.id, {
        metadata,
    });

    await invalidateAbsenceScopeCache(input.authorization);
    return { absence: updated };
}

function buildAcknowledgementEntry(userId: string, note?: string | null): AbsenceAcknowledgementEntry {
    return {
        userId,
        notedAt: new Date().toISOString(),
        note: note ?? undefined,
    };
}
