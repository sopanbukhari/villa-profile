import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  FileText,
  Calendar,
  Plus,
} from 'lucide-react';
import { api } from '../../services/api';
import { BookingDetail, BookingStatus } from '../../types';

export const AdminBookingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals & Action State
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<BookingStatus>('CONFIRMED');
  const [statusNotes, setStatusNotes] = useState('');
  const [holdHours, setHoldHours] = useState(24);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Manual Create Booking State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newGuestCount, setNewGuestCount] = useState(2);
  const [newTotalAmount, setNewTotalAmount] = useState<number | ''>('');
  const [newStatus, setNewStatus] = useState<'CONFIRMED' | 'PENDING' | 'INQUIRY'>('CONFIRMED');
  const [newHoldHours, setNewHoldHours] = useState(24);
  const [newAdminNotes, setNewAdminNotes] = useState('');
  const [newSpecialRequests, setNewSpecialRequests] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminBookings({
        status: statusFilter,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const openStatusConfirmation = (booking: BookingDetail, newStatus: BookingStatus) => {
    setSelectedBooking(booking);
    setTargetStatus(newStatus);
    setStatusNotes('');
    setHoldHours(24);
    setActionError(null);
    setStatusModalOpen(true);
  };

  const handleExecuteStatusChange = async () => {
    if (!selectedBooking) return;

    setUpdating(true);
    setActionError(null);

    try {
      await api.updateBookingStatus(selectedBooking.id, targetStatus, {
        notes: statusNotes.trim() || undefined,
        holdHours: targetStatus === 'PENDING' ? holdHours : undefined,
      });

      setStatusModalOpen(false);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Gagal memperbarui status booking.');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenCreateModal = () => {
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerEmail('');
    setNewCheckIn('');
    setNewCheckOut('');
    setNewGuestCount(2);
    setNewTotalAmount('');
    setNewStatus('CONFIRMED');
    setNewHoldHours(24);
    setNewAdminNotes('');
    setNewSpecialRequests('');
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim() || !newCheckIn || !newCheckOut) {
      setCreateError('Mohon lengkapi nama pemesan, nomor telepon/WhatsApp, dan tanggal check-in/out.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      await api.createAdminBooking({
        villaId: 'primary',
        customerName: newCustomerName.trim(),
        customerPhone: newCustomerPhone.trim(),
        customerEmail: newCustomerEmail.trim() || undefined,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        guestCount: Number(newGuestCount),
        totalAmountIdr: newTotalAmount !== '' ? Number(newTotalAmount) : undefined,
        status: newStatus,
        holdHours: newStatus === 'PENDING' ? Number(newHoldHours) : undefined,
        adminNotes: newAdminNotes.trim() || undefined,
        specialRequests: newSpecialRequests.trim() || undefined,
      });

      setIsCreateModalOpen(false);
      setCreateSuccessMsg('Booking manual berhasil ditambahkan dan kalender telah diperbarui.');
      setTimeout(() => setCreateSuccessMsg(null), 5000);
      await fetchBookings();
    } catch (err: any) {
      setCreateError(err.message || 'Gagal menambahkan booking.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending Hold</span>
          </span>
        );
      case 'INQUIRY':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
            Inquiry
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold text-xs">
            Rejected
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-stone-200 text-stone-700 font-semibold text-xs">
            Cancelled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold text-xs">
            Completed
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-500 font-semibold text-xs">
            Expired
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Daftar Reservasi &amp; Booking
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Kelola verifikasi, konfirmasi pembayaran, dan booking manual dari WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 flex items-center gap-2 shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Booking Manual</span>
          </button>
        </div>
      </div>

      {createSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{createSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode referensi, nama tamu, atau no. telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 bg-white focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="INQUIRY">Inquiry</option>
              <option value="PENDING">Pending (Hold)</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-forest-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-forest-800"
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Referensi</th>
                <th className="px-6 py-4 font-semibold">Nama Pemesan</th>
                <th className="px-6 py-4 font-semibold">WhatsApp</th>
                <th className="px-6 py-4 font-semibold">Check-in / Out</th>
                <th className="px-6 py-4 font-semibold">Tamu</th>
                <th className="px-6 py-4 font-semibold">Total Biaya</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-stone-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-forest-800 border-t-transparent rounded-full" />
                      <span>Memuat data booking...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-stone-400">
                    Tidak ditemukan data booking yang sesuai dengan kriteria.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-forest-900">
                      {b.bookingReference}
                    </td>
                    <td className="px-6 py-4 font-semibold text-stone-900">
                      {b.customerName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-600">
                      {b.customerPhone}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>
                        {b.checkIn} → {b.checkOut}
                      </div>
                      <span className="text-[11px] text-stone-400">({b.totalNights} malam)</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {b.guestCount} org
                    </td>
                    <td className="px-6 py-4 font-bold text-xs text-stone-900">
                      Rp {b.totalAmountIdr.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(b.status)}
                      {b.status === 'PENDING' && b.expiresAt && (
                        <div className="text-[10px] text-amber-700 font-medium mt-1">
                          Exp: {new Date(b.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {b.status === 'INQUIRY' && (
                          <>
                            <button
                              onClick={() => openStatusConfirmation(b, 'PENDING')}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold hover:bg-amber-200"
                            >
                              Hold
                            </button>
                            <button
                              onClick={() => openStatusConfirmation(b, 'CONFIRMED')}
                              className="px-2.5 py-1 rounded-lg bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800"
                            >
                              Konfirmasi
                            </button>
                          </>
                        )}

                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openStatusConfirmation(b, 'CONFIRMED')}
                              className="px-2.5 py-1 rounded-lg bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800"
                            >
                              Konfirmasi
                            </button>
                            <button
                              onClick={() => openStatusConfirmation(b, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-semibold hover:bg-rose-200"
                            >
                              Tolak
                            </button>
                          </>
                        )}

                        {b.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => openStatusConfirmation(b, 'COMPLETED')}
                              className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 text-xs font-semibold hover:bg-purple-200"
                            >
                              Selesai
                            </button>
                            <button
                              onClick={() => openStatusConfirmation(b, 'CANCELLED')}
                              className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-800 text-xs font-semibold hover:bg-stone-300"
                            >
                              Batal
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedBooking && !statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-xs uppercase font-bold text-stone-400">
                  Detail Pemesanan
                </span>
                <h3 className="font-mono text-xl font-bold text-forest-900">
                  {selectedBooking.bookingReference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-stone-700">
              <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl">
                <div>
                  <span className="text-xs text-stone-500 block">Nama Pemesan</span>
                  <span className="font-semibold text-stone-900">
                    {selectedBooking.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">WhatsApp / HP</span>
                  <span className="font-semibold text-stone-900 font-mono">
                    {selectedBooking.customerPhone}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Check-in</span>
                  <span className="font-semibold text-stone-900">
                    {selectedBooking.checkIn}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Check-out</span>
                  <span className="font-semibold text-stone-900">
                    {selectedBooking.checkOut}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Jumlah Tamu</span>
                  <span className="font-semibold text-stone-900">
                    {selectedBooking.guestCount} Orang
                  </span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Total Biaya</span>
                  <span className="font-bold text-forest-900">
                    Rp {selectedBooking.totalAmountIdr.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div>
                  <span className="text-xs font-bold text-stone-600 block mb-1">
                    Catatan / Permintaan Khusus Tamu:
                  </span>
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-xs border border-amber-200">
                    {selectedBooking.specialRequests}
                  </div>
                </div>
              )}

              {/* Status Audit Logs */}
              {selectedBooking.recentLogs && selectedBooking.recentLogs.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-stone-600 block mb-2">
                    Riwayat Perubahan Status:
                  </span>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedBooking.recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold text-stone-900">
                            {log.newStatus}
                          </span>{' '}
                          <span className="text-stone-500">
                            oleh {log.changedBy?.name || 'Admin'}
                          </span>
                          {log.notes && (
                            <p className="text-[11px] text-stone-600 mt-0.5">{log.notes}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(log.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION / STATUS CHANGE DIALOG */}
      {statusModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  targetStatus === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : targetStatus === 'REJECTED' || targetStatus === 'CANCELLED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Konfirmasi Perubahan Status
                </h3>
                <span className="text-xs text-stone-500">
                  Booking: {selectedBooking.bookingReference}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
              <div>
                <span className="text-stone-500">Pemesan:</span>{' '}
                <span className="font-semibold">{selectedBooking.customerName}</span>
              </div>
              <div>
                <span className="text-stone-500">Rentang Tanggal:</span>{' '}
                <span className="font-semibold">
                  {selectedBooking.checkIn} → {selectedBooking.checkOut}
                </span>
              </div>
              <div>
                <span className="text-stone-500">Target Status:</span>{' '}
                <span className="font-bold text-stone-900 uppercase">{targetStatus}</span>
              </div>
            </div>

            {targetStatus === 'PENDING' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Masa Berlaku Hold (Jam)
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={holdHours}
                  onChange={(e) => setHoldHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Setelah batas waktu ini, status hold akan expired dan tanggal kembali terbuka.
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Catatan / Alasan Perubahan
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: DP 50% telah diterima via BCA atau jadwal bentrok"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
                {actionError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={handleExecuteStatusChange}
                className="px-5 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 shadow transition-all disabled:opacity-50"
              >
                {updating ? 'Menyimpan...' : 'Eksekusi Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MANUAL BOOKING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-forest-800" />
                  <span>Tambah Booking / Reservasi Manual</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Catat pemesanan yang disepakati langsung melalui WhatsApp atau jalur offline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Lengkap Tamu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hendra Wijaya"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    No. WhatsApp / HP Tamu *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Tamu (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="hendra@gmail.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Jumlah Tamu *
                  </label>
                  <select
                    value={newGuestCount}
                    onChange={(e) => setNewGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} Orang
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tanggal Check-in *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tanggal Check-out *
                  </label>
                  <input
                    type="date"
                    required
                    min={newCheckIn}
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Status Awal Booking *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800 bg-white font-medium"
                  >
                    <option value="CONFIRMED">CONFIRMED (Langsung Terisi &amp; Blokir Kalender)</option>
                    <option value="PENDING">PENDING (Hold Sementara Menunggu DP)</option>
                    <option value="INQUIRY">INQUIRY (Tanya-tanya / Belum Blokir)</option>
                  </select>
                </div>

                {newStatus === 'PENDING' ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Durasi Hold (Jam)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={newHoldHours}
                      onChange={(e) => setNewHoldHours(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Total Nilai Biaya Sewa (IDR)
                    </label>
                    <input
                      type="number"
                      step={50000}
                      placeholder="Kosongkan jika ingin auto-hitung"
                      value={newTotalAmount}
                      onChange={(e) => setNewTotalAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Catatan Admin / Status Pembayaran
                </label>
                <input
                  type="text"
                  placeholder="Contoh: DP 50% via transfer BCA an Hendra Wijaya pada 07/11"
                  value={newAdminNotes}
                  onChange={(e) => setNewAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Permintaan Khusus Tamu (Special Requests)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Check-in malam pukul 21:00, perlu baby cot"
                  value={newSpecialRequests}
                  onChange={(e) => setNewSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 shadow transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {createLoading ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan &amp; Masukkan Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
