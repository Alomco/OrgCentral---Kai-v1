"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface DevelopmentAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isActive?: boolean;
    order?: number;
    component?: React.ReactNode;
}

interface DevelopmentToolbarContextType {
    registerAction: (action: DevelopmentAction) => void;
    unregisterAction: (id: string) => void;
    actions: DevelopmentAction[];
}

const DevelopmentToolbarContext = createContext<DevelopmentToolbarContextType | undefined>(undefined);

export function DevelopmentToolbarProvider({ children }: { children: React.ReactNode }) {
    const [actions, setActions] = useState<DevelopmentAction[]>([]);

    const registerAction = useCallback((action: DevelopmentAction) => {
        setActions((previous) => {
            const existingIndex = previous.findIndex((currentAction) => currentAction.id === action.id);
            if (existingIndex >= 0) {
                const updatedActions = [...previous];
                updatedActions[existingIndex] = action;
                return updatedActions.sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
            }
            return [...previous, action].sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
        });
    }, []);

    const unregisterAction = useCallback((id: string) => {
        setActions((previous) => previous.filter((action) => action.id !== id));
    }, []);

    const value = useMemo(
        () => ({ registerAction, unregisterAction, actions }),
        [registerAction, unregisterAction, actions],
    );

    return <DevelopmentToolbarContext.Provider value={value}>{children}</DevelopmentToolbarContext.Provider>;
}

export function useDevelopmentToolbar() {
    const context = useContext(DevelopmentToolbarContext);
    if (!context) {
        throw new Error("useDevelopmentToolbar must be used within a DevelopmentToolbarProvider");
    }
    return context;
}

export function useRegisterDevelopmentAction(action: DevelopmentAction | null) {
    const { registerAction, unregisterAction } = useDevelopmentToolbar();

    useEffect(() => {
        if (!action) {
            return undefined;
        }
        registerAction(action);
        return () => unregisterAction(action.id);
    }, [registerAction, unregisterAction, action]);
}
