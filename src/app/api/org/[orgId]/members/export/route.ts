import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { exportMembersCsvController } from '@/server/api-adapters/org/members/members-export-controller';

interface RouteParams { params: Promise<{ orgId: string }> }

export async function GET(request: Request, context: RouteParams): Promise<Response> {
  try {
    const { orgId } = await context.params;
    return await exportMembersCsvController(request, orgId);
  } catch (error) {
    const res = buildErrorResponse(error);
    return new Response(await res.text(), { status: res.status, headers: res.headers });
  }
}
