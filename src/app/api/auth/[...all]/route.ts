import type { NextRequest } from 'next/server';
import { betterAuthController } from '@/server/api-adapters/auth/better-auth-controller';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

async function handleAuthRequest(request: NextRequest): Promise<Response> {
	try {
		return await betterAuthController(request);
	} catch (error) {
		return buildErrorResponse(error);
	}
}

export async function GET(request: NextRequest): Promise<Response> {
	return handleAuthRequest(request);
}

export async function POST(request: NextRequest): Promise<Response> {
	return handleAuthRequest(request);
}
