import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <AdminNavbar onMenuClick={toggleSidebar} />
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 w-full lg:w-auto min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
