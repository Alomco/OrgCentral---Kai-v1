import { buildVectorCorpus, serializeVectorCorpus, type VectorBuilderInput } from '../vectorizer';

type Volatility = 'low' | 'medium' | 'high';

const schemaPath = 'prisma/modules/hr_ops.prisma';
const repoContractPath =
    'src/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract.ts';
const repoImplPath = 'src/server/repositories/prisma/hr/time-tracking/prisma-time-entry-repository.ts';
const mapperPath = 'src/server/repositories/mappers/hr/time-tracking/time-entry-mapper.ts';
const typePath = 'src/server/types/hr-ops-types.ts';
const schemaTypesPath = 'src/server/types/hr-time-tracking-schemas.ts';
const securityPath = 'src/server/security/authorization/time-tracking.ts';
const cacheScopesPath = 'src/server/repositories/cache-scopes.ts';
const cacheLibraryPath = 'src/server/lib/cache-tags.ts';
const useCaseDirectory = 'src/server/use-cases/hr/time-tracking';
const apiDirectory = 'src/server/api-adapters/hr/time-tracking';

const TIME_TRACKING_USE_CASE_FILES = [
    'create-time-entry.ts',
    'get-time-entry.ts',
    'list-time-entries.ts',
    'update-time-entry.ts',
    'approve-time-entry.ts',
    'cache-helpers.ts',
    'utils.ts',
];

const CORE_PATHS = [
    schemaPath,
    repoContractPath,
    repoImplPath,
    mapperPath,
    typePath,
    schemaTypesPath,
    securityPath,
    cacheScopesPath,
    cacheLibraryPath,
];

const HR_TIME_TRACKING_DOMAIN = 'hr-time-tracking';
const records: VectorBuilderInput[] = [];

CORE_PATHS.forEach((path) => {
    records.push(
        createRecord({
            path,
            kind: classifyPath(path),
            summary: summarizePath(path),
            tags: deriveTags(path),
            volatility: path === schemaPath ? 'high' : 'medium',
            related: getCoreRelations(path),
            domain: HR_TIME_TRACKING_DOMAIN,
        }),
    );
});

TIME_TRACKING_USE_CASE_FILES.forEach((file) => {
    const useCasePath = `${useCaseDirectory}/${file}`;
    const controllerPath = `${apiDirectory}/${file}`;

    records.push(
        createRecord({
            path: useCasePath,
            kind: file.endsWith('.ts') ? 'use-case' : 'other',
            summary: `HR time tracking use-case helper ${file}`,
            tags: ['hr', 'time-tracking', file.includes('cache') ? 'cache' : 'use-case'],
            volatility: 'medium',
            related: [repoContractPath, schemaTypesPath, cacheLibraryPath, securityPath],
            domain: HR_TIME_TRACKING_DOMAIN,
        }),
    );

    records.push(
        createRecord({
            path: controllerPath,
            kind: 'api-controller',
            summary: `Controller delegating to ${file}`,
            tags: ['api', 'nextjs'],
            volatility: 'low',
            related: [useCasePath, schemaTypesPath],
            domain: HR_TIME_TRACKING_DOMAIN,
        }),
    );
});

export const hrTimeTrackingVectorCorpus = buildVectorCorpus({
    records,
});

export const hrTimeTrackingVectorJson = serializeVectorCorpus(hrTimeTrackingVectorCorpus);

function createRecord(options: {
    path: string;
    kind: string;
    summary: string;
    tags?: string[];
    volatility?: Volatility;
    related?: string[];
    domain?: string;
}): VectorBuilderInput {
    const features = buildFeatures(options.path, options.kind, options.tags);
    return {
        path: options.path,
        metadata: {
            kind: options.kind,
            summary: options.summary,
            tags: options.tags,
            volatility: options.volatility,
        },
        features,
        related: options.related,
        domain: options.domain,
    };
}

function buildFeatures(path: string, kind: string, tags: string[] = []): { key: string; weight?: number }[] {
    const directory = path.split('/').slice(0, -1).join('/') || '.';
    const filename = path.split('/').pop() ?? path;
    const extension = filename.split('.').pop() ?? '';
    const directoryTokens = directory.split('/');

    const baseFeatures = [
        { key: `kind:${kind}`, weight: 1.5 },
        { key: `ext:${extension}` },
        { key: `dir:${directory}` },
        ...directoryTokens.map((token) => ({ key: `segment:${token}` })),
        { key: `file:${filename}`, weight: 1.2 },
    ];

    const tagFeatures = tags.map((tag) => ({ key: `tag:${tag}`, weight: 0.8 }));
    return [...baseFeatures, ...tagFeatures];
}

function classifyPath(path: string): string {
    if (path.startsWith('prisma')) {
        return 'schema';
    }
    if (path.includes('/repositories/prisma/')) {
        return 'repository';
    }
    if (path.includes('/repositories/contracts/')) {
        return 'repository-contract';
    }
    if (path.includes('/mappers/')) {
        return 'mapper';
    }
    if (path.includes('/types/')) {
        return 'type';
    }
    if (path.includes('/security/')) {
        return 'security';
    }
    if (path.includes('/lib/cache') || path.endsWith('cache-scopes.ts')) {
        return 'cache';
    }
    if (path.includes('/use-cases/')) {
        return 'use-case';
    }
    if (path.includes('/api-adapters/')) {
        return 'api-controller';
    }
    return 'other';
}

function summarizePath(path: string): string {
    if (path === schemaPath) {
        return 'HR ops Prisma schema definitions (including time entries)';
    }
    if (path === repoContractPath) {
        return 'Repository interface for time entries';
    }
    if (path === repoImplPath) {
        return 'Prisma implementation of time entry repository';
    }
    if (path === mapperPath) {
        return 'Mapper between Prisma TimeEntry and domain TimeEntry';
    }
    if (path === typePath) {
        return 'Domain types for HR operations (includes TimeEntry)';
    }
    if (path === schemaTypesPath) {
        return 'Zod schemas for time tracking payloads';
    }
    if (path === securityPath) {
        return 'Authorization helpers for time tracking';
    }
    if (path === cacheScopesPath) {
        return 'Cache scopes registry (includes time entry scope)';
    }
    if (path === cacheLibraryPath) {
        return 'Cache tag helpers for tenant-scoped invalidation';
    }
    return `Time tracking path ${path}`;
}

function deriveTags(path: string): string[] {
    const tags: string[] = ['hr', 'time-tracking'];
    if (path === schemaPath) {
        tags.push('prisma', 'schema');
    }
    if (path === repoContractPath || path === repoImplPath) {
        tags.push('repository');
    }
    if (path === mapperPath) {
        tags.push('mapper');
    }
    if (path === schemaTypesPath) {
        tags.push('zod', 'schema');
    }
    if (path === securityPath) {
        tags.push('authorization');
    }
    if (path === cacheLibraryPath || path === cacheScopesPath) {
        tags.push('cache');
    }
    return tags;
}

function getCoreRelations(path: string): string[] {
    if (path === schemaPath) {
        return [repoContractPath, repoImplPath, mapperPath, typePath];
    }
    if (path === repoContractPath) {
        return [repoImplPath, typePath];
    }
    if (path === repoImplPath) {
        return [repoContractPath, mapperPath, typePath];
    }
    if (path === mapperPath) {
        return [repoContractPath, typePath];
    }
    if (path === schemaTypesPath) {
        return [useCaseDirectory, apiDirectory];
    }
    if (path === securityPath) {
        return [useCaseDirectory];
    }
    if (path === cacheScopesPath || path === cacheLibraryPath) {
        return [useCaseDirectory, repoImplPath];
    }
    return [];
}

