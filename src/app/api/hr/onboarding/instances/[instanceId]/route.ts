import { type NextRequest, NextResponse } from 'next/server';
import { updateChecklistInstanceController } from '@/server/api-adapters/hr/onboarding/instances-controller';
import { DefaultErrorMapper } from '@/server/api-adapters/error-mappers/default-error-mapper';

// Next.js 13+ route handlers with params need the params argument as second arg
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ instanceId: string }> }
) {
    const params = await props.params;
    try {
        const result = await updateChecklistInstanceController(request, params.instanceId);
        return NextResponse.json(result);
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}
