import type { GetStartedStep } from "@/components/landing/config/how-it-works-content";

interface StepCardProps {
    step: GetStartedStep;
}

export default function StepCard({ step }: StepCardProps) {
    return (
        <article className="glass-card-wrapper rounded-2xl h-full">
            <div className="glass-card rounded-2xl p-8 text-center h-full flex flex-col bg-white/60 dark:bg-slate-900/40">
                <div className="w-20 h-20 rounded-full step-number flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white shadow-lg">
                    {step.number}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-auto">{step.description}</p>
            </div>
        </article>
    );
}
