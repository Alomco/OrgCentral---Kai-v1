import type { LucideIcon } from "lucide-react";
import {
    BadgeCheck,
    BriefcaseBusiness,
    CalendarClock,
    ChartNoAxesCombined,
    FileText,
    HandCoins,
    Repeat2,
} from "lucide-react";

import type { FeatureIconKey } from "@/components/landing/config/landing-content";

export const FEATURE_ICON_COMPONENTS: Record<FeatureIconKey, LucideIcon> = {
    hr: BriefcaseBusiness,
    finance: HandCoins,
    scheduling: CalendarClock,
    service: Repeat2,
    policy: FileText,
    compliance: BadgeCheck,
    analytics: ChartNoAxesCombined,
};

export const FEATURE_ICON_LABELS: Record<FeatureIconKey, string> = {
    hr: "Human Resources",
    finance: "Finance and Payroll",
    scheduling: "Intelligent Scheduling",
    service: "Service Management",
    policy: "Policy Management",
    compliance: "Compliance Suite",
    analytics: "Advanced Analytics",
};
