import { buildVectorCorpus, serializeVectorCorpus, type VectorBuilderInput } from '../vectorizer';

type Volatility = 'low' | 'medium' | 'high';

const schemaPath = 'prisma/modules/hr_ops.prisma';
const repoContractPath =
    'src/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract.ts';
const repoImplPath = 'src/server/repositories/prisma/hr/absences/prisma-unplanned-absence-repository.ts';
const mapperPath = 'src/server/repositories/mappers/hr/absences/absences-mapper.ts';
const typePath = 'src/server/types/hr-ops-types.ts';
const schemaTypesPath = 'src/server/types/hr-absence-schemas.ts';
const securityPath = 'src/server/security/authorization/absences.ts';
const cacheLibraryPath = 'src/server/lib/cache-tags.ts';
const useCaseDirectory = 'src/server/use-cases/hr/absences';
const apiDirectory = 'src/server/api-adapters/hr/absences';
const routeBase = 'src/app/api/hr/absences';

const ABSENCE_USE_CASE_FILES = [
    'report-unplanned-absence.ts',
    'get-absences.ts',
    'approve-unplanned-absence.ts',
    'update-unplanned-absence.ts',
    'record-return-to-work.ts',
    'add-absence-attachments.ts',
    'remove-absence-attachment.ts',
    'delete-unplanned-absence.ts',
];

const ROUTE_TO_CONTROLLER: Record<string, string[]> = {
    'route.ts': ['report-unplanned-absence.ts', 'get-absences.ts'],
    '[absenceId]/route.ts': ['update-unplanned-absence.ts', 'delete-unplanned-absence.ts'],
    '[absenceId]/approve/route.ts': ['approve-unplanned-absence.ts'],
    '[absenceId]/return-to-work/route.ts': ['record-return-to-work.ts'],
    '[absenceId]/attachments/route.ts': ['add-absence-attachments.ts', 'remove-absence-attachment.ts'],
};

const CORE_PATHS = [
    schemaPath,
    repoContractPath,
    repoImplPath,
    mapperPath,
    typePath,
    schemaTypesPath,
    securityPath,
    cacheLibraryPath,
];

const HR_ABSENCE_DOMAIN = 'hr-absences';
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
            domain: HR_ABSENCE_DOMAIN,
        }),
    );
});

ABSENCE_USE_CASE_FILES.forEach((file) => {
    const useCasePath = `${useCaseDirectory}/${file}`;
    const controllerPath = `${apiDirectory}/${file}`;

    records.push(
        createRecord({
            path: useCasePath,
            kind: 'use-case',
            summary: `HR absence use-case ${file}`,
            tags: ['hr', 'absence', 'use-case'],
            volatility: 'medium',
            related: [repoContractPath, schemaTypesPath, cacheLibraryPath, securityPath],
            domain: HR_ABSENCE_DOMAIN,
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
            domain: HR_ABSENCE_DOMAIN,
        }),
    );
});

Object.entries(ROUTE_TO_CONTROLLER).forEach(([routeFile, controllers]) => {
    const routePath = `${routeBase}/${routeFile}`;
    records.push(
        createRecord({
            path: routePath,
            kind: 'route',
            summary: `Next.js route ${routeFile}`,
            tags: ['nextjs', 'api'],
            volatility: 'low',
            related: controllers.map((file) => `${apiDirectory}/${file}`),
            domain: HR_ABSENCE_DOMAIN,
        }),
    );
});

export const hrAbsenceVectorCorpus = buildVectorCorpus({
    records,
});

export const hrAbsenceVectorJson = serializeVectorCorpus(hrAbsenceVectorCorpus);

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
    if (path.includes('/lib/cache')) {
        return 'cache';
    }
    if (path.includes('/use-cases/')) {
        return 'use-case';
    }
    if (path.includes('/api-adapters/')) {
        return 'api-controller';
    }
    if (path.includes('/app/api/')) {
        return 'route';
    }
    return 'other';
}

function summarizePath(path: string): string {
    if (path === schemaPath) {
        return 'HR Ops Prisma schema definitions';
    }
    if (path === repoContractPath) {
        return 'Repository interface for unplanned absences';
    }
    if (path === repoImplPath) {
        return 'Prisma implementation of unplanned absences repository';
    }
    if (path === mapperPath) {
        return 'Mapper translating Prisma records to domain absences';
    }
    if (path === typePath) {
        return 'Absence domain type declarations';
    }
    if (path === schemaTypesPath) {
        return 'Zod schemas for absence payloads';
    }
    if (path === securityPath) {
        return 'Authorization helpers for absence actions';
    }
    if (path === cacheLibraryPath) {
        return 'Cache tag utilities for absences';
    }
    return `Connectivity record for ${path}`;
}

function deriveTags(path: string): string[] {
    if (path.startsWith('prisma')) {
        return ['prisma', 'db'];
    }
    if (path.includes('/repositories/prisma/')) {
        return ['prisma', 'repository'];
    }
    if (path.includes('/repositories/contracts/')) {
        return ['contract', 'repository'];
    }
    if (path.includes('/use-cases/')) {
        return ['use-case'];
    }
    if (path.includes('/api-adapters/')) {
        return ['api', 'controller'];
    }
    if (path.includes('/app/api/')) {
        return ['nextjs', 'route'];
    }
    if (path.includes('/types/')) {
        return ['types'];
    }
    if (path.includes('/security/')) {
        return ['security'];
    }
    if (path.includes('/lib/cache')) {
        return ['cache'];
    }
    return ['other'];
}

function getCoreRelations(path: string): string[] {
    if (path === repoContractPath) {
        return [repoImplPath, `${useCaseDirectory}/get-absences.ts`, `${useCaseDirectory}/update-unplanned-absence.ts`];
    }
    if (path === repoImplPath) {
        return [schemaPath, mapperPath];
    }
    if (path === mapperPath) {
        return [typePath];
    }
    if (path === schemaTypesPath) {
        return [typePath, ...ABSENCE_USE_CASE_FILES.map((file) => `${apiDirectory}/${file}`)];
    }
    if (path === securityPath) {
        return ABSENCE_USE_CASE_FILES.map((file) => `${useCaseDirectory}/${file}`);
    }
    if (path === cacheLibraryPath) {
        return ABSENCE_USE_CASE_FILES.map((file) => `${useCaseDirectory}/${file}`);
    }
    return [];
}

