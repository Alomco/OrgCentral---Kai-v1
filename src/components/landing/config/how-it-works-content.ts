export interface GetStartedStep {
    number: string;
    title: string;
    description: string;
}

export const GET_STARTED_STEPS: readonly GetStartedStep[] = [
    {
        number: "1",
        title: "Quick Setup",
        description:
            "Connect your organisation in under 10 minutes with our intelligent setup wizard that configures everything automatically.",
    },
    {
        number: "2",
        title: "Smart Configuration",
        description:
            "Our AI analyzes your needs and pre-configures modules, workflows, and permissions based on your industry and size.",
    },
    {
        number: "3",
        title: "Go Live",
        description:
            "Launch with confidence using our guided migration tools and dedicated success team to ensure smooth adoption.",
    },
];
