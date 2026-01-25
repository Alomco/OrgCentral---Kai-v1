declare module 'culori' {
    type CuloriColor = Record<string, unknown>;

    export function wcagContrast(colorA: string, colorB: string): number;
    export function parse(color: string): CuloriColor | null;
    export function converter(
        mode: string,
    ): (color: CuloriColor | string) => { l?: number; c?: number; h?: number } | null;
}
