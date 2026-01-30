"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage, createSafeStorage } from '@/lib/stores/storage';

interface PoliciesUiState {
  // Persist small UI prefs only; no server data
  nocatDefault: boolean;
  density: 'comfortable' | 'compact';
  pageSize: number;
  setNocatDefault: (value: boolean) => void;
  setDensity: (value: 'comfortable' | 'compact') => void;
  setPageSize: (value: number) => void;
}

export const usePoliciesUiStore = create<PoliciesUiState>()(
  persist(
    (set) => ({
      nocatDefault: false,
      density: 'comfortable',
      pageSize: 25,
      setNocatDefault: (value) => set({ nocatDefault: value }),
      setDensity: (value) => set({ density: value }),
      setPageSize: (value) => set({ pageSize: value }),
    }),
    {
      name: 'ui:hr:policies',
      storage: createPersistStorage(createSafeStorage(typeof window !== 'undefined' ? window.localStorage : null)),
      version: 1,
    },
  ),
);

