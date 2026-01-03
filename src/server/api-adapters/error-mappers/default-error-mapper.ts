import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { RepositoryAuthorizationError } from '@/server/repositories/security';

export const DefaultErrorMapper = {
    mapErrorToResponse(error: unknown): NextResponse {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation Error',
                    details: 'errors' in error ? error.errors : [],
                },
                { status: 400 },
            );
        }

        if (error instanceof RepositoryAuthorizationError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Forbidden',
                    message: error.message,
                },
                { status: 403 },
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Internal Server Error',
                    message: error.message,
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
            },
            { status: 500 },
        );
    }
};
