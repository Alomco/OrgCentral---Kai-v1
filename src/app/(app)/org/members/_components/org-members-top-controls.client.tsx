'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const GG_TIMEOUT_MS = 450;

function scrollToTop() {
  const prefersReducedMotion = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

export function OrgMembersTopControls() {
  useEffect(() => {
    let last: number | null = null;
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'g') {
        return;
      }
      const now = Date.now();
      if (last && now - last < GG_TIMEOUT_MS) {
        scrollToTop();
        last = null;
      } else {
        last = now;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span id="org-members-kbd-gg-hint" className="sr-only">Keyboard: press g twice to jump to the top.</span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 px-2"
        onClick={scrollToTop}
        aria-label="Jump to Top"
        aria-describedby="org-members-kbd-gg-hint"
      >
        Top
      </Button>
    </div>
  );
}
