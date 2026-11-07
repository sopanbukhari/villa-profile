import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Send,
} from 'lucide-react';
import { api } from '../../services/api';
import { Villa } from '../../types';

export const ContactPage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');
  const [formName, setFormName] = useState('');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const v = await api.getVilla('primary');
        setVilla(v);
        // We can get whatsapp number if available or fallback
      } catch (err) {
        console.error('Error fetching villa info for contact', err);
      }
    }
    loadData();
  }, []);

  const handleSendDirectWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) return;

    const text = `Halo Admin Villa Paradise Sanctuary,\n\nNama saya: ${formName || 'Tamu'}\n\nPesan:\n${formMessage}`;
    const cleanPhone = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link to="/" className="hover:text-stone-900">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-forest-900 font-medium">Kontak &amp; Lokasi</span>
        </div>

        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold tracking-wider uppercase mb-3">
            Layanan Reservasi
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950 mb-3">
            Hubungi Kami
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Tim reservasi dan butler kami selalu siap menjawab setiap pertanyaan dan memastikan kenyamanan liburan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl font-bold text-forest-950">
                Informasi Resmi
              </h3>

              <div className="space-y-5 text-stone-700 text-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-forest-50 text-forest-900 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-forest-950 block">Alamat Properti</span>
                    <p className="text-stone-600 text-xs leading-relaxed mt-0.5">
                      {villa?.address || 'Jl. Raya Sayan No. 88, Sayan'}, {villa?.city || 'Ubud, Gianyar'},{' '}
                      {villa?.province || 'Bali'} {villa?.postalCode || '80571'}
                    </p>
                    <a
                      href={villa?.mapUrl || 'https://maps.google.com/?q=Ubud+Bali'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-forest-800 font-semibold hover:underline mt-2"
                    >
                      <span>Buka di Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-forest-50 text-forest-900 mt-1">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-forest-950 block">WhatsApp Admin</span>
                    <p className="text-stone-600 text-xs mt-0.5">+62 812-3456-7890</p>
                    <span className="text-[11px] text-forest-700 font-medium block mt-1">
                      Respon Cepat: Setiap Hari 08:00 - 22:00 WIB
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-forest-50 text-forest-900 mt-1">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-forest-950 block">Email Reservasi</span>
                    <p className="text-stone-600 text-xs mt-0.5">
                      booking@villaparadisesanctuary.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-forest-50 text-forest-900 mt-1">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-forest-950 block">Jadwal Check-in &amp; Check-out</span>
                    <p className="text-stone-600 text-xs mt-0.5">
                      Check-in: Pukul {villa?.checkInTime || '14:00'} WIB • Check-out: Pukul{' '}
                      {villa?.checkOutTime || '12:00'} WIB
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-cream-200">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    'Halo Admin Villa Paradise Sanctuary, saya ingin menanyakan informasi villa.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-forest-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-forest-800 shadow transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Langsung di WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Contact Form & Map Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-forest-950 mb-2">
                Kirim Pesan Cepat
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Formulir ini akan otomatis terhubung ke aplikasi WhatsApp resmi admin.
              </p>

              <form onSubmit={handleSendDirectWhatsApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Anda
                  </label>
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Pertanyaan / Kebutuhan
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan tanggal yang diminati, jumlah orang, atau pertanyaan lainnya..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-forest-900 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-forest-800 transition-colors shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan ke WhatsApp</span>
                </button>
              </form>
            </div>

            {/* Embedded Google Map Preview */}
            <div className="bg-white rounded-3xl overflow-hidden border border-cream-200 shadow-sm aspect-video relative">
              <iframe
                title="Lokasi Villa Paradise Sanctuary"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.5492415174775!2d115.24921677568551!3d-8.50341778608822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23d756085a861%3A0x67db9adbbd2b6b0c!2sSayan%2C%20Ubud%2C%20Gianyar%20Regency%2C%20Bali!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
