import fs from 'node:fs';
import path from 'node:path';
import { TENANT_SCOPED_MODELS } from '@/server/lib/prisma-tenant-scope';

interface SchemaModelInfo {
    name: string;
    orgOptional: boolean;
    hasClassification: boolean;
    hasResidency: boolean;
}

function parseSchemaModels(schema: string): SchemaModelInfo[] {
    const lines = schema.split(/\r?\n/u);
    const models: { name: string; fields: { name: string; type: string }[] }[] = [];
    let current: { name: string; fields: { name: string; type: string }[] } | null = null;

    for (const line of lines) {
        const modelMatch = /^model\s+(\w+)\s+\{/u.exec(line.trim());
        if (modelMatch) {
            current = { name: modelMatch[1], fields: [] };
            models.push(current);
            continue;
        }

        if (!current) {
            continue;
        }

        if (line.trim().startsWith('}')) {
            current = null;
            continue;
        }

        const fieldMatch = /^([A-Za-z0-9_]+)\s+([^\s]+)\s*(.*)$/u.exec(line.trim());
        if (!fieldMatch) {
            continue;
        }

        current.fields.push({ name: fieldMatch[1], type: fieldMatch[2] });
    }

    return models.flatMap((model) => {
        const orgField = model.fields.find((field) => field.name === 'orgId');
        if (!orgField) {
            return [];
        }

        return [
            {
                name: model.name,
                orgOptional: orgField.type.endsWith('?'),
                hasClassification: model.fields.some((field) => field.name === 'dataClassification'),
                hasResidency: model.fields.some((field) => field.name === 'residencyTag'),
            } satisfies SchemaModelInfo,
        ];
    });
}

function auditTenantScopeConfig(models: SchemaModelInfo[]): string[] {
    const issues: string[] = [];
    const configEntries = TENANT_SCOPED_MODELS;
    const configNames = new Set(Object.keys(configEntries));
    const schemaNames = new Set(models.map((model) => model.name));

    for (const model of models) {
        if (!configNames.has(model.name)) {
            issues.push(`Missing tenant scope config for model ${model.name}.`);
            continue;
        }

        const config = configEntries[model.name];

        const schemaRequiresOrg = !model.orgOptional;
        if (schemaRequiresOrg !== config.orgRequired) {
            issues.push(
                `Model ${model.name} orgRequired mismatch: schemaRequiresOrg=${String(schemaRequiresOrg)} configRequiresOrg=${String(config.orgRequired)}.`,
            );
        }

        if (model.hasClassification && !config.classificationField) {
            issues.push(`Model ${model.name} missing dataClassification field in config.`);
        }

        if (!model.hasClassification && config.classificationField) {
            issues.push(`Model ${model.name} has unexpected classificationField in config.`);
        }

        if (model.hasResidency && !config.residencyField) {
            issues.push(`Model ${model.name} missing residencyTag field in config.`);
        }

        if (!model.hasResidency && config.residencyField) {
            issues.push(`Model ${model.name} has unexpected residencyField in config.`);
        }
    }

    for (const name of configNames) {
        if (!schemaNames.has(name)) {
            issues.push(`Config references unknown model ${name}.`);
        }
    }

    return issues;
}

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');
const models = parseSchemaModels(schema);
const issues = auditTenantScopeConfig(models);

if (issues.length > 0) {
    console.error('Tenant scope audit failed:');
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exitCode = 1;
} else {
    console.log(`Tenant scope audit passed for ${String(models.length)} models.`);
}
