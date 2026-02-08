import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    getOrgBrandingController,
    updateOrgBrandingController,
    resetOrgBrandingController,
} from '@/server/api-adapters/org/branding/branding-route-controllers';

interface RouteParams {
    params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { orgId } = await params;
        const result = await getOrgBrandingController(request, orgId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { orgId } = await params;
        const result = await updateOrgBrandingController(request, orgId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { orgId } = await params;
        const result = await resetOrgBrandingController(request, orgId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
