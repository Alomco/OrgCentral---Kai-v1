import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { readJson } from '@/server/api-adapters/http/request-utils';
import { invalidateHrSettingsCacheTag } from '@/server/use-cases/hr/settings/cache-helpers';
import {
	updateHRSettingsInputSchema,
	updateHrSettings,
} from '@/server/use-cases/hr/settings/update-hr-settings';

import {
	defaultHrSettingsControllerDependencies,
	resolveHrSettingsControllerDependencies,
	type HrSettingsControllerDependencies,
} from './common';

export interface UpdateHrSettingsControllerResult {
	success: true;
	settings: Awaited<ReturnType<typeof updateHrSettings>>['settings'];
}

export async function updateHrSettingsController(
	request: Request,
	dependencies: HrSettingsControllerDependencies = defaultHrSettingsControllerDependencies,
): Promise<UpdateHrSettingsControllerResult> {
	const { session, hrSettingsRepository } = resolveHrSettingsControllerDependencies(dependencies);

	const { authorization } = await getSessionContext(session, {
		headers: request.headers,
		requiredPermissions: { organization: ['update'] },
		auditSource: AUDIT_SOURCES.update,
		action: 'update',
		resourceType: RESOURCE_TYPE,
		resourceAttributes: { scope: 'global' },
	});

	const raw = await readJson<Record<string, unknown>>(request);
	const shaped = isRecord(raw)
		? {
			...raw,
			orgId: typeof raw.orgId === 'string' ? raw.orgId : authorization.orgId,
		}
		: { orgId: authorization.orgId };

	const payload = updateHRSettingsInputSchema.parse(shaped);

	const result = await updateHrSettings(
		{ hrSettingsRepository },
		{ authorization, payload },
	);

	await invalidateHrSettingsCacheTag(authorization);

	return {
		success: true,
		settings: result.settings,
	};
}

// API adapter: Use-case: update HR module settings through settings repositories under tenant guard.

const RESOURCE_TYPE = 'hr.settings';
const AUDIT_SOURCES = {
	update: 'api:hr:settings:update',
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
