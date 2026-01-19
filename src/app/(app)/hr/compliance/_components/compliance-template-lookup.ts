import type { ComplianceTemplate, ComplianceTemplateItem } from '@/server/types/compliance-types';

export interface ComplianceTemplateItemMeta {
    item: ComplianceTemplateItem;
    templateName: string;
    categoryKey?: string;
}

export function buildTemplateItemLookup(
    templates: ComplianceTemplate[],
): Map<string, ComplianceTemplateItemMeta> {
    const lookup = new Map<string, ComplianceTemplateItemMeta>();

    for (const template of templates) {
        for (const item of template.items) {
            lookup.set(item.id, {
                item,
                templateName: template.name,
                categoryKey: template.categoryKey ?? undefined,
            });
        }
    }

    return lookup;
}
