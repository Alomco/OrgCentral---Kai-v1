import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import { listDocumentsController } from '@/server/api-adapters/records/documents/list-documents';
import { storeDocumentController } from '@/server/api-adapters/records/documents/store-document';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await listDocumentsController(request);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await storeDocumentController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
