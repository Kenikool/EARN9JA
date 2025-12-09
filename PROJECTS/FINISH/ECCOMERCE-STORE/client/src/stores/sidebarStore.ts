import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarPreferences {
  isCollapsed: boolean;
  version: string;
}

interface SidebarStore {
  // State
  isOpen: boolean;
  isCollapsed: boolean;

  // Actions
  setIsOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
  reset: () => void;
}

const STORAGE_KEY = 'sidebar-preferences';
const STORAGE_VERSION = '1.0';

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isOpen: false, // Mobile drawer closed by default
      isCollapsed: false, // Desktop sidebar expanded by default

      // Actions
      setIsOpen: (open: boolean) => set({ isOpen: open }),

      setIsCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),

      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),

      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

      reset: () => set({ isOpen: false, isCollapsed: false }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        version: STORAGE_VERSION,
      }),
      // Handle storage errors gracefully
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate sidebar state:', error);
          // Clear corrupted data
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {
            console.warn('Failed to clear corrupted sidebar storage:', e);
          }
        }
      },
    }
  )
);
