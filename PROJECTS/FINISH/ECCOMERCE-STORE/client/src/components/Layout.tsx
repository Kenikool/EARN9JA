import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import SkipToContent from './SkipToContent';

export default function Layout() {
  return (
    <div className="min-h-screen lg:flex">
      <SkipToContent />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
