# Edge Runtime Evaluation

## Current status
No API routes are opted into the edge runtime yet. Most handlers depend on Prisma, Better Auth, or other Node-only libraries, so they must remain on the default node runtime.

## Eligibility checklist
A route can opt into the edge runtime when it meets all of the following:
- No Prisma or other native Node database drivers.
- No use of node:crypto, node:fs, or other Node-only APIs.
- Imported controllers and services only use Web APIs (fetch, Request, Response).
- No dependency on libraries that are not edge-compatible.

## Candidates to revisit
- Read-only endpoints that call external HTTP services via fetch.
- Public config endpoints that return static data.
- Future routes using edge-compatible data access (for example, Prisma Accelerate).

When a route is eligible, add `export const runtime = 'edge';` to the route handler file.
