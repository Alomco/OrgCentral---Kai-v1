import StepCard from "@/components/landing/components/StepCard";
import { GET_STARTED_STEPS } from "@/components/landing/config/how-it-works-content";
import { landingFont } from "@/components/landing/config/landing-typography";
import { cn } from "@/lib/utils";

export default function GetStartedSection() {
    return (
        <section id="how-it-works" className={cn(landingFont.className, "py-32 px-8 bg-slate-50 dark:bg-slate-900/50")}>
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 text-slate-900 dark:text-white">
                    Get Started in Minutes, Not Months
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 text-center mb-16 max-w-2xl mx-auto">
                    Our streamlined setup process gets you operational faster than any traditional system
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {GET_STARTED_STEPS.map((step) => (
                        <StepCard key={step.number} step={step} />
                    ))}
                </div>
            </div>
        </section>
    );
}
