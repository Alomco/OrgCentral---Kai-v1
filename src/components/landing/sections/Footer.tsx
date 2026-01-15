import Link from "next/link";

import { landingFont } from "@/components/landing/config/landing-typography";
import { cn } from "@/lib/utils";

export default function Footer() {
    const links = [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Contact", href: "/contact" },
    ];
    const socials = [
        { name: "Twitter", symbol: "𝕏" },
        { name: "LinkedIn", symbol: "in" },
        { name: "Facebook", symbol: "f" },
    ];

    return (
        <footer className={cn(landingFont.className, "bg-slate-50 dark:bg-slate-950 py-16 px-8 border-t border-slate-200 dark:border-slate-800")}>
            <div className="max-w-6xl mx-auto text-center">
                <div className="flex flex-wrap justify-center gap-8 mb-8">
                    {links.map((link) => (
                        <Link key={link.label} href={link.href} className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {socials.map((social) => (
                        <a key={social.name} href="#" className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-linear-to-br hover:from-blue-500 hover:to-purple-500 hover:text-white dark:hover:from-blue-600 dark:hover:to-purple-600 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold transition-all duration-300" aria-label={social.name}>
                            {social.symbol}
                        </a>
                    ))}
                </div>

                <p className="text-slate-600 dark:text-slate-400">&copy; 2025 OrgCentral. All rights reserved. Built for the future.</p>
            </div>
        </footer>
    );
}
