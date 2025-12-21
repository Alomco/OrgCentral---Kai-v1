import { FEATURE_ICON_COMPONENTS, FEATURE_ICON_LABELS } from "@/components/landing/config/feature-icons";
import type { FeatureHighlight } from "@/components/landing/config/landing-content";

interface FeatureCardProps {
    feature: FeatureHighlight;
}

export default function FeatureCard({ feature }: FeatureCardProps) {
    const Icon = FEATURE_ICON_COMPONENTS[feature.icon];
    const label = FEATURE_ICON_LABELS[feature.icon];

    return (
        <article className="glass-card-wrapper group relative rounded-2xl h-full">
            <div className="glass-card relative rounded-2xl p-8 h-full flex flex-col bg-white/60 dark:bg-slate-900/40">
                <div className="feature-icon mb-6 flex size-16 items-center justify-center rounded-2xl text-white shadow-lg">
                    <Icon aria-hidden className="size-7" />
                    <span className="sr-only">{label}</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-slate-700 dark:text-slate-300">{feature.description}</p>
                <ul className="pt-6 space-y-2 text-sm text-slate-600 dark:text-slate-400 mt-auto">
                    {feature.features.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                            <span aria-hidden className="mt-0.5 text-base font-semibold text-sky-400 dark:text-sky-500">
                                ✓
                            </span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}
