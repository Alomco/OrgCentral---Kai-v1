import WaitlistForm from "@/components/landing/components/WaitlistForm";
import { CTA_CONTENT } from "@/components/landing/config/cta-content";
import { landingFont } from "@/components/landing/config/landing-typography";
import { cn } from "@/lib/utils";

export default function CtaSection() {
    return (
        <section id="waitlist" className={cn(landingFont.className, "py-32 px-8 text-center bg-white dark:bg-slate-950")}>
            <div className="max-w-3xl mx-auto glass-cta rounded-3xl p-16 relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 -z-10"></div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">{CTA_CONTENT.title}</h2>
                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">{CTA_CONTENT.subtitle}</p>

                <WaitlistForm content={CTA_CONTENT} />
            </div>
        </section>
    );
}
