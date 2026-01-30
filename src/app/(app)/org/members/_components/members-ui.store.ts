"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage, createSafeStorage } from '@/lib/stores/storage';

interface MembersUiState {
  defaultPageSize: number;
  setDefaultPageSize: (value: number) => void;
}

export const useMembersUiStore = create<MembersUiState>()(
  persist(
    (set) => ({
      defaultPageSize: 25,
      setDefaultPageSize: (value) => set({ defaultPageSize: value }),
    }),
    {
      name: 'ui:org:members',
      storage: createPersistStorage(createSafeStorage(typeof window !== 'undefined' ? window.localStorage : null)),
      version: 1,
    },
  ),
);
