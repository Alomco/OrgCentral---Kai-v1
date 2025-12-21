import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    getLeaveSettingsController,
    updateLeaveSettingsController,
} from '@/server/api-adapters/org/organization/leave-settings-route-controllers';

export async function GET(request: Request, context: { params: Promise<{ orgId: string }> }) {
    try {
        const { orgId } = await context.params;
        const result = await getLeaveSettingsController(request, orgId);
        return NextResponse.json(result);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, context: { params: Promise<{ orgId: string }> }) {
    try {
        const { orgId } = await context.params;
        const result = await updateLeaveSettingsController(request, orgId);
        return NextResponse.json(result);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
