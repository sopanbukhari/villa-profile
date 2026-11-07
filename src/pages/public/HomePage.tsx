import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Bed,
  Bath,
  Waves,
  Wifi,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Villa } from '../../types';

export const HomePage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickCheckIn, setQuickCheckIn] = useState('');
  const [quickCheckOut, setQuickCheckOut] = useState('');
  const [quickGuests, setQuickGuests] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getVilla('primary');
        setVilla(data);
      } catch (err) {
        console.error('Failed to load villa details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCheckIn && quickCheckOut) {
      navigate(`/availability?checkIn=${quickCheckIn}&checkOut=${quickCheckOut}&guests=${quickGuests}`);
    } else {
      navigate('/availability');
    }
  };

  const heroImage =
    villa?.images?.find((img) => img.isPrimary)?.url ||
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="min-h-screen bg-[#faf6ee]">
      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Villa Paradise Sanctuary"
            className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[8000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-900/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm tracking-widest uppercase font-medium mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Private Tropical Eco-Retreat • Ubud, Bali</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 drop-shadow-md">
            Kemewahan Alami &amp; Ketenangan Abadi
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-stone-200/90 font-light leading-relaxed mb-10 drop-shadow">
            Nikmati keheningan lembah hijau Ubud di Villa Paradise Sanctuary. Tempat istirahat sempurna
            dengan kolam renang infinity privat dan layanan hospitality bintang lima.
          </p>

          {/* Quick Availability Widget */}
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full p-3 sm:p-2.5 shadow-2xl border border-white/40 text-stone-900">
            <form onSubmit={handleQuickCheck} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="flex-1 w-full sm:w-auto px-4 py-2 sm:py-1 text-left border-b sm:border-b-0 sm:border-r border-stone-200">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-1">
                  Check-in
                </label>
                <input
                  type="date"
                  value={quickCheckIn}
                  onChange={(e) => setQuickCheckIn(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-stone-800 focus:outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex-1 w-full sm:w-auto px-4 py-2 sm:py-1 text-left border-b sm:border-b-0 sm:border-r border-stone-200">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-1">
                  Check-out
                </label>
                <input
                  type="date"
                  value={quickCheckOut}
                  onChange={(e) => setQuickCheckOut(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-stone-800 focus:outline-none"
                  min={quickCheckIn || new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="w-full sm:w-40 px-4 py-2 sm:py-1 text-left border-b sm:border-b-0 sm:border-r border-stone-200">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-stone-500 mb-1">
                  Jumlah Tamu
                </label>
                <select
                  value={quickGuests}
                  onChange={(e) => setQuickGuests(Number(e.target.value))}
                  className="w-full bg-transparent text-sm font-semibold text-stone-800 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Orang
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 sm:py-3.5 rounded-xl sm:rounded-full bg-forest-900 text-white font-semibold text-sm tracking-wide uppercase hover:bg-forest-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>Cek Ketersediaan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS BAR */}
      <section className="bg-forest-950 text-white py-6 border-y border-forest-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-200">
                {villa?.bedrooms || 3} Kamar
              </span>
              <span className="text-xs uppercase tracking-wider text-stone-300">
                Kamar Tidur Mewah
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-200">
                {villa?.bathrooms || 3} Ensuite
              </span>
              <span className="text-xs uppercase tracking-wider text-stone-300">
                Kamar Mandi Marmer
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-200">
                Maks. {villa?.maxGuests || 6}
              </span>
              <span className="text-xs uppercase tracking-wider text-stone-300">
                Kapasitas Tamu
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-200">
                Infinity Pool
              </span>
              <span className="text-xs uppercase tracking-wider text-stone-300">
                Kolam Renang Privat
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STORY & ABOUT SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold tracking-wider uppercase">
              Tentang Properti
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-forest-950 leading-tight">
              Oase Privat di Tengah Pelukan Hutan Tropis Sayan Ubud
            </h2>
            <p className="text-stone-700 leading-relaxed font-light text-base sm:text-lg">
              {villa?.description ||
                'Villa Paradise Sanctuary menghadirkan perpaduan sempurna antara arsitektur tropis kontemporer dan kenyamanan modern. Dirancang untuk memberikan privasi mutlak bagi keluarga dan pasangan yang mendambakan kedamaian sejati.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/villa"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest-900 text-white font-semibold text-sm hover:bg-forest-800 transition-colors shadow-sm"
              >
                <span>Lihat Profil Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cream-200 text-forest-900 font-semibold text-sm hover:bg-cream-300 transition-colors"
              >
                <span>Lihat Foto Galeri</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
                alt="Infinity Pool"
                className="rounded-2xl shadow-md w-full h-64 object-cover hover:scale-[1.02] transition-transform"
              />
              <img
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                alt="Master Bedroom"
                className="rounded-2xl shadow-md w-full h-44 object-cover hover:scale-[1.02] transition-transform"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
                alt="Open Living Pavilion"
                className="rounded-2xl shadow-md w-full h-44 object-cover hover:scale-[1.02] transition-transform"
              />
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
                alt="Marble Bathroom"
                className="rounded-2xl shadow-md w-full h-64 object-cover hover:scale-[1.02] transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FACILITIES PREVIEW */}
      <section className="py-20 bg-cream-100 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-forest-800">
              Kenyamanan Eksklusif
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest-950 mt-2">
              Fasilitas Pilihan Berstandar Resor
            </h2>
            <p className="text-stone-600 text-sm mt-3">
              Semua yang Anda butuhkan untuk pengalaman menginap yang tak terlupakan telah kami persiapkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center mb-4">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-forest-950 mb-2">
                Kolam Renang Infinity
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Menghadap langsung ke panorama lembah tropis alami dengan dek jemur kayu jati dan kursi malas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-forest-950 mb-2">
                Wi-Fi Cepat 100 Mbps
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Konektivitas serat optik tanpa hambatan di seluruh area villa, ideal untuk workcation atau streaming.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-forest-950 mb-2">
                Housekeeping &amp; Butler
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Staf ramah siap melayani kebersihan harian, sarapan pagi, serta bantuan reservasi perjalanan Anda.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/villa"
              className="inline-flex items-center gap-2 text-forest-900 font-semibold hover:text-forest-700 text-sm"
            >
              <span>Jelajahi seluruh fasilitas villa</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING & VALUE PROPOSITION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 rounded-3xl p-8 sm:p-12 md:p-16 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-300">
              Tarif &amp; Reservasi
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold mt-3 mb-6 leading-tight">
              Mulai dari Rp 3.500.000 / Malam
            </h2>
            <p className="text-stone-200 text-base sm:text-lg font-light leading-relaxed mb-8">
              Tarif sewa sudah mencakup seluruh unit villa privat 3 kamar tidur, akses penuh kolam renang infinity,
              layanan kebersihan harian, dan air mineral bebas isi ulang.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/availability"
                className="px-8 py-4 rounded-full bg-cream-100 text-forest-950 font-bold text-sm uppercase tracking-wider text-center hover:bg-white transition-all shadow-md"
              >
                Cek Tanggal &amp; Booking
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 rounded-full bg-forest-800/80 text-white font-medium text-sm text-center border border-forest-700 hover:bg-forest-800 transition-colors"
              >
                Tanya Admin via WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-16 bg-white border-t border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-forest-800">
              Pengalaman Tamu
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest-950 mt-1">
              Kenangan Tak Terlupakan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed italic">
                "Pemandangan hutan dari kolam renangnya luar biasa indah. Tempat yang sangat tenang untuk beristirahat
                bersama keluarga besar. Respons admin via WhatsApp juga sangat cepat dan ramah!"
              </p>
              <div className="pt-2">
                <span className="font-bold text-forest-950 text-sm block">Bramantyo &amp; Keluarga</span>
                <span className="text-xs text-stone-500">Jakarta • Menginap 3 Malam</span>
              </div>
            </div>

            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed italic">
                "Desain villa sangat estetik dan terawat bersih. Kamar mandi marmernya sangat mewah dan kasurnya sangat
                nyaman. Pasti akan kembali lagi saat liburan ke Bali selanjutnya."
              </p>
              <div className="pt-2">
                <span className="font-bold text-forest-950 text-sm block">Clara &amp; Daniel</span>
                <span className="text-xs text-stone-500">Surabaya • Menginap 2 Malam</span>
              </div>
            </div>

            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed italic">
                "Proses booking via WhatsApp sangat mudah dan transparan. Kalender ketersediaannya akurat dan konfirmasi
                admin sangat jelas. Rekomendasi terbaik di Sayan Ubud!"
              </p>
              <div className="pt-2">
                <span className="font-bold text-forest-950 text-sm block">Fadli Ardiansyah</span>
                <span className="text-xs text-stone-500">Bandung • Menginap 4 Malam</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
