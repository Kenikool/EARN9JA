import { createContext, useContext } from "react";

interface SidebarContextType {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within MainLayout");
  }
  return context;
};
