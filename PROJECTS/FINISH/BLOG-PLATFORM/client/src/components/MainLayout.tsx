import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { X } from "lucide-react";
import { SidebarContext } from "../context/SidebarContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Pages that should NOT show sidebar
  const noSidebarPages = ["/login", "/register", "/create"];
  const isEditPage = location.pathname.startsWith("/edit/");
  const showSidebar = !noSidebarPages.includes(location.pathname) && !isEditPage;

  return (
    <SidebarContext.Provider value={{ toggleSidebar, isSidebarOpen }}>
      <Navbar />
      {!showSidebar ? (
        <>
          <div className="min-h-screen bg-base-200">{children}</div>
          <Footer />
        </>
      ) : (
        <div className="min-h-screen bg-base-200 flex flex-col">

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Left Side on Desktop */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            {/* Desktop Sidebar - Sticky with independent scroll */}
            <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-base-200">
              <Sidebar />
            </div>

            {/* Mobile Sidebar Drawer */}
            <div
              className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsSidebarOpen(false)}
              />

              {/* Drawer */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-base-200 shadow-xl transform transition-transform duration-300 overflow-y-auto ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <Sidebar />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Right Side on Desktop */}
          <div className="lg:col-span-8 order-1 lg:order-2">{children}</div>
        </div>
      </div>
          <Footer />
        </div>
      )}
    </SidebarContext.Provider>
  );
};

export default MainLayout;
