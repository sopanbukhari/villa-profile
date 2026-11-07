import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Clock,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await api.getDashboard();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load admin metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
            Pending Hold
          </span>
        );
      case 'INQUIRY':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
            Inquiry Baru
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold text-xs">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Ringkasan Operasional Villa
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Pantau performa reservasi, status ketersediaan, dan inquiry terbaru dari WhatsApp.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
              Total Booking
            </span>
            <div className="font-serif text-3xl font-bold text-stone-900 mt-2">
              {metrics?.totalBookings ?? 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <BookmarkCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-amber-600 tracking-wider">
              Pending Hold
            </span>
            <div className="font-serif text-3xl font-bold text-amber-600 mt-2">
              {metrics?.pendingBookings ?? 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
              Confirmed
            </span>
            <div className="font-serif text-3xl font-bold text-emerald-700 mt-2">
              {metrics?.confirmedBookings ?? 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">
              Kedatangan Mendatang
            </span>
            <div className="font-serif text-3xl font-bold text-blue-700 mt-2">
              {metrics?.upcomingBookings ?? 0}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/bookings"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-forest-800 transition-all shadow-sm flex items-center justify-between group"
        >
          <div>
            <span className="font-semibold text-stone-900 block text-base group-hover:text-forest-800">
              Kelola Daftar Reservasi
            </span>
            <span className="text-xs text-stone-500 mt-0.5 block">
              Konfirmasi status atau tolak permintaan booking
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-forest-800 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/availability"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-forest-800 transition-all shadow-sm flex items-center justify-between group"
        >
          <div>
            <span className="font-semibold text-stone-900 block text-base group-hover:text-forest-800">
              Kalender &amp; Tutup Tanggal
            </span>
            <span className="text-xs text-stone-500 mt-0.5 block">
              Blokir tanggal tertentu untuk maintenance
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-forest-800 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/settings"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-forest-800 transition-all shadow-sm flex items-center justify-between group"
        >
          <div>
            <span className="font-semibold text-stone-900 block text-base group-hover:text-forest-800">
              Nomor WhatsApp &amp; Kebijakan
            </span>
            <span className="text-xs text-stone-500 mt-0.5 block">
              Perbarui kontak WhatsApp tujuan tanpa kode
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-forest-800 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Aktivitas Booking Terbaru
            </h2>
            <span className="text-xs text-stone-500">
              5 reservasi dan inquiry terakhir yang masuk ke sistem
            </span>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-forest-800 hover:text-forest-700 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Referensi</th>
                <th className="px-6 py-3.5 font-semibold">Pemesan</th>
                <th className="px-6 py-3.5 font-semibold">Check-in / Check-out</th>
                <th className="px-6 py-3.5 font-semibold">Total Nilai</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {!metrics?.recentBookings || metrics.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-stone-400 text-sm">
                    Belum ada data reservasi.
                  </td>
                </tr>
              ) : (
                metrics.recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-forest-900">
                      {b.bookingReference}
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-900">
                      {b.customerName}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {b.checkIn} → {b.checkOut} ({b.totalNights} malam)
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-900 text-xs">
                      Rp {b.totalAmountIdr.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(b.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/bookings?search=${b.bookingReference}`}
                        className="text-xs font-semibold text-forest-800 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
