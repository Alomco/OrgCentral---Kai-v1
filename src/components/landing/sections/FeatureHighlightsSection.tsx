import FeatureCard from "@/components/landing/components/FeatureCard";
import { FEATURE_HIGHLIGHTS } from "@/components/landing/config/landing-content";
import { landingFont } from "@/components/landing/config/landing-typography";
import { cn } from "@/lib/utils";

export default function FeatureHighlightsSection() {
    return (
        <section
            id="features"
            className={cn(
                landingFont.className,
                "relative overflow-hidden px-6 py-24 md:px-8 lg:py-32 bg-white dark:bg-slate-950"
            )}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-10 mx-auto h-[420px] max-w-4xl rounded-full bg-gradient-to-r from-sky-200/40 via-purple-200/40 to-pink-200/40 dark:from-sky-900/20 dark:via-purple-900/20 dark:to-pink-900/20 opacity-70 blur-3xl z-0"
            />

            <div className="mx-auto max-w-5xl text-center relative z-10">
                <p className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Platform
                </p>
                <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white md:text-5xl">
                    Powerful Features, Seamless Experience
                </h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 md:text-xl">
                    Everything your organisation needs to thrive in one beautifully integrated platform
                </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-6xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                {FEATURE_HIGHLIGHTS.map((feature) => (
                    <FeatureCard key={feature.title} feature={feature} />
                ))}
            </div>
        </section>
    );
}
