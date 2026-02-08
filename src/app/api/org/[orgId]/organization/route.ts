import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    getOrganizationController,
    updateOrganizationProfileController,
} from '@/server/api-adapters/org/organization/organization-route-controllers';

interface RouteParams {
    params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { orgId } = await params;
        return NextResponse.json(await getOrganizationController(request, orgId), { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { orgId } = await params;
        return NextResponse.json(await updateOrganizationProfileController(request, orgId), { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
