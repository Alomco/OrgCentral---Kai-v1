import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getHrSettings } from '@/server/use-cases/hr/settings/get-hr-settings';
import type { AbsenceSettings } from '@/server/types/hr-ops-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { ResolvedHrSettingsControllerDependencies } from './common';

import {
	defaultHrSettingsControllerDependencies,
	resolveHrSettingsControllerDependencies,
	type HrSettingsControllerDependencies,
} from './common';

export interface GetHrSettingsControllerResult {
	success: true;
	settings: Awaited<ReturnType<typeof getHrSettings>>['settings'];
	absenceSettings: AbsenceSettings | null;
}

export async function getHrSettingsController(
	request: Request,
	dependencies: HrSettingsControllerDependencies = defaultHrSettingsControllerDependencies,
): Promise<GetHrSettingsControllerResult> {
	const resolvedDeps: ResolvedHrSettingsControllerDependencies =
		resolveHrSettingsControllerDependencies(dependencies);
	const { session, hrSettingsRepository, absenceSettingsRepository } = resolvedDeps;

	const sessionResult = await getSessionContext(session, {
		headers: request.headers,
		requiredPermissions: { employeeProfile: ['read'] },
		auditSource: AUDIT_SOURCES.get,
		action: 'read',
		resourceType: RESOURCE_TYPE,
		resourceAttributes: { scope: 'global' },
	});
	const authorization: RepositoryAuthorizationContext = sessionResult.authorization;

	const result = await getHrSettings(
		{ hrSettingsRepository },
		{ authorization, orgId: authorization.orgId },
	);
	const absenceSettings: AbsenceSettings | null = await absenceSettingsRepository.getSettings(authorization);

	return {
		success: true,
		settings: result.settings,
		absenceSettings,
	};
}

// API adapter: Use-case: fetch HR module settings via HR settings repositories under tenant guard.

const RESOURCE_TYPE = 'hr.settings';
const AUDIT_SOURCES = {
	get: 'api:hr:settings:get',
} as const;
