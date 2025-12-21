# Frontend Animation Architecture

## Goals
- Preserve Cache Component benefits by defaulting to CSS transitions.
- Centralize motion tokens to avoid duplicated "magic" numbers.
- Keep Framer Motion usage isolated behind `use client` wrappers for complex interactions.

## Folder Layout
```
src/
  lib/
    animation/
      tokens.ts           # Shared durations, easings, springs, delays.
      variants.ts         # Reusable Framer Motion variant builders.
  components/
    animation/
      motion-primitives.tsx  # Client-only primitives (MotionFade, MotionSlide, etc.).
  hooks/
    use-prefers-reduced-motion.ts # Media-query hook that honors accessibility settings.
```

## Usage Guidelines
1. **CSS First:** Use Tailwind utilities or plain `@keyframes` for standard hover, accordion, modal, and scroll reveal effects.
2. **Framer Motion When Needed:** Import primitives from `@/components/animation/motion-primitives` only when an interaction needs multi-step sequencing, enter/exit orchestration, or physics.
3. **Client Boundaries:** Every component that renders `motion.*` must live inside a `use client` boundary; the shared primitives already satisfy this.
4. **Accessibility:** Always respect `usePrefersReducedMotion()` (or the primitive's built-in handling) to disable non-essential motion when users request it.
5. **Tokens Everywhere:** Refer to `@/lib/animation/tokens` if you need the same duration for CSS transitions (`transition-duration: var(--duration-fast);` via custom properties) and Framer Motion props to keep motion in sync.

## Future Extensions
- Add more primitives (e.g., `MotionScale`, `MotionStaggerList`) next to `motion-primitives.tsx` as patterns emerge.
- Provide Tailwind plugin utilities that expose the token values to CSS custom properties for theme-wide control.
- If we introduce physics-heavy interactions, create feature-specific components under `src/features/<feature>/components/animation/` to avoid bloating the shared primitives file.
