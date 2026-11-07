import React, { useState, useEffect } from 'react';
import { Tags, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Villa } from '../../types';

export const AdminPricingPage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);

  // Base and Weekend Price
  const [basePrice, setBasePrice] = useState(3500000);
  const [weekendPrice, setWeekendPrice] = useState<number | ''>(4200000);
  const [savingBase, setSavingBase] = useState(false);
  const [baseSuccess, setBaseSuccess] = useState<string | null>(null);

  // New Seasonal Rule Form
  const [ruleName, setRuleName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rulePrice, setRulePrice] = useState(5000000);
  const [minStay, setMinStay] = useState(2);
  const [addingRule, setAddingRule] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const v = await api.getVilla('primary');
      setVilla(v);
      setBasePrice(v.basePriceIdr);
      setWeekendPrice(v.weekendPriceIdr || '');
    } catch (err) {
      console.error('Error fetching pricing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBasePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villa) return;

    setSavingBase(true);
    setBaseSuccess(null);
    try {
      await api.updateVilla(villa.id, {
        basePriceIdr: Number(basePrice),
        weekendPriceIdr: weekendPrice ? Number(weekendPrice) : null,
      });
      setBaseSuccess('Tarif dasar berhasil diperbarui.');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan tarif.');
    } finally {
      setSavingBase(false);
    }
  };

  const handleAddPricingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villa || !startDate || !endDate) return;

    setAddingRule(true);
    try {
      await api.addPricingRule({
        villaId: villa.id,
        name: ruleName.trim() || 'Peak Season',
        startDate,
        endDate,
        pricePerNightIdr: Number(rulePrice),
        minStayNights: Number(minStay),
      });

      setRuleName('');
      setStartDate('');
      setEndDate('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan aturan harga.');
    } finally {
      setAddingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Hapus aturan harga musiman ini?')) return;
    try {
      await api.deletePricingRule(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus aturan harga.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Pengaturan Harga &amp; Musiman
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Atur harga per malam standar, tarif khusus akhir pekan, serta lonjakan harga saat high/peak season.
        </p>
      </div>

      {/* Base Pricing Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
          Tarif Dasar Sewa Villa (Per Malam)
        </h3>

        {baseSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{baseSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSaveBasePricing} className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Harga Hari Biasa (Minggu - Kamis) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                Rp
              </span>
              <input
                type="number"
                required
                min={100000}
                step={50000}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Harga Akhir Pekan (Jumat - Sabtu)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                Rp
              </span>
              <input
                type="number"
                min={100000}
                step={50000}
                placeholder="Kosongkan jika sama dengan tarif biasa"
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingBase}
              className="px-6 py-2.5 rounded-xl bg-forest-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-forest-800 transition-colors shadow disabled:opacity-50"
            >
              {savingBase ? 'Menyimpan...' : 'Simpan Tarif Dasar'}
            </button>
          </div>
        </form>
      </div>

      {/* Seasonal Pricing Rule Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-forest-800" />
          <span>Tambah Aturan Harga Musiman (Peak / Holiday Season)</span>
        </h3>

        <form onSubmit={handleAddPricingRule} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Periode *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Libur Natal & Tahun Baru"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mulai Tanggal *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Selesai Tanggal *
            </label>
            <input
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Harga Per Malam Khusus (IDR) *
            </label>
            <input
              type="number"
              required
              step={50000}
              value={rulePrice}
              onChange={(e) => setRulePrice(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Minimal Menginap (Malam)
            </label>
            <input
              type="number"
              min={1}
              value={minStay}
              onChange={(e) => setMinStay(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-3 pb-0.5">
            <button
              type="submit"
              disabled={addingRule}
              className="w-full py-2.5 rounded-xl bg-forest-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-forest-800 transition-colors shadow disabled:opacity-50"
            >
              {addingRule ? 'Menyimpan...' : 'Tambahkan'}
            </button>
          </div>
        </form>

        {/* Existing Rules Table */}
        <div className="pt-4 border-t border-stone-100">
          <h4 className="text-xs uppercase font-bold text-stone-500 mb-3 tracking-wider">
            Aturan Musiman Aktif
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nama Periode</th>
                  <th className="px-4 py-3 font-semibold">Tanggal Mulai → Selesai</th>
                  <th className="px-4 py-3 font-semibold">Tarif / Malam</th>
                  <th className="px-4 py-3 font-semibold">Min. Stay</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {!villa?.pricing || villa.pricing.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-stone-400">
                      Belum ada aturan harga musiman khusus.
                    </td>
                  </tr>
                ) : (
                  villa.pricing.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/70">
                      <td className="px-4 py-3 font-semibold text-stone-900 text-xs">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.startDate} → {p.endDate}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-forest-900">
                        Rp {p.pricePerNightIdr.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.minStayNights} malam
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteRule(p.id)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                          title="Hapus aturan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
