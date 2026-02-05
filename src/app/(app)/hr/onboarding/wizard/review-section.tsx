import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ReviewSectionProps {
    title: string;
    icon: React.ReactNode;
    stepIndex?: number;
    onEdit?: (stepIndex: number) => void;
    children: React.ReactNode;
}

export function ReviewSection({ title, icon, stepIndex, onEdit, children }: ReviewSectionProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        {icon}
                        <CardTitle className="text-base min-w-0 truncate">{title}</CardTitle>
                    </div>
                    {onEdit && stepIndex !== undefined && (
                        <button
                            type="button"
                            onClick={() => onEdit(stepIndex)}
                            className="shrink-0 text-xs text-primary hover:underline"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export interface ReviewFieldProps {
    label: string;
    value: React.ReactNode;
}

export function ReviewField({ label, value }: ReviewFieldProps) {
    return (
        <div className="flex flex-col gap-1 py-1.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium break-words sm:max-w-[60%] sm:text-right">
                {value ?? 'N/A'}
            </span>
        </div>
    );
}
