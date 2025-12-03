# File Connectivity Vector Runbook

## Purpose
Creates a lightweight vector database that encodes relationships between files so AI agents can discover related surfaces without walking the entire tree.

## Data Flow
1. Author metadata + relationships inside `src/tools/file-connectivity/maps/*.ts`.
2. The vectorizer (`src/tools/file-connectivity/vectorizer.ts`) hashes those features into fixed-length embeddings.
3. `scripts/generate-file-vectors.ts` serializes the result into `var/cache/file-connectivity/*.vectors.json` for cheap lookup.

## Usage
```bash
pnpm tsx scripts/generate-file-vectors.ts
```
- Outputs JSON with `domain`, `embeddingSize`, and `files[]` entries.
- Each file record includes `path`, `embedding` (float array), `metadata`, and `related` paths.

## Extending
- Add new records inside the relevant map module (e.g., `maps/hr-absences.ts`).
- Prefer descriptive `tags`, `summary`, and `volatility` so embeddings reflect intent.
- Re-run the script after edits so downstream tooling sees the refreshed vectors.
