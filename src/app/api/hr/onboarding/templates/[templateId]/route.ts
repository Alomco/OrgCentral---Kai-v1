import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    deleteChecklistTemplateController,
    updateChecklistTemplateController,
} from '@/server/api-adapters/hr/onboarding/templates-controller';

interface Params {
    params: { templateId: string };
}

export async function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
    try {
        const result = await updateChecklistTemplateController(request, params.templateId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: Params): Promise<NextResponse> {
    try {
        const result = await deleteChecklistTemplateController(request, params.templateId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
