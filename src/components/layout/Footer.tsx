import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Instagram, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-800 text-cream-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-serif tracking-widest text-xl text-white font-semibold">
                PARADISE
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Sebuah tempat peristirahatan privat eksklusif di jantung Ubud, Bali.
              Menghadirkan harmoni alam tropis, kemewahan arsitektur modern, dan ketenangan abadi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">
              Jelajahi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-stone-400 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/villa" className="text-stone-400 hover:text-white transition-colors">
                  Profil & Fasilitas
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-stone-400 hover:text-white transition-colors">
                  Galeri Foto
                </Link>
              </li>
              <li>
                <Link to="/availability" className="text-stone-400 hover:text-white transition-colors">
                  Cek Ketersediaan & Tarif
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-stone-400 hover:text-white transition-colors">
                  Kontak & Lokasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">
              Kontak & Lokasi
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-forest-400 mt-1 flex-shrink-0" />
                <span>Jl. Raya Sayan No. 88, Sayan, Ubud, Gianyar, Bali 80571</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-forest-400 flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-forest-400 flex-shrink-0" />
                <span>booking@villaparadisesanctuary.com</span>
              </li>
            </ul>
          </div>

          {/* Reservation Policy & Admin Entry */}
          <div>
            <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">
              Informasi Pemesanan
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Pemesanan melalui website ini akan langsung terhubung ke layanan reservasi resmi WhatsApp kami.
              Admin siap membantu konfirmasi ketersediaan dan detail perjalanan Anda.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Portal Admin</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Villa Paradise Sanctuary. All rights reserved.</p>
          <p className="tracking-wide">Designed for Luxury Living & Serenity</p>
        </div>
      </div>
    </footer>
  );
};
