'use client';

import { useEffect, useState } from 'react';

const MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion(): boolean {
    const [prefersReduced, setPrefersReduced] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(MEDIA_QUERY);
        const updatePreference = () => setPrefersReduced(mediaQuery.matches);
        updatePreference();
        mediaQuery.addEventListener('change', updatePreference);
        return () => mediaQuery.removeEventListener('change', updatePreference);
    }, []);

    return prefersReduced;
}
