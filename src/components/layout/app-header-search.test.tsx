// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppHeaderSearch } from './app-header-search';

const pushMock = vi.fn();

vi.mock('@/components/ui/popover', async () => {
    const React = await import('react');

    interface PopoverContextValue {
        open: boolean;
        onOpenChange: (open: boolean) => void;
    }

    const PopoverContext = React.createContext<PopoverContextValue | null>(null);

    function Popover({
        open,
        onOpenChange,
        children,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        children: React.ReactNode;
    }) {
        return <PopoverContext.Provider value={{ open, onOpenChange }}>{children}</PopoverContext.Provider>;
    }

    function PopoverTrigger({
        asChild,
        children,
    }: {
        asChild?: boolean;
        children: React.ReactNode;
    }) {
        const context = React.useContext(PopoverContext);
        if (!context) {
            return null;
        }

        if (asChild && React.isValidElement(children)) {
            const trigger = children as React.ReactElement<{
                onClick?: React.MouseEventHandler<HTMLElement>;
            }>;
            const existingOnClick = trigger.props.onClick;

            return React.cloneElement(trigger, {
                onClick: (event: React.MouseEvent<HTMLElement>) => {
                    existingOnClick?.(event);
                    context.onOpenChange(true);
                },
            });
        }

        return (
            <button type="button" onClick={() => context.onOpenChange(true)}>
                {children}
            </button>
        );
    }

    function PopoverContent({ children }: { children: React.ReactNode }) {
        const context = React.useContext(PopoverContext);
        if (!context?.open) {
            return null;
        }
        return <div>{children}</div>;
    }

    return { Popover, PopoverTrigger, PopoverContent };
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        replace: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
    }),
}));

function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });
}

function renderSearch(): void {
    const queryClient = createQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <AppHeaderSearch orgId="org-1" enabled />
        </QueryClientProvider>,
    );
}

describe('AppHeaderSearch', () => {
    beforeEach(() => {
        pushMock.mockReset();
        vi.restoreAllMocks();
    });

    it('supports keyboard navigation and navigates on selection', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify({
                    results: [
                        {
                            title: 'Ada Lovelace',
                            subtitle: 'EMP-007 | ada@org.example | Engineering | Staff Engineer',
                            href: '/hr/employees/profile-ada',
                            type: 'employee',
                            rank: 300,
                        },
                        {
                            title: 'Alan Turing',
                            subtitle: 'EMP-008 | alan@org.example | Engineering | Engineer',
                            href: '/hr/employees/profile-alan',
                            type: 'employee',
                            rank: 280,
                        },
                    ],
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } },
            ),
        );

        renderSearch();
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /open global search/i }));
        const combobox = screen.getByRole('combobox', { name: /global employee search/i });
        await user.type(combobox, 'ada');

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => {
            expect(screen.getByRole('option', { name: /ada lovelace/i })).toBeInTheDocument();
        });

        await user.keyboard('{ArrowDown}{Enter}');
        expect(pushMock).toHaveBeenCalledWith('/hr/employees/profile-ada');
    });

    it('shows empty state and closes on escape', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ results: [] }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        );

        renderSearch();
        const user = userEvent.setup();
        const trigger = screen.getByRole('button', { name: /open global search/i });

        await user.click(trigger);
        const combobox = screen.getByRole('combobox', { name: /global employee search/i });
        await user.type(combobox, 'empty');

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(screen.getAllByText(/no employees matched your query/i).length).toBeGreaterThan(0);
        });

        await user.keyboard('{Escape}');
        await waitFor(() => {
            expect(screen.queryByRole('combobox', { name: /global employee search/i })).not.toBeInTheDocument();
        });
        expect(trigger).toHaveFocus();
    });

    it('shows error state when search request fails', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response(JSON.stringify({ error: 'failed' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }),
        );

        renderSearch();
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /open global search/i }));
        const combobox = screen.getByRole('combobox', { name: /global employee search/i });
        await user.type(combobox, 'error');

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });
        await waitFor(() => {
            expect(screen.getAllByText(/could not load results\. please try again\./i).length).toBeGreaterThan(0);
        }, { timeout: 3_000 });
    });
});
