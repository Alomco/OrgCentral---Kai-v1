import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { HrPageHeader } from './hr-page-header';

export function HrPlaceholder(props: { title: string; description: string; children?: ReactNode }) {
    return (
        <div className="space-y-6">
            <HrPageHeader title={props.title} description={props.description} />
            <Card>
                <CardHeader>
                    <CardTitle>Work in progress</CardTitle>
                    <CardDescription>This HR page is being migrated from the legacy app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Next steps: data loader, role-aware UI, and server actions.</p>
                    {props.children ? <div className="pt-2">{props.children}</div> : null}
                </CardContent>
            </Card>
        </div>
    );
}

