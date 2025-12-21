import { SidebarInset } from '@/components/ui/sidebar';

export function AppLayoutFallback() {
    return (
        <SidebarInset className="flex flex-col">
            <div className="h-14 shrink-0" />
            <main className="flex-1" />
        </SidebarInset>
    );
}
