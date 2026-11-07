import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/public/HomePage';
import { VillaProfilePage } from './pages/public/VillaProfilePage';
import { GalleryPage } from './pages/public/GalleryPage';
import { AvailabilityPage } from './pages/public/AvailabilityPage';
import { ContactPage } from './pages/public/ContactPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminAvailabilityPage } from './pages/admin/AdminAvailabilityPage';
import { AdminVillaPage } from './pages/admin/AdminVillaPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminFacilitiesPage } from './pages/admin/AdminFacilitiesPage';
import { AdminPricingPage } from './pages/admin/AdminPricingPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/villa" element={<VillaProfilePage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Protected Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="availability" element={<AdminAvailabilityPage />} />
            <Route path="villa" element={<AdminVillaPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="facilities" element={<AdminFacilitiesPage />} />
            <Route path="pricing" element={<AdminPricingPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default App;
