import type { ReactNode } from 'react';

export function HrPageHeader(props: { title: string; description?: string; actions?: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 className="text-2xl font-semibold">{props.title}</h1>
                {props.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
                ) : null}
            </div>
            {props.actions ? <div className="flex flex-wrap items-center gap-2">{props.actions}</div> : null}
        </div>
    );
}

