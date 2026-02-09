import type { ComplianceTemplate } from '@/server/types/compliance-types';

export function buildTemplatesSummary(templates: ComplianceTemplate[]) {
    const categories = new Set<string>();
    for (const template of templates) {
        if (template.categoryKey) {
            categories.add(template.categoryKey);
        }
    }

    const categoryKeys = Array.from(categories);
    const preview = categoryKeys.slice(0, 6);
    const overflowCount = Math.max(0, categoryKeys.length - preview.length);

    return {
        count: templates.length,
        categories: preview,
        categoryCount: categoryKeys.length,
        overflowCount,
    };
}
