import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { AvailabilityCalendar } from '../../components/calendar/AvailabilityCalendar';
import { api } from '../../services/api';
import { OccupiedDatesResponse, Villa } from '../../types';

export const AdminAvailabilityPage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [occupiedData, setOccupiedData] = useState<OccupiedDatesResponse | undefined>(undefined);
  const [blockedDatesList, setBlockedDatesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Block Date Form
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const v = await api.getVilla('primary');
      setVilla(v);
      const [occ, blk] = await Promise.all([
        api.getOccupiedDates(v.id),
        api.getBlockedDates(v.id),
      ]);
      setOccupiedData(occ);
      setBlockedDatesList(blk);
    } catch (err) {
      console.error('Error loading availability info', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villa || !startDate || !endDate) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await api.createBlockedDate({
        villaId: villa.id,
        startDate,
        endDate,
        reason: reason.trim() || undefined,
      });

      setStartDate('');
      setEndDate('');
      setReason('');
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Gagal memblokir tanggal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!window.confirm('Yakin ingin membuka kembali blokir tanggal ini?')) return;

    try {
      await api.deleteBlockedDate(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus blokir.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Kalender &amp; Blokir Tanggal
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Tinjau seluruh jadwal terisi dan blokir tanggal khusus (maintenance / reservasi offline).
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Calendar View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm">
            <AvailabilityCalendar
              checkIn=""
              checkOut=""
              onSelectDates={(inD, outD) => {
                if (inD) setStartDate(inD);
                if (outD) setEndDate(outD);
              }}
              occupiedData={occupiedData}
            />
          </div>
          <p className="text-xs text-stone-500 italic text-center">
            * Klik tanggal pada kalender di atas untuk mengisi formulir blokir secara cepat.
          </p>
        </div>

        {/* Block Form and List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Form */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <Lock className="w-5 h-5 text-forest-900" />
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Tutup Tanggal (Blokir)
              </h3>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mulai Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Selesai Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alasan Penutupan Tanggal
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemeliharaan rutin kolam renang"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-forest-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-forest-800 transition-colors shadow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Menyimpan...' : 'Tambahkan Blokir Tanggal'}</span>
              </button>
            </form>
          </div>

          {/* List of Blocked Dates */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
              Daftar Tanggal yang Sedang Diblokir
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {blockedDatesList.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">
                  Tidak ada tanggal yang sedang diblokir secara manual.
                </p>
              ) : (
                blockedDatesList.map((blk) => (
                  <div
                    key={blk.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-stone-900 block">
                        {blk.startDate} → {blk.endDate}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        {blk.reason || 'Ditutup oleh admin'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteBlock(blk.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Hapus blokir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
