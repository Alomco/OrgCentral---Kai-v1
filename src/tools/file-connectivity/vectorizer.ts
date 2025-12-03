import crypto from 'node:crypto';
import { type FileVectorCorpus, type FileVectorRecord, type FileVectorMetadata } from './vector-schema';

export interface VectorFeature {
    key: string;
    weight?: number;
}

export interface VectorBuilderInput {
    path: string;
    metadata: FileVectorMetadata;
    features: VectorFeature[];
    related?: string[];
    domain?: string;
}

const DEFAULT_EMBEDDING_SIZE = 24;

export function buildFileVector(input: VectorBuilderInput, embeddingSize = DEFAULT_EMBEDDING_SIZE): FileVectorRecord {
    const embedding = new Array<number>(embeddingSize).fill(0);

    input.features.forEach((feature) => {
        const hash = hashFeature(`${input.path}:${feature.key}`);
        const slot = hash % embeddingSize;
        const magnitude = feature.weight ?? 1;
        embedding[slot] += magnitude;
    });

    const normalized = normalizeVector(embedding);

    return {
        path: normalizePath(input.path),
        embedding: normalized,
        metadata: input.metadata,
        related: input.related?.map((item) => normalizePath(item)),
        domain: input.domain,
    };
}

export interface VectorCorpusInput {
    records: VectorBuilderInput[];
    embeddingSize?: number;
}

export function buildVectorCorpus(input: VectorCorpusInput): FileVectorCorpus {
    const embeddingSize = input.embeddingSize ?? DEFAULT_EMBEDDING_SIZE;
    const files = input.records.map((record) => buildFileVector(record, embeddingSize));

    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        embeddingSize,
        files,
    };
}

export function serializeVectorCorpus(database: FileVectorCorpus): string {
    return JSON.stringify(database, null, 2);
}

function hashFeature(feature: string): number {
    const hash = crypto.createHash('sha256').update(feature).digest();
    return hash.readUInt32BE(0);
}

function normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

function normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
}
