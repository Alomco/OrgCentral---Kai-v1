import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/landing/components/ThemeToggle";

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    footer?: ReactNode;
    children: ReactNode;
}

export default function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
            {/* Animated background elements */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-linear-to-br from-indigo-400/30 via-purple-400/25 to-pink-400/20 blur-3xl dark:from-indigo-400/20 dark:via-purple-400/20 dark:to-pink-400/20" />
                <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-linear-to-tl from-cyan-400/25 via-blue-400/20 to-indigo-400/20 blur-3xl dark:from-cyan-400/20 dark:via-blue-400/20 dark:to-indigo-400/20" />
                <div className="absolute left-0 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full bg-linear-to-br from-violet-400/20 to-fuchsia-400/15 blur-3xl dark:from-violet-400/20 dark:to-fuchsia-400/20" />
            </div>

            {/* Main content */}
            <div className="relative z-10 w-full max-w-md px-4 md:max-w-xl lg:max-w-2xl">
                {/* Logo and theme toggle */}
                <div className="mb-4 flex items-center justify-between md:mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/40 md:h-11 md:w-11">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 md:text-xl dark:text-white">OrgCentral</h1>
                            <p className="text-[10px] text-slate-600 md:text-xs dark:text-slate-400">Enterprise Platform</p>
                        </div>
                    </div>
                    <ThemeToggle />
                </div>

                {/* Card */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl md:p-7 dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/20">
                    {/* Gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500/8 via-transparent to-purple-500/8 dark:from-indigo-500/5 dark:to-purple-500/5" />

                    {/* Header */}
                    <div className="relative mb-5 text-center md:mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                            {title}
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                            {subtitle}
                        </p>
                    </div>

                    {/* Form content */}
                    <div className="relative">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer ? (
                        <div className="relative mt-5 border-t border-slate-200 pt-4 text-center dark:border-slate-700/60">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
