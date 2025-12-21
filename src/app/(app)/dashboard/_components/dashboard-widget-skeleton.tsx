import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardWidgetSkeleton() {
    return (
        <article className="h-full">
            <Card className="flex h-full flex-col border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-5">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-lg" />
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-0">
                    <div className="flex items-center justify-between gap-3">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-5 w-16 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-md" />
                    <div className="mt-auto pt-2">
                        <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </article>
    );
}

