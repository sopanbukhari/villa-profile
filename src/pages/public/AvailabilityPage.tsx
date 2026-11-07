import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Phone,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { AvailabilityCalendar } from '../../components/calendar/AvailabilityCalendar';
import { api } from '../../services/api';
import {
  Villa,
  AvailabilityCheckResponse,
  OccupiedDatesResponse,
  BookingInquiryResponse,
} from '../../types';

export const AvailabilityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [villa, setVilla] = useState<Villa | null>(null);
  const [occupiedData, setOccupiedData] = useState<OccupiedDatesResponse | undefined>(undefined);

  const [checkIn, setCheckIn] = useState<string>(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState<string>(searchParams.get('checkOut') || '');
  const [guestCount, setGuestCount] = useState<number>(
    searchParams.get('guests') ? parseInt(searchParams.get('guests')!, 10) : 2
  );

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Availability result
  const [checking, setChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<AvailabilityCheckResponse | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Inquiry submission
  const [submitting, setSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<BookingInquiryResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const v = await api.getVilla('primary');
        setVilla(v);
        const occ = await api.getOccupiedDates(v.id);
        setOccupiedData(occ);
      } catch (err) {
        console.error('Failed to load initial availability data', err);
      }
    }
    loadInitial();
  }, []);

  // When checkIn, checkOut, or guestCount changes, trigger availability validation
  useEffect(() => {
    async function evaluateAvailability() {
      if (!checkIn || !checkOut || !villa) {
        setAvailabilityResult(null);
        setCheckError(null);
        return;
      }

      setChecking(true);
      setCheckError(null);
      try {
        const result = await api.checkAvailability(villa.id, checkIn, checkOut, guestCount);
        setAvailabilityResult(result);
      } catch (err: any) {
        setCheckError(err.message || 'Gagal mengecek ketersediaan.');
        setAvailabilityResult(null);
      } finally {
        setChecking(false);
      }
    }

    evaluateAvailability();
  }, [checkIn, checkOut, guestCount, villa]);

  const handleSelectDates = (inDate: string, outDate: string) => {
    setCheckIn(inDate);
    setCheckOut(outDate);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villa || !availabilityResult || !availabilityResult.available) return;

    if (!customerName.trim()) {
      alert('Mohon isi nama lengkap Anda.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Mohon isi nomor telepon / WhatsApp Anda.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await api.createBookingInquiry({
        villaId: villa.id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        checkIn,
        checkOut,
        guestCount,
        specialRequests: specialRequests.trim() || undefined,
      });

      setInquirySuccess(response);

      // Automatically open WhatsApp in a new tab
      window.open(response.whatsappLink, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal membuat inquiry booking.');
    } finally {
      setSubmitting(false);
    }
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
          <span className="text-forest-900 font-medium">Kalender Ketersediaan &amp; Reservasi</span>
        </div>

        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold tracking-wider uppercase mb-3">
            Pengecekan Real-Time
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950 mb-3">
            Ketersediaan &amp; Pemesanan
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Pilih tanggal menginap Anda pada kalender di bawah. Sistem akan memverifikasi ketersediaan kamar
            dan kalkulasi tarif sewa secara transparan.
          </p>
        </div>

        {/* Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calendar Column */}
          <div className="lg:col-span-7 space-y-6">
            <AvailabilityCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDates={handleSelectDates}
              occupiedData={occupiedData}
            />

            {/* Guest Selector & Date Display */}
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs uppercase font-bold text-stone-400 block mb-0.5">
                    Check-in
                  </span>
                  <span className="font-semibold text-stone-900 text-sm">
                    {checkIn || 'Pilih tanggal'}
                  </span>
                </div>
                <div className="text-stone-300 font-light text-xl">→</div>
                <div>
                  <span className="text-xs uppercase font-bold text-stone-400 block mb-0.5">
                    Check-out
                  </span>
                  <span className="font-semibold text-stone-900 text-sm">
                    {checkOut || 'Pilih tanggal'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Users className="w-4 h-4 text-forest-800" />
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Tamu:
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="bg-cream-100 border border-cream-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-forest-800"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Orang
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Submission Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ede0c7] shadow-lg">
              <h3 className="font-serif text-xl font-bold text-forest-950 pb-4 border-b border-cream-200">
                Ringkasan Pemesanan
              </h3>

              {/* Status Indicator */}
              <div className="my-5">
                {!checkIn || !checkOut ? (
                  <div className="p-4 rounded-2xl bg-cream-100 text-stone-600 text-sm flex items-center gap-3 border border-cream-200">
                    <Clock className="w-5 h-5 text-stone-400 flex-shrink-0" />
                    <span>Silakan tentukan tanggal check-in dan check-out pada kalender.</span>
                  </div>
                ) : checking ? (
                  <div className="p-4 rounded-2xl bg-cream-100 text-stone-700 text-sm flex items-center gap-3">
                    <div className="animate-spin w-4 h-4 border-2 border-forest-800 border-t-transparent rounded-full" />
                    <span>Memeriksa ketersediaan tanggal...</span>
                  </div>
                ) : checkError ? (
                  <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-sm flex items-start gap-3 border border-rose-200">
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Tanggal Tidak Valid</span>
                      <span className="text-xs text-rose-700">{checkError}</span>
                    </div>
                  </div>
                ) : availabilityResult?.available ? (
                  <div className="p-4 rounded-2xl bg-forest-50 text-forest-900 text-sm flex items-center gap-3 border border-forest-200">
                    <CheckCircle2 className="w-5 h-5 text-forest-700 flex-shrink-0" />
                    <div>
                      <span className="font-bold block">Tersedia untuk Dipesan!</span>
                      <span className="text-xs text-forest-700">
                        Durasi: {availabilityResult.nights} malam ({guestCount} tamu)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-sm flex items-start gap-3 border border-rose-200">
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Tanggal Tidak Tersedia</span>
                      <span className="text-xs text-rose-700">
                        {availabilityResult?.reason || 'Mohon pilih rentang tanggal lain.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              {availabilityResult?.available && (
                <div className="space-y-3 pb-6 border-b border-cream-200">
                  <div className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                    Rincian Biaya
                  </div>
                  <div className="space-y-1.5 text-xs text-stone-600 max-h-40 overflow-y-auto pr-1">
                    {availabilityResult.breakdown.map((item) => (
                      <div key={item.date} className="flex justify-between items-center py-0.5">
                        <span className="font-mono">{item.date}</span>
                        <span className="text-stone-500">
                          {item.ruleName || (item.rateType === 'weekend' ? 'Akhir Pekan' : 'Tarif Dasar')}
                        </span>
                        <span className="font-semibold text-stone-900">
                          Rp {item.priceIdr.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline">
                    <span className="font-serif text-lg font-bold text-forest-950">
                      Total Estimasi
                    </span>
                    <span className="font-serif text-2xl font-bold text-forest-950">
                      Rp {availabilityResult.totalEstimatedPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {/* Customer Booking Form */}
              {availabilityResult?.available && (
                <form onSubmit={handleBookingSubmit} className="mt-6 space-y-4">
                  <div className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                    Informasi Pemesan
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Pratama"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nomor WhatsApp / HP Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Alamat Email (Opsional)
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: rian@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Catatan / Permintaan Khusus
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Penjemputan bandara, makanan vegan, dll."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-forest-900 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-forest-800 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Memproses...</span>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Booking via WhatsApp</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-stone-500 text-center leading-relaxed">
                    Sistem akan mencatat inquiry reservasi Anda dan membuka obrolan langsung dengan Admin Villa di WhatsApp.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL POPUP */}
      {inquirySuccess && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-2xl font-bold text-forest-950">
                Inquiry Berhasil Dibuat!
              </h3>
              <p className="text-xs text-stone-600">
                Pemesanan Anda telah tercatat dengan referensi:
              </p>
              <div className="p-3 rounded-xl bg-cream-100 font-mono text-base font-bold text-forest-900 border border-cream-300">
                {inquirySuccess.booking.bookingReference}
              </div>
            </div>

            <div className="bg-cream-50 p-4 rounded-2xl border border-cream-200 text-xs text-stone-700 space-y-1.5">
              <div className="flex justify-between">
                <span>Pemesan:</span>
                <span className="font-semibold">{inquirySuccess.booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-semibold">{inquirySuccess.booking.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-semibold">{inquirySuccess.booking.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span>Durasi:</span>
                <span className="font-semibold">{inquirySuccess.booking.totalNights} Malam</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-cream-200 font-bold text-forest-950">
                <span>Estimasi Biaya:</span>
                <span>Rp {inquirySuccess.booking.totalAmountIdr.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <p className="text-xs text-stone-500 text-center leading-relaxed">
              Jika halaman WhatsApp belum terbuka secara otomatis, klik tombol di bawah untuk melanjutkan obrolan:
            </p>

            <div className="space-y-3">
              <a
                href={inquirySuccess.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-forest-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-forest-800 shadow"
              >
                <span>Buka Percakapan WhatsApp</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setInquirySuccess(null)}
                className="w-full py-2.5 rounded-xl text-stone-600 font-medium text-xs hover:bg-cream-100"
              >
                Tutup Jendela Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
