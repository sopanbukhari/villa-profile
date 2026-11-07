import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, Phone, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Profil Villa', href: '/villa' },
    { label: 'Galeri', href: '/gallery' },
    { label: 'Ketersediaan', href: '/availability' },
    { label: 'Kontak', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#faf6ee]/95 backdrop-blur-md shadow-sm border-b border-[#ede0c7]/60 py-3'
          : 'bg-gradient-to-b from-stone-900/70 via-stone-900/30 to-transparent py-5 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                scrolled
                  ? 'bg-forest-900 text-cream-100'
                  : 'bg-white/20 text-white backdrop-blur-sm group-hover:bg-white group-hover:text-forest-900'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`font-serif tracking-wider font-semibold text-lg sm:text-xl block leading-tight ${
                  scrolled ? 'text-forest-950' : 'text-white'
                }`}
              >
                PARADISE
              </span>
              <span
                className={`text-[10px] tracking-[0.25em] uppercase font-medium block ${
                  scrolled ? 'text-forest-700' : 'text-white/80'
                }`}
              >
                Sanctuary Ubud
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm tracking-wide font-medium transition-colors relative py-1 ${
                  scrolled
                    ? isActive(link.href)
                      ? 'text-forest-900 font-semibold'
                      : 'text-stone-700 hover:text-forest-800'
                    : isActive(link.href)
                    ? 'text-white font-semibold'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                      scrolled ? 'bg-forest-800' : 'bg-white'
                    }`}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Action CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/availability"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow-md bg-forest-900 text-white hover:bg-forest-800"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Cek Tanggal</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg md:hidden transition-colors ${
              scrolled
                ? 'text-stone-800 hover:bg-[#ede0c7]/40'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#faf6ee] border-b border-[#ede0c7] shadow-lg animate-in slide-in-from-top duration-200">
          <div className="px-5 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-forest-900 text-white font-semibold'
                    : 'text-stone-800 hover:bg-cream-200'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-[#ede0c7]/80">
              <Link
                to="/availability"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-900 text-white font-semibold text-sm shadow hover:bg-forest-800"
              >
                <Calendar className="w-4 h-4" />
                <span>Pesan Villa Sekarang</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
