# Repository Issues (src/server/repositories)

1. **Constructor Injection Missing in BasePrismaRepository Dependents**
   - Files: `src/server/repositories/prisma/**/*`
   - Detail: Concrete repositories rely on the default exported Prisma singleton instead of injecting dependencies through constructors, breaking the SOLID requirement from `copilot-instructions.md` and `docs/backend-migration-plan.md`.

2. **Cache Tag Registration Absent on Repository Reads**
   - Files: `src/server/repositories/prisma/hr/leave/prisma-leave-balance-repository.ts` (and other read-heavy repositories)
   - Detail: Read methods return data without calling `registerCacheTag` with residency/classification scopes, so Cache Components cannot track dependencies per the frontend blueprint.

3. **Compliance Metadata Missing From Leave Balance Writes**
   - Files: `src/server/repositories/mappers/hr/leave/leave-mapper.ts`
   - Detail: Metadata builders exclude residency, classification, and audit stamps required by `old/docs/requirements/02-security-and-compliance.md`, meaning persisted records lack mandatory governance markers.

4. **Incorrect Relative Imports in Repository Contracts**
   - Files: `src/server/repositories/contracts/hr/leave/leave-balance-repository-contract.ts` (and similar contracts)
   - Detail: Contracts import `../../../types/leave-types`, but there is no `types/` folder under `src/server/repositories`; these modules should reference `@/server/types/leave-types`.

5. **Cache Invalidation Missing When Creating Policies On-Demand**
   - Files: `src/server/repositories/prisma/hr/leave/prisma-leave-balance-repository.ts`
   - Detail: `ensurePolicyForLeaveType` creates new leave policies but never invalidates the policy cache tags, leaving downstream UI/state stale.
