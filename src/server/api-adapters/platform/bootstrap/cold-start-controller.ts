import { ValidationError, AuthorizationError } from '@/server/errors';
import { runColdStart, type ColdStartConfig } from '@/server/services/platform/bootstrap/cold-start-service';
import { readJson } from '@/server/api-adapters/http/request-utils';

export async function coldStartController(request: Request) {
  assertToken(request);
  const body = (await readJson<Partial<ColdStartConfig>>(request)) as Partial<ColdStartConfig>;
  const legacyBody = body as Partial<ColdStartConfig> & {
    devAdminEmail?: string;
    devAdminName?: string;
  };
  const config: ColdStartConfig = {
    platformOrgSlug: body.platformOrgSlug,
    platformOrgName: body.platformOrgName,
    platformTenantId: body.platformTenantId,
    platformRegionCode: body.platformRegionCode,
    globalAdminEmail: body.globalAdminEmail,
    globalAdminName: body.globalAdminName,
    developmentAdminEmail: body.developmentAdminEmail ?? legacyBody.devAdminEmail,
    developmentAdminName: body.developmentAdminName ?? legacyBody.devAdminName,
    roleName: body.roleName,
  };
  return runColdStart(config);
}

function assertToken(request: Request): void {
  const configured = process.env.COLD_START_TOKEN ?? process.env.BOOTSTRAP_TOKEN;
  if (!configured) {
    throw new AuthorizationError('COLD_START_TOKEN is not configured; bootstrap is disabled.');
  }
  const provided = request.headers.get('x-bootstrap-token');
  if (!provided || provided !== configured) {
    throw new ValidationError('Invalid bootstrap token.');
  }
}
