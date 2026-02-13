import { NextResponse } from 'next/server';
import {
    listSupportTicketsController,
    createSupportTicketController,
    updateSupportTicketController,
} from '@/server/api-adapters/platform/admin/support-tickets-controller';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function GET(request: Request) {
    try {
        const result = await listSupportTicketsController(request);
        return NextResponse.json(result);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const result = await createSupportTicketController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request) {
    try {
        const result = await updateSupportTicketController(request);
        return NextResponse.json(result);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
