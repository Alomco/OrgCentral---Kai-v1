import { Badge } from '@/components/ui/badge';

export function DashboardPageHeader(props: {
    organizationId: string;
    roleKey: string;
    userEmail: string | null;
}) {
    // Shorten org ID for display (show first 8 chars)
    const shortOrgId = props.organizationId.slice(0, 8);

    return (
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl leading-tight">
                    Dashboard
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                    Monitor your organization, manage tasks, and access quick actions.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                    {shortOrgId}
                </Badge>
                <Badge variant="outline" className="capitalize bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20 transition-colors">
                    {props.roleKey}
                </Badge>
            </div>
        </header>
    );
}

