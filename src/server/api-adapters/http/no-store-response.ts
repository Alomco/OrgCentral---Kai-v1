import { NextResponse } from 'next/server';

export function buildNoStoreJsonResponse<TBody>(body: TBody, status = 200): NextResponse<TBody> {
    return NextResponse.json(body, {
        status,
        headers: {
            'Cache-Control': 'no-store',
        },
    });
}
