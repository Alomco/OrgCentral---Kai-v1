# Repository Mappers

Mapper utilities should convert Prisma database models into domain models and vice versa. They keep domain code agnostic of underlying DB fields, attribute naming, and types.

Best practices:
- Keep mapping logic pure and synchronous when possible for easy testing.
- Add tests for complex mapping transformations (see `__tests__` patterns).
- Avoid database calls in mappers — mappers should only transform shapes.
- Where necessary, keep mappers in the domain folder next to the repository that uses them.

Example mappers exist under `mappers/org/*`, `mappers/hr/*`, and `mappers/auth/*`.
