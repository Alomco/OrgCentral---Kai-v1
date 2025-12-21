import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    createChecklistTemplateController,
    listChecklistTemplatesController,
} from '@/server/api-adapters/hr/onboarding/templates-controller';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await listChecklistTemplatesController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await createChecklistTemplateController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
