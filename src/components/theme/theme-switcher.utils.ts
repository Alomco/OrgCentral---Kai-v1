import type { KeyboardEvent } from 'react';

export const FOCUS_RING_CLASSES = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export interface RadioItem<T extends string> { id: T; }

export type KeyNavHandler<T extends string> = (id: T) => void;

export type KeyNavList<T extends string> = readonly RadioItem<T>[];

export function handleRadioKeyDown<T extends string>(
    event: KeyboardEvent<HTMLButtonElement>,
    items: KeyNavList<T>,
    currentId: T,
    onSelect: KeyNavHandler<T>,
): void {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        return;
    }

    event.preventDefault();
    const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const currentIndex = items.findIndex((item) => item.id === currentId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + items.length) % items.length;
    onSelect(items[nextIndex].id);
}

export interface ThemeOption {
    id: string;
    name: string;
    color: string;
}

export function buildSwatchCss(themes: readonly ThemeOption[]): string {
    return themes
        .map((theme) => `.orgcentral-theme-swatch[data-theme-id="${theme.id}"]{background-color:${theme.color};}`)
        .join('\n');
}
