import { QueryClient, type DefaultOptions } from '@tanstack/react-query';

const defaultOptions: DefaultOptions = {
    queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: false,
    },
    mutations: {
        retry: 1,
    },
};

export function createQueryClient(): QueryClient {
    return new QueryClient({ defaultOptions });
}

export function getQueryClientOptions(): DefaultOptions {
    return defaultOptions;
}
