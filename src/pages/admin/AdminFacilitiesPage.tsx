import React, { useState, useEffect } from 'react';
import { Plus, Trash2, UtensilsCrossed, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Villa, VillaFacility } from '../../types';

export const AdminFacilitiesPage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [facilities, setFacilities] = useState<VillaFacility[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Facility Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Living & Outdoor');
  const [icon, setIcon] = useState('sparkles');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const v = await api.getVilla('primary');
      setVilla(v);
      setFacilities(v.facilities || []);
    } catch (err) {
      console.error('Error fetching facilities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villa || !name.trim()) return;

    setSubmitting(true);
    try {
      await api.addFacility({
        villaId: villa.id,
        name: name.trim(),
        category,
        icon,
        description: description.trim() || undefined,
        isFeatured,
      });

      setName('');
      setDescription('');
      setIsFeatured(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan fasilitas.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus fasilitas ini?')) return;
    try {
      await api.deleteFacility(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus fasilitas.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Kelola Fasilitas Villa
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Atur fasilitas yang ditawarkan kepada tamu dan tampilkan di highlight beranda.
        </p>
      </div>

      {/* Add New Facility Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-forest-800" />
          <span>Tambah Fasilitas Baru</span>
        </h3>

        <form onSubmit={handleAddFacility} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Fasilitas *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Mesin Kopi Espresso"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800 bg-white"
            >
              <option value="Living & Outdoor">Living &amp; Outdoor</option>
              <option value="Bedroom & Bath">Bedroom &amp; Bath</option>
              <option value="Kitchen & Dining">Kitchen &amp; Dining</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Services">Services</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Ikon
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800 bg-white"
            >
              <option value="waves">Kolam / Air (waves)</option>
              <option value="wifi">Wi-Fi (wifi)</option>
              <option value="wind">AC / Udara (wind)</option>
              <option value="bath">Bak Mandi (bath)</option>
              <option value="coffee">Dapur / Kopi (coffee)</option>
              <option value="tv">TV / Hiburan (tv)</option>
              <option value="sparkles">Layanan / Housekeeping (sparkles)</option>
              <option value="shield-check">Keamanan / Parkir (shield-check)</option>
            </select>
          </div>

          <div className="md:col-span-2 pb-1">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-forest-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-forest-800 transition-colors shadow disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Tambah'}
            </button>
          </div>

          <div className="md:col-span-9">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Deskripsi Singkat Fasilitas
            </label>
            <input
              type="text"
              placeholder="Contoh: Lengkap dengan kapsul kopi gratis setiap pagi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-3 pb-2">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-forest-900 focus:ring-forest-800"
              />
              <span>Tampilkan di Beranda</span>
            </label>
          </div>
        </form>
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-stone-700">
          <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Fasilitas</th>
              <th className="px-6 py-4 font-semibold">Kategori</th>
              <th className="px-6 py-4 font-semibold">Deskripsi</th>
              <th className="px-6 py-4 font-semibold">Featured</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {facilities.map((f) => (
              <tr key={f.id} className="hover:bg-stone-50/70 transition-colors">
                <td className="px-6 py-4 font-semibold text-stone-900">
                  {f.name}
                </td>
                <td className="px-6 py-4 text-xs text-stone-600">
                  {f.category}
                </td>
                <td className="px-6 py-4 text-xs text-stone-500 max-w-xs truncate">
                  {f.description || '-'}
                </td>
                <td className="px-6 py-4 text-xs">
                  {f.isFeatured ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      Featured
                    </span>
                  ) : (
                    <span className="text-stone-400 text-[11px]">Standar</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDeleteFacility(f.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Hapus fasilitas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
