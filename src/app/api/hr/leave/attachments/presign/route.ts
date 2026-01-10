import { NextResponse } from 'next/server';

import { presignLeaveAttachmentController } from '@/server/api-adapters/hr/leave/presign-leave-attachment';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await presignLeaveAttachmentController({ request });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}