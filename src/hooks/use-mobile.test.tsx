// @vitest-environment jsdom

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from './use-mobile';

interface MatchMediaSetup {
    addEventListener?: (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ) => void;
    removeEventListener?: (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ) => void;
    addListener?: (listener: ((this: MediaQueryList, event: MediaQueryListEvent) => void) | null) => void;
    removeListener?: (listener: ((this: MediaQueryList, event: MediaQueryListEvent) => void) | null) => void;
}

function setViewportWidth(width: number): void {
    Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: width,
    });
}

function mockMatchMedia(setup: MatchMediaSetup): void {
    const defaultAddEventListener: NonNullable<MatchMediaSetup['addEventListener']> = () => undefined;
    const defaultRemoveEventListener: NonNullable<MatchMediaSetup['removeEventListener']> = () => undefined;

    const matchMedia = vi.fn(
        (query: string): MediaQueryList => ({
            media: query,
            matches: window.innerWidth < 768,
            onchange: null,
            addEventListener: setup.addEventListener ?? defaultAddEventListener,
            removeEventListener: setup.removeEventListener ?? defaultRemoveEventListener,
            dispatchEvent: () => false,
            addListener: setup.addListener ?? (() => undefined),
            removeListener: setup.removeListener ?? (() => undefined),
        }),
    );

    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: matchMedia,
    });
}

function MobileProbe() {
    const isMobile = useIsMobile();
    return <span>{isMobile ? 'mobile' : 'desktop'}</span>;
}

describe('useIsMobile', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('detects mobile width with modern MediaQueryList listeners', async () => {
        setViewportWidth(390);
        mockMatchMedia({});

        render(<MobileProbe />);

        await waitFor(() => {
            expect(screen.getByText('mobile')).toBeInTheDocument();
        });
    });

    it('detects mobile width when only legacy addListener/removeListener are available', async () => {
        setViewportWidth(390);
        const addEventListener = vi.fn(
            (..._args: Parameters<NonNullable<MatchMediaSetup['addEventListener']>>) => {
                throw new TypeError('addEventListener unsupported');
            },
        );
        const addListener = vi.fn();
        const removeListener = vi.fn();
        mockMatchMedia({
            addEventListener,
            addListener,
            removeListener,
        });

        render(<MobileProbe />);

        await waitFor(() => {
            expect(screen.getByText('mobile')).toBeInTheDocument();
        });
        expect(addEventListener).toHaveBeenCalledTimes(1);
        expect(addListener).toHaveBeenCalledTimes(1);
    });

    it('detects mobile width without matchMedia support', async () => {
        setViewportWidth(390);
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            writable: true,
            value: undefined,
        });

        render(<MobileProbe />);

        await waitFor(() => {
            expect(screen.getByText('mobile')).toBeInTheDocument();
        });
    });
});
