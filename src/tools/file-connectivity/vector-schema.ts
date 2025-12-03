export type VectorFloat = number;

export interface FileVectorMetadata {
    kind: string;
    scope?: string;
    tags?: string[];
    summary?: string;
    volatility?: 'low' | 'medium' | 'high';
}

export interface FileVectorRecord {
    path: string;
    embedding: VectorFloat[];
    metadata: FileVectorMetadata;
    related?: string[];
    domain?: string;
}

export interface FileVectorCorpus {
    version: number;
    generatedAt: string;
    embeddingSize: number;
    files: FileVectorRecord[];
}
