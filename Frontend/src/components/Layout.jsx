import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      {/* Sticky bottom nav on mobile — rendered outside footer so it overlays above it */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
