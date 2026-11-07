import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bed,
  Bath,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Waves,
  Wind,
  Coffee,
  Tv,
  ShieldCheck,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { Villa } from '../../types';

export const VillaProfilePage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVilla() {
      try {
        const data = await api.getVilla('primary');
        setVilla(data);
      } catch (err) {
        console.error('Error fetching villa profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVilla();
  }, []);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'waves':
        return <Waves className="w-5 h-5" />;
      case 'wind':
        return <Wind className="w-5 h-5" />;
      case 'coffee':
        return <Coffee className="w-5 h-5" />;
      case 'tv':
        return <Tv className="w-5 h-5" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-forest-700" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link to="/" className="hover:text-stone-900">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-forest-900 font-medium">Profil Villa</span>
        </div>

        {/* Title Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold tracking-wider uppercase mb-3">
            Eksklusif Ubud Sanctuary
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950 mb-4">
            {villa?.name || 'Villa Paradise Sanctuary'}
          </h1>
          <p className="text-stone-600 max-w-3xl text-base sm:text-lg font-light leading-relaxed">
            {villa?.tagline || 'An Exclusive Tropical Haven in Ubud, Bali'}
          </p>
        </div>

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-2xl border border-cream-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                Kamar Tidur
              </span>
              <span className="font-serif text-lg font-bold text-forest-950">
                {villa?.bedrooms || 3} Master Suite
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
              <Bath className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                Kamar Mandi
              </span>
              <span className="font-serif text-lg font-bold text-forest-950">
                {villa?.bathrooms || 3} Ensuite + Tub
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                Kapasitas Tamu
              </span>
              <span className="font-serif text-lg font-bold text-forest-950">
                Hingga {villa?.maxGuests || 6} Tamu
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
                Waktu Check-in/out
              </span>
              <span className="font-serif text-base font-bold text-forest-950">
                {villa?.checkInTime || '14:00'} / {villa?.checkOutTime || '12:00'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Description */}
            <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-4">
              <h2 className="font-serif text-2xl font-bold text-forest-950">
                Deskripsi Lengkap Villa
              </h2>
              <div className="text-stone-700 leading-relaxed space-y-4 text-base font-light">
                <p>
                  {villa?.description ||
                    'Villa Paradise Sanctuary merupakan villa privat premium dengan perpaduan keindahan estetika tradisional Bali dan arsitektur kontemporer ramah lingkungan. Berdiri anggun di tepi jurang lembah sungai Ayung di kawasan prestisius Sayan Ubud, villa ini menawarkan pemandangan panorama hutan hujan tropis yang menenangkan jiwa.'}
                </p>
                <p>
                  Setiap kamar tidur dilengkapi tempat tidur King-size berbalut linen katun Mesir 400-thread-count,
                  pendingin udara inverter senyap, serta kamar mandi marmer pribadi semi-terbuka dengan bak mandi
                  terrazzo berukuran besar yang menghadap langsung ke taman tropis pribadi.
                </p>
                <p>
                  Area ruang keluarga dan ruang makan terbuka didesain menyatu dengan dek kolam renang infinity,
                  menciptakan sirkulasi udara alami yang sejuk sepanjang hari. Dapur gourmet yang lengkap dengan
                  peralatan memasak modern dan mesin kopi espresso siap melengkapi kehangatan momen berkumpul Anda.
                </p>
              </div>
            </div>

            {/* Facilities Categorized */}
            <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-forest-950">
                  Daftar Fasilitas &amp; Amenitas
                </h2>
                <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                  Semua Fasilitas Termasuk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {villa?.facilities?.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex items-start gap-3.5"
                  >
                    <div className="p-2 rounded-xl bg-forest-100 text-forest-900 mt-0.5">
                      {getIcon(f.icon)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm">{f.name}</h4>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {f.description || f.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* House Policies */}
            <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-forest-950">
                Aturan &amp; Ketentuan Menginap
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-stone-700">
                <div className="space-y-2">
                  <span className="font-bold text-forest-950 block">Jadwal Check-in &amp; Check-out</span>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Check-in mulai pukul {villa?.checkInTime || '14:00'} WIB. Check-out maksimal pukul{' '}
                    {villa?.checkOutTime || '12:00'} WIB. Permintaan early check-in atau late check-out
                    tergantung ketersediaan kamar.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="font-bold text-forest-950 block">Kebijakan Tamu &amp; Anak</span>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Kapasitas villa maksimal {villa?.maxGuests || 6} orang. Anak-anak dari segala usia
                    diperbolehkan. Pengawasan orang tua diperlukan di sekitar area kolam renang.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="font-bold text-forest-950 block">Kebijakan Merokok &amp; Pesta</span>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Dilarang merokok di dalam kamar tidur ber-AC (area merokok tersedia di luar ruangan).
                    Pesta yang menimbulkan kebisingan malam hari tidak diperkenankan demi ketenangan lingkungan.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="font-bold text-forest-950 block">Kebijakan Pembatalan</span>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Pembatalan bebas biaya hingga 7 hari sebelum tanggal kedatangan. Pembatalan dalam kurun 7
                    hari dikenakan biaya 50% dari total pesanan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-[#ede0c7] shadow-lg space-y-6">
              <div className="pb-5 border-b border-cream-200">
                <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                  Mulai dari
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-3xl font-bold text-forest-950">
                    Rp {(villa?.basePriceIdr || 3500000).toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">/ malam</span>
                </div>
                {villa?.weekendPriceIdr && (
                  <span className="inline-block mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-cream-200 text-forest-900 font-medium">
                    Weekend: Rp {villa.weekendPriceIdr.toLocaleString('id-ID')} / malam
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                  <span>Seluruh unit villa privat 3 kamar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                  <span>Akses kolam renang infinity tanpa batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                  <span>Layanan kebersihan harian (Housekeeping)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-700 flex-shrink-0" />
                  <span>Pemesanan cepat langsung ke WhatsApp Admin</span>
                </div>
              </div>

              <Link
                to="/availability"
                className="w-full py-4 rounded-2xl bg-forest-900 text-white font-bold text-sm uppercase tracking-wider text-center block shadow-md hover:bg-forest-800 transition-all"
              >
                Cek Kalender Ketersediaan
              </Link>

              <Link
                to="/contact"
                className="w-full py-3.5 rounded-2xl bg-cream-100 text-stone-800 font-semibold text-xs tracking-wider text-center block hover:bg-cream-200 transition-colors"
              >
                Hubungi Kami untuk Pertanyaan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
