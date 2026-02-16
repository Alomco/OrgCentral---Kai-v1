import { unstable_noStore as noStore } from 'next/cache';
import { type NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import { presignDocumentDownloadController } from '@/server/api-adapters/records/documents/presign-document-download';

export async function GET(
    request: Request,
    context: { params: Promise<{ documentId: string }> },
): Promise<NextResponse> {
    noStore();
    try {
        const { documentId } = await context.params;
        const result = await presignDocumentDownloadController(request, documentId);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
