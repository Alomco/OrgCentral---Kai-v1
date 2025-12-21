import { NextResponse } from 'next/server';
import { triggerComplianceReminderCron } from '@/server/api-adapters/cron/compliance-reminders';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await triggerComplianceReminderCron(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
