import type { ReactNode } from "react";
import { headers } from "next/headers";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { DevelopmentSecurityWidget } from "@/components/dev/DevelopmentSecurityWidget";
import { DevelopmentToolbar, DevelopmentToolbarProvider } from "@/components/dev/toolbar";
import { TenantThemeRegistry } from "@/components/theme/tenant-theme-registry";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { UiStyleProvider } from "@/components/theme/ui-style-provider";
import { Providers } from "../providers";

export async function RootProviders({ children }: { children: ReactNode }) {
    const nonce = (await headers()).get("x-nonce") ?? undefined;

    return (
        <NuqsAdapter>
            <Providers>
                <ThemeProvider>
                    <UiStyleProvider nonce={nonce}>
                        <DevelopmentToolbarProvider>
                            {process.env.NODE_ENV === "development" ? (
                                <>
                                    <DevelopmentSecurityWidget />
                                    <DevelopmentToolbar />
                                </>
                            ) : null}
                            <TenantThemeRegistry orgId={null} nonce={nonce}>
                                {children}
                            </TenantThemeRegistry>
                        </DevelopmentToolbarProvider>
                    </UiStyleProvider>
                </ThemeProvider>
            </Providers>
        </NuqsAdapter>
    );
}
