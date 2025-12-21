export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-7 w-40 rounded bg-muted" />
                <div className="h-4 w-72 rounded bg-muted" />
            </div>
            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
                <div className="px-6">
                    <div className="h-4 w-40 rounded bg-muted" />
                    <div className="mt-3 h-3 w-80 rounded bg-muted" />
                </div>
                <div className="px-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <div className="h-3 w-28 rounded bg-muted" />
                            <div className="h-9 w-full rounded bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-28 rounded bg-muted" />
                            <div className="h-9 w-full rounded bg-muted" />
                        </div>
                    </div>
                    <div className="mt-6 h-10 w-full rounded bg-muted/60" />
                    <div className="mt-6 h-9 w-24 rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}
