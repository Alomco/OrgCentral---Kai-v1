/**
 * 🎨 UI Style Provider with SSR Support
 * 
 * Client-side provider for UI style switching via data-ui-style attribute.
 * Uses blocking script to apply styles BEFORE React hydration to prevent flash.
 * Works alongside ThemeProvider for color theming.
 * 
 * @module components/theme/ui-style-provider
 */

'use client';

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { uiStylePresets, uiStyleKeys, defaultUiStyle, getUiStyleCssVariables, type UiStyleKey } from '@/server/theme/ui-style-presets';

// ============================================================================
// Types
// ============================================================================

interface UiStyleContextValue {
    /** Current UI style */
    currentStyle: UiStyleKey;
    /** Set UI style */
    setStyle: (styleKey: UiStyleKey) => void;
    /** Reset to default */
    clearStyle: () => void;
    /** Available styles */
    styles: readonly {
        id: UiStyleKey;
        name: string;
        emoji: string;
        description: string;
    }[];
}

// ============================================================================
// Context
// ============================================================================

const UiStyleContext = createContext<UiStyleContextValue | undefined>(undefined);

const UI_STYLE_STORAGE_KEY = 'orgcentral-ui-style';
const UI_STYLE_CHANGE_EVENT = 'orgcentral-ui-style-change';

// ============================================================================
// Storage & Events
// ============================================================================

function readStoredStyle(): UiStyleKey {
    try {
        const value = localStorage.getItem(UI_STYLE_STORAGE_KEY);
        return value && uiStyleKeys.includes(value) ? (value) : defaultUiStyle;
    } catch {
        return defaultUiStyle;
    }
}

function subscribeToStyleChanges(onStoreChange: () => void) {
    const handler = () => onStoreChange();
    window.addEventListener('storage', handler);
    window.addEventListener(UI_STYLE_CHANGE_EVENT, handler);
    return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(UI_STYLE_CHANGE_EVENT, handler);
    };
}

// ============================================================================
// Export presets for UI consumption
// ============================================================================

export const UI_STYLE_OPTIONS = uiStyleKeys.map((key) => ({
    id: key,
    name: uiStylePresets[key].name,
    emoji: uiStylePresets[key].emoji,
    description: uiStylePresets[key].description,
}));

// ============================================================================
// SSR-Safe Blocking Script
// This script runs BEFORE React hydration to prevent flash of unstyled content
// ============================================================================

function generateBlockingScript(): string {
    // Build a map of all preset CSS variables
    const presetsMap: Record<string, Record<string, string>> = {};
    for (const key of uiStyleKeys) {
        presetsMap[key] = getUiStyleCssVariables(key);
    }

    // Self-executing function that runs immediately on page load
    return `(function(){
try {
    var STORAGE_KEY = '${UI_STYLE_STORAGE_KEY}';
    var DEFAULT_STYLE = '${defaultUiStyle}';
    var PRESETS = ${JSON.stringify(presetsMap)};
    var VALID_KEYS = ${JSON.stringify(uiStyleKeys)};
    
    // Read from localStorage
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch(e) {}
    var styleKey = (stored && VALID_KEYS.indexOf(stored) !== -1) ? stored : DEFAULT_STYLE;
    
    // Apply CSS variables to root
    var root = document.documentElement;
    var vars = PRESETS[styleKey];
    if (vars) {
        for (var key in vars) {
            if (vars.hasOwnProperty(key)) {
                root.style.setProperty(key, vars[key]);
            }
        }
    }
    
    // Set data attribute for CSS selectors
    root.dataset.uiStyle = styleKey;
} catch(e) {}
})();`;
}

// ============================================================================
// Provider
// ============================================================================

export function UiStyleProvider({ children }: { children: ReactNode }) {
    const storedStyle = useSyncExternalStore(
        subscribeToStyleChanges,
        readStoredStyle,
        () => defaultUiStyle,
    );

    // Generate blocking script for SSR
    const blockingScript = useMemo(() => generateBlockingScript(), []);

    const applyStyleToDOM = (styleKey: UiStyleKey) => {
        const cssVariables = getUiStyleCssVariables(styleKey);
        const root = document.documentElement;
        const body = document.body;

        Object.entries(cssVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Also set the data attribute for potential specific overrides
        root.dataset.uiStyle = styleKey;
        body.dataset.uiStyle = styleKey;
    };

    // Apply style to DOM on mount and change
    useEffect(() => {
        applyStyleToDOM(storedStyle);
    }, [storedStyle]);

    const setStyle = (styleKey: UiStyleKey) => {
        localStorage.setItem(UI_STYLE_STORAGE_KEY, styleKey);
        applyStyleToDOM(styleKey);
        window.dispatchEvent(new Event(UI_STYLE_CHANGE_EVENT));
    };

    const clearStyle = () => {
        localStorage.removeItem(UI_STYLE_STORAGE_KEY);
        applyStyleToDOM(defaultUiStyle);
        window.dispatchEvent(new Event(UI_STYLE_CHANGE_EVENT));
    };

    return (
        <UiStyleContext.Provider value={{
            currentStyle: storedStyle,
            setStyle,
            clearStyle,
            styles: UI_STYLE_OPTIONS,
        }}>
            {/* Blocking script runs BEFORE React hydration */}
            <script
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: blockingScript }}
            />
            {children}
        </UiStyleContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useUiStyle() {
    const context = useContext(UiStyleContext);
    if (!context) {
        throw new Error('useUiStyle must be used within UiStyleProvider');
    }
    return context;
}

