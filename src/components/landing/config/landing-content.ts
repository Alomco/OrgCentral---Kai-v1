export interface NavLinkConfig {
    label: string;
    href: string;
}

export type FeatureIconKey =
    | "hr"
    | "finance"
    | "scheduling"
    | "service"
    | "policy"
    | "compliance"
    | "analytics";

export interface FeatureHighlight {
    icon: FeatureIconKey;
    title: string;
    description: string;
    features: readonly string[];
}

export const LANDING_NAV_LINKS: readonly NavLinkConfig[] = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#waitlist" },
];

export const HERO_SUBTITLE =
    "Streamline HR, Finance, Compliance & Operations with our revolutionary all-in-one platform. Built for modern teams who demand excellence.";

export const FEATURE_HIGHLIGHTS: readonly FeatureHighlight[] = [
    {
        icon: "hr",
        title: "Smart HR Management",
        description: "Complete employee lifecycle management with AI-powered insights",
        features: [
            "Intelligent Recruitment & ATS",
            "Automated Onboarding Workflows",
            "Performance Analytics",
            "Smart Leave Management",
        ],
    },
    {
        icon: "finance",
        title: "Finance & Payroll",
        description: "Automated financial operations with real-time insights",
        features: [
            "Smart Invoicing & Billing",
            "AI Expense Recognition",
            "Automated Payroll Processing",
            "Predictive Financial Analytics",
        ],
    },
    {
        icon: "scheduling",
        title: "Intelligent Scheduling",
        description:
            "AI-powered staff scheduling with individual profiles and service management",
        features: [
            "Personal Rota Management linked to HR profiles",
            "Service Rota System for client bookings",
            "Smart Auto-Rostering by skills & availability",
            "Real-time shift swapping & notifications",
            "Integrated time tracking & attendance",
        ],
    },
    {
        icon: "service",
        title: "Service Management",
        description: "Comprehensive service booking and rota management system",
        features: [
            "Client service booking portal",
            "Service-specific staff allocation",
            "Resource & equipment scheduling",
            "Service performance analytics",
            "Customer feedback integration",
        ],
    },
    {
        icon: "policy",
        title: "Policy Management",
        description: "Centralized policy control with automated compliance tracking",
        features: [
            "Dynamic Policy Creation",
            "Automated Acknowledgments",
            "Compliance Monitoring",
            "Version Control & Audit Trails",
        ],
    },
    {
        icon: "compliance",
        title: "Compliance Suite",
        description: "Industry-specific compliance tools with automated monitoring",
        features: [
            "GDPR, ISO, HACCP Ready",
            "Automated Compliance Checks",
            "Risk Assessment Tools",
            "Audit-Ready Reporting",
        ],
    },
    {
        icon: "analytics",
        title: "Advanced Analytics",
        description: "AI-driven insights and predictive analytics for better decisions",
        features: [
            "Real-time Dashboards",
            "Predictive Analytics",
            "Custom Report Builder",
            "API Integrations",
        ],
    },
];
