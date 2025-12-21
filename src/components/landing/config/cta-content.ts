export interface CtaContent {
    title: string;
    subtitle: string;
    buttonText: string;
    industries: readonly string[];
}

export const CTA_CONTENT: CtaContent = {
    title: "Ready to Transform Your Organisation?",
    subtitle:
        "Join thousands of forward-thinking organisations already on our waitlist. Be among the first to experience the future of organisation management.",
    buttonText: "Join the Revolution",
    industries: [
        "Healthcare",
        "Manufacturing",
        "Retail & E-commerce",
        "Technology",
        "Education",
        "Financial Services",
        "Non-profit",
        "Other",
    ],
};
