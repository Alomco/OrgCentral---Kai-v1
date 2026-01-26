# Home Page Migration Plan

This document outlines the phased approach to migrating the legacy Home Page (`old/src/app/page.tsx`) to the modern architecture in `orgcentral`.

**Goal:** Replicate visual and functional parity using Next.js 16, Server Components, Server Actions, and Tailwind CSS, while adhering to the Clean Architecture principles.

## Critical Requirement: Highest Type Safety
**Mandate:** The application must maintain the highest level of type safety throughout the migration.
*   **Strict Mode:** All new code must comply with strict TypeScript configuration.
*   **No `any`:** The usage of `any` is strictly prohibited. All data structures, API responses, and component props must be explicitly typed.
*   **Zod Validation:** All external data (forms, API payloads) must be validated using Zod schemas.
*   **Typed Server Actions:** Server Actions must use strict input and output types, ensuring end-to-end type safety from the server to the client.
*   **Component Props:** All React components must have fully typed props interfaces.

## Phase 1: Preparation & Assets
**Objective:** Prepare the groundwork for UI components and style extraction.

1.  **Analyze Styles:**
    *   The legacy page uses `styled-jsx` with custom animations (`float`, `fadeInUp`) and glassmorphism effects (`glass-card`).
    *   **Action:** Convert these custom styles into Tailwind CSS utility classes or extend `tailwind.config.ts` if specific animations are reusable.
    *   **Action:** Ensure `lucide-react` is available (already in `package.json`).

2.  **Asset Extraction:**
    *   Identify any static assets (images, SVGs). The legacy page mostly uses Lucide icons and CSS gradients.

## Phase 2: Component Decomposition (The "Dumb" Components)
**Objective:** Build reusable, non-interactive UI sections. These will be Server Components where possible.
**Location:** `src/components/landing/*` (New directory)

1.  **`LandingHeader.tsx`**
    *   *Legacy:* Contains navigation links and "Login" button. Handles scroll state (client-side).
    *   *New:* Create the visual structure. The scroll listener will be moved to a wrapper client component or handled via CSS sticky/intersection observers if possible.

2.  **`HeroSection.tsx`**
    *   *Legacy:* Headline, subheadline, and two CTA buttons.
    *   *New:* Static Server Component using Tailwind for gradients and spacing.

3.  **`FeaturesSection.tsx`**
    *   *Legacy:* Grid of "Glass Cards".
    *   *New:* 
        *   Create a `FeatureCard` component (Atom).
        *   Render the grid using a data array (kept in the component or a const file).

4.  **`HowItWorksSection.tsx`**
    *   *Legacy:* 3-step process cards.
    *   *New:* Static Server Component.

5.  **`Footer.tsx`**
    *   *Legacy:* Links and social icons.
    *   *New:* Static Server Component.

## Phase 3: Interactive "Islands" (The "Smart" Components)
**Objective:** Implement client-side logic using `'use client'` and connect to the backend.

1.  **`WaitlistForm.tsx` (Client Component)**
    *   **Location:** `src/components/landing/WaitlistForm.tsx`
    *   **State Management:** Use `useActionState` (React 19) for Server Action UI state; use React Query for async server data and Zustand persist/localStorage for client-local state.
    *   **Validation:** Use `zod` schema from `@/server/types/waitlist-types`.
    *   **Action:** Connect to `addToWaitlistAction` from `@/server/actions/waitlist`.
    *   **UI:** Replicate the glassmorphism inputs and loader state.

2.  **`ScrollAwareHeader.tsx` (Client Component)**
    *   **Objective:** Wrap `LandingHeader` or handle the scroll event to toggle the "glass" effect on the navbar.

3.  **Animations Wrapper (Optional)**
    *   **Objective:** Replicate the `IntersectionObserver` fade-in effects.
    *   **Implementation:** Create a reusable `<FadeIn>` client component using `framer-motion` (if allowed) or a simple `useInView` hook with CSS classes to strictly match legacy behavior without heavy libs.

## Phase 4: Page Assembly
**Objective:** Assemble the pieces into the main page file.

1.  **`src/app/page.tsx`**
    *   **Type:** Async Server Component.
    *   **Structure:**
        ```tsx
        import { LandingHeader } from '@/components/landing/LandingHeader';
        import { HeroSection } from '@/components/landing/HeroSection';
        // ... imports
        
        export default function HomePage() {
          return (
            <main className="min-h-screen bg-white font-sans overflow-x-hidden relative">
               {/* Background Effects */}
               <LandingHeader />
               <HeroSection />
               <FeaturesSection />
               <HowItWorksSection />
               <WaitlistSection /> {/* Contains WaitlistForm */}
               <Footer />
            </main>
          )
        }
        ```

## Phase 5: Verification & Cleanup
**Objective:** Ensure quality and correctness.

1.  **Type Check:** Run `npx tsc --noEmit`.
2.  **Lint Check:** Run `npm run lint`.
3.  **Visual QA:** Compare side-by-side with the old app.
4.  **Functional QA:** Submit a waitlist entry and verify it lands in the database (via Prisma).

## Migration Checklist

- [ ] **Phase 1:** Plan & Assets
- [ ] **Phase 2:** Static Components (`Hero`, `Features`, `Footer`)
- [ ] **Phase 3:** Interactive Components (`WaitlistForm`, `Header`)
- [ ] **Phase 4:** Assembly (`page.tsx`)
- [ ] **Phase 5:** Verification
