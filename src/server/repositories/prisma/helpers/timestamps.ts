export function stampCreate<T extends Record<string, unknown>>(data: T): T & {
    createdAt: Date;
    updatedAt: Date;
} {
    const now = new Date();
    return { ...data, createdAt: now, updatedAt: now };
}

export function stampUpdate<T extends Record<string, unknown>>(data: T): T & { updatedAt: Date } {
    return { ...data, updatedAt: new Date() };
}
