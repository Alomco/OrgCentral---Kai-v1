# OrgCentral Development Guide

## Project Overview
OrgCentral is a multi-tenant organization management platform with built-in HR, compliance, and governance features. The application follows clean architecture principles with a strong focus on security, data residency, and compliance. This project incorporates functions and patterns from the old project, with adaptations to fit the new architecture.

## Architecture Layers

### 1. Presentation Layer (`src/app`)
- Next.js 16 application using App Router
- React 19 components with Tailwind CSS and Radix UI
- Client-side state management with Zustand
- Form handling with React Hook Form and Zod validation

### 2. Application Layer (`src/server/use-cases`)
- Business logic orchestration
- Security policy enforcement (RBAC/ABAC)
- Multi-tenant isolation
- See Use-Cases Architecture section below

### 3. API Interface Layer (`src/server/api-adapters`)
- API request/response handling
- Input validation and error mapping
- Format conversion between API and business layers
- See API Adapters Architecture section below

### 4. Domain Layer (`src/server/types`)
- Domain models and interfaces
- Business rules and constraints
- Type definitions shared across layers

### 5. Infrastructure Layer (`src/server/repositories`)
- Data access implementations
- Database interactions via Prisma
- Caching strategies
- Security enforcement at data layer

### 6. Cross-Cutting Concerns
- Security and authorization (`src/server/security`)
- Logging and telemetry (`src/server/logging`, `src/server/telemetry`)
- Common utilities (`src/server/lib`)

## Finding and Using Functions from the Old Project

### How to Locate Functions from the Old Project
1. **Reference the old project**: Check the `old/` directory for existing implementations that can be adapted
2. **Search old codebase patterns**: Look for similar functionality in the old project before implementing new features
3. **Use the old QWEN.md guide**: Refer to `old/QWEN.md` for guidance on finding and adapting functions from the old project, including both use-cases and API adapters

### Migration Considerations
When adapting functions from the old project:
- Map old security models to new RBAC/ABAC implementation
- Update repository access patterns to match new architecture
- Ensure tenant isolation for multi-tenancy compliance
- Apply new error handling patterns
- Update dependencies to match new project structure
- Separate business logic (use-cases) from API concerns (adapters)

## Use-Cases Architecture

### Purpose
Use-cases represent business operations that:
- Orchestrate repositories to fulfill business requirements
- Enforce security policies (RBAC/ABAC)
- Maintain multi-tenant data isolation
- Implement domain business rules

### Structure
```
src/server/use-cases/
├── auth/              # Authentication flows, invitation management
├── hr/               # Human Resources operations
│   ├── absences/     # Time off and leave management
│   ├── leave/        # Leave policies and approvals
│   ├── people/       # Employee profiles and data management
│   ├── performance/  # Performance reviews and evaluations
│   ├── policies/     # HR policy management
│   ├── settings/     # HR configuration and settings
│   ├── time-tracking/# Time tracking features
│   └── training/     # Training and development programs
├── membership/       # Organization membership operations
├── notifications/    # Notification system and templates
├── org/              # Organization management
│   ├── abac/         # Attribute-based access control
│   ├── departments/  # Department structure and management
│   ├── integrations/ # Third-party system integrations
│   ├── notifications/# Organization-level notifications
│   ├── organization/ # Organization profile and settings
│   ├── roles/        # Role-based access management
│   └── users/        # User management within organizations
└── records/          # Compliance and record management
    ├── audit/        # Audit logging and compliance tracking
    ├── privacy/      # Privacy controls and data subject rights
    └── statutory/    # Statutory reporting and compliance
```

### Implementation Pattern
Each use-case file should follow this template:

```typescript
import { withRepositoryAuthorization } from '@/server/repositories/security';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { userRepository } from '@/server/repositories'; // Import required repositories

// Use-case: [clear description of what this use-case does]

export interface [UseCaseName]Input {
  orgId: string;
  userId: string;
  // other required input parameters
}

export interface [UseCaseName]Output {
  // define expected output structure
}

export async function [camelCaseUseCaseName](
  input: [UseCaseName]Input,
): Promise<[UseCaseName]Output> {
  return withRepositoryAuthorization(
    {
      orgId: input.orgId,
      userId: input.userId,
      requiredRoles: ['member'], // Define appropriate RBAC requirements
      action: 'read', // The action being performed
      resourceType: 'user', // The resource type being accessed
      resourceAttributes: {}, // ABAC attributes if needed
    },
    async (context: RepositoryAuthorizationContext) => {
      // Business logic implementation
      // - Validate input parameters
      // - Apply business rules
      // - Use repositories to access data
      // - Return appropriate result
    },
  );
}
```

### Security Enforcement
All use-cases must enforce security through:
- RBAC (Role-Based Access Control) via `withRepositoryAuthorization`
- ABAC (Attribute-Based Access Control) when attribute-based decisions needed
- Tenant isolation to prevent cross-tenant data access
- Data residency and classification controls

### Error Handling
- Propagate repository errors appropriately
- Use custom error types for domain-specific failures
- Maintain security by not leaking sensitive information in errors
- Log security-relevant events for audit purposes

## API Adapters Architecture

### Purpose
API adapters represent the interface layer that:
- Maps API requests to use-case inputs
- Handles input validation using Zod schemas
- Formats use-case outputs for API responses
- Manages API-specific error handling and response mapping

### Structure
```
src/server/api-adapters/
├── auth/              # Authentication API endpoints
├── hr/               # Human Resources API endpoints
│   ├── absences/     # Time off and leave APIs
│   ├── leave/        # Leave policy APIs
│   ├── people/       # Employee profile APIs
│   ├── performance/  # Performance review APIs
│   ├── policies/     # HR policy APIs
│   ├── settings/     # HR configuration APIs
│   ├── time-tracking/# Time tracking APIs
│   └── training/     # Training and development APIs
├── membership/       # Organization membership APIs
├── notifications/    # Notification APIs
├── org/              # Organization management APIs
│   ├── abac/         # Attribute-based access APIs
│   ├── departments/  # Department structure APIs
│   ├── integrations/ # Third-party system integration APIs
│   ├── notifications/# Organization-level notification APIs
│   ├── organization/ # Organization profile APIs
│   ├── roles/        # Role management APIs
│   └── users/        # User management APIs
└── records/          # Compliance and record management APIs
    ├── audit/        # Audit logging APIs
    ├── privacy/      # Privacy control APIs
    └── statutory/    # Statutory compliance APIs
```

### Implementation Pattern
Each API adapter file should follow this template:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { [useCaseName] } from '@/server/use-cases/...';
import type { [UseCaseName]Output } from '@/server/use-cases/...';

// API Adapter: [clear description of what this adapter does]

const [adapterName]InputSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  // other parameters with validation
});

export type [AdapterName]Response = {
  success: true;
  data: [UseCaseName]Output;
} | {
  success: false;
  error: string;
};

export async function [adapterName](
  req: NextApiRequest,
  res: NextApiResponse<[AdapterName]Response>,
): Promise<void> {
  try {
    const validatedInput = [adapterName]InputSchema.parse(req.body);

    const result = await [useCaseName](validatedInput);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation error: ' + error.message });
      return;
    }

    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

## Repository Layer Architecture

### Contract Interface Pattern
```typescript
// contracts/[domain]/[feature]/[repository]-contract.ts
export interface IUserRepository {
  findUser(context: RepositoryAuthorizationContext, userId: string): Promise<User | null>;
  createUser(context: RepositoryAuthorizationContext, userData: UserData): Promise<User>;
  // ... other methods
}
```

### Implementation
```typescript
// prisma/[domain]/[feature]/prisma-[repository].ts
export class PrismaUserRepository extends BasePrismaRepository implements IUserRepository {
  async findUser(context: RepositoryAuthorizationContext, userId: string): Promise<User | null> {
    const record = await this.client.user.findUnique({ where: { id: userId } });
    if (record) {
      this.authorizer.assertTenantRecord(record, context); // Enforce tenant isolation
      return mapPrismaUserToDomain(record);
    }
    return null;
  }
  // ... other implementations
}
```

### Zero-Trust Authorization Workflow
1. **Guard input**: Collect orgId, userId, and RBAC/ABAC requirements
2. **Authorize**: Use `withRepositoryAuthorization` to establish security context
3. **Propagate context**: Pass `RepositoryAuthorizationContext` to repositories
4. **Enforce in repositories**: Call `assertTenantRecord` before data access
5. **Audit + cache**: Use context metadata for logging and caching

## Development Workflow

### 1. Adding a New Feature
1. Check the old project for similar functionality that can be adapted
2. Identify the appropriate domain directory in `src/server/use-cases/`
3. Create the use-case file following the pattern template
4. Define input/output interfaces
5. Implement authorization requirements
6. Add business logic with repository interactions
7. Include proper error handling
8. Write unit tests for the use-case
9. Create the API adapter in `src/server/api-adapters/` following the adapter pattern
10. Implement input validation with Zod
11. Write integration tests for the adapter

### 2. Testing Strategy
- Unit tests for business logic in use-cases
- Integration tests with mocked repositories
- Security tests for authorization enforcement
- Multi-tenancy tests to prevent data leakage
- API adapter tests to verify request/response handling
- Validation tests to ensure proper error responses

### 3. Dependency Management
- Use TypeScript path aliases (e.g., `@/server/...`)
- Follow interface segregation principle
- Maintain clean separation of concerns
- Avoid circular dependencies

## Security Considerations
- All operations must be tenant-scoped
- RBAC/ABAC policies enforced at both service and repository layers
- Input validation for all parameters in API adapters
- Proper error message sanitization to avoid information leakage
- Data residency and classification compliance
- Audit logging for sensitive operations

## Telemetry and Monitoring
- OpenTelemetry integration for distributed tracing
- Structured logging for debugging and monitoring
- Performance metrics for critical paths
- Security event logging for audit purposes

## Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide React
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: Better Auth with custom security layer
- **State Management**: Zustand for client state, server components for server state
- **Validation**: Zod for schema validation
- **Testing**: Vitest, React Testing Library
- **Telemetry**: OpenTelemetry, Pino logger
- **UI Components**: Radix UI primitives, shadcn/ui patterns

## Best Practices
- Follow TypeScript strict mode throughout
- Use discriminated unions for complex state management
- Implement proper error boundaries in UI
- Maintain comprehensive test coverage
- Use consistent naming conventions
- Document API contracts with JSDoc
- Follow accessibility best practices
- Ensure all user inputs are properly validated
- Apply security-first development principles
- When implementing new features, check the old project for existing implementations that can be adapted
- Separate business logic (use-cases) from API concerns (adapters)
- Validate all inputs in API adapters using Zod schemas