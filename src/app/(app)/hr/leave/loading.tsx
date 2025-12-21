import { Skeleton } from '@/components/ui/skeleton';

import { HrPageHeader } from '../_components/hr-page-header';

export default function HrLeaveLoading() {
    return (
        <div className="space-y-6">
            <HrPageHeader title="Leave" description="Loading leave requests…" />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
}
