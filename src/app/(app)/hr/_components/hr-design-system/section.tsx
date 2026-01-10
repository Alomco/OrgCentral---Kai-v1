import type { ReactNode } from 'react';

export interface HrSectionProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    children: ReactNode;
    actions?: ReactNode;
}

export function HrSection({ title, description, icon, children, actions }: HrSectionProps) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon ? <span className="text-[hsl(var(--primary))]">{icon}</span> : null}
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        {description ? (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        ) : null}
                    </div>
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}
