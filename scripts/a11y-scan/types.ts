export type A11yImpact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface A11yIssueNode {
    html: string;
    target: string[];
    failureSummary?: string;
}

export interface A11yIssue {
    id: string;
    impact: A11yImpact;
    description: string;
    help: string;
    helpUrl: string;
    nodes: A11yIssueNode[];
}

export interface ScanResult {
    url: string;
    timestamp: string;
    violations: A11yIssue[];
    passes: number;
    incomplete: number;
}

export interface PrioritizedIssueEntry {
    url: string;
    issue: A11yIssue;
}

export interface PrioritizedIssues {
    critical: PrioritizedIssueEntry[];
    serious: PrioritizedIssueEntry[];
    moderate: PrioritizedIssueEntry[];
    minor: PrioritizedIssueEntry[];
}

export interface PrioritizationSummary {
    prioritized: PrioritizedIssues;
    colorContrastIssues: PrioritizedIssueEntry[];
    imageAltIssues: PrioritizedIssueEntry[];
    otherIssues: Map<string, PrioritizedIssueEntry[]>;
}
