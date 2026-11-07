import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  BookmarkCheck,
  Building2,
  Image,
  UtensilsCrossed,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { admin, loading, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-6 h-6 border-2 border-forest-400 border-t-transparent rounded-full" />
          <span className="text-sm font-medium">Memuat portal admin...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Daftar Booking', href: '/admin/bookings', icon: BookmarkCheck },
    { label: 'Kalender & Blokir', href: '/admin/availability', icon: CalendarDays },
    { label: 'Profil Villa', href: '/admin/villa', icon: Building2 },
    { label: 'Galeri Foto', href: '/admin/gallery', icon: Image },
    { label: 'Fasilitas', href: '/admin/facilities', icon: UtensilsCrossed },
    { label: 'Pengaturan Tarif', href: '/admin/pricing', icon: Tags },
    { label: 'WhatsApp & Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-stone-900 text-stone-200 border-r border-stone-800 flex-shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif tracking-wider font-bold text-white text-base block">
                PARADISE
              </span>
              <span className="text-[10px] tracking-widest text-forest-400 uppercase font-semibold">
                Admin Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-forest-900 text-white font-semibold shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-forest-400' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User footer & logout */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <div className="px-3 py-2 rounded-xl bg-stone-800/50 flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-white truncate block">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-[11px] text-stone-400 truncate block">{admin?.email}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 py-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Web Publik</span>
            </a>
            <button
              onClick={logout}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 py-1 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-stone-200 py-3.5 px-4 sm:px-8 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-stone-700 hover:bg-stone-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Website Villa</span>
            </a>

            <div className="w-8 h-8 rounded-full bg-forest-900 text-white flex items-center justify-center font-bold text-xs uppercase">
              {admin?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
          />
          <div className="relative w-64 bg-stone-900 text-stone-200 flex flex-col z-10">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <span className="font-serif font-bold text-white">Admin Menu</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                      active ? 'bg-forest-900 text-white font-semibold' : 'text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-stone-800">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-xl bg-stone-800 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
