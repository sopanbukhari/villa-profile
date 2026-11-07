import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, CheckCircle2, Star } from 'lucide-react';
import { api } from '../../services/api';
import { Villa, VillaImage } from '../../types';

export const AdminGalleryPage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [images, setImages] = useState<VillaImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Image Form
  const [newUrl, setNewUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const v = await api.getVilla('primary');
      setVilla(v);
      setImages(v.images || []);
    } catch (err) {
      console.error('Error fetching gallery', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!villa || !newUrl.trim()) return;

    setAdding(true);
    try {
      await api.addGalleryImage({
        villaId: villa.id,
        url: newUrl.trim(),
        caption: newCaption.trim() || undefined,
        isPrimary,
        displayOrder: images.length + 1,
      });

      setNewUrl('');
      setNewCaption('');
      setIsPrimary(false);
      await loadGallery();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan foto.');
    } finally {
      setAdding(false);
    }
  };

  const handleSetPrimary = async (imgId: string) => {
    try {
      await api.updateGalleryImage(imgId, { isPrimary: true });
      await loadGallery();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah foto utama.');
    }
  };

  const handleDeleteImage = async (imgId: string) => {
    if (!window.confirm('Yakin ingin menghapus foto ini?')) return;
    try {
      await api.deleteGalleryImage(imgId);
      await loadGallery();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus foto.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Kelola Galeri Foto
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Tambah foto resolusi tinggi, pilih foto cover utama, atau hapus foto yang sudah ada.
        </p>
      </div>

      {/* Add New Image Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-stone-900 pb-3 border-b border-stone-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-forest-800" />
          <span>Tambah Foto Baru</span>
        </h3>

        <form onSubmit={handleAddImage} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              URL Gambar (Unsplash / Cloudinary / CDN) *
            </label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Keterangan / Caption
            </label>
            <input
              type="text"
              placeholder="Contoh: Kolam renang saat senja"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-forest-800"
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-between gap-3 pb-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded text-forest-900 focus:ring-forest-800"
              />
              <span>Jadikan Cover</span>
            </label>

            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2 rounded-xl bg-forest-900 text-white font-semibold text-xs tracking-wider uppercase hover:bg-forest-800 transition-colors shadow disabled:opacity-50"
            >
              {adding ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>

      {/* Grid of Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div className="relative aspect-[4/3] bg-stone-100">
              <img
                src={img.url}
                alt={img.caption || 'Villa photo'}
                className="w-full h-full object-cover"
              />
              {img.isPrimary && (
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-forest-900 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                  <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>Cover Utama</span>
                </div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-stone-800 font-medium line-clamp-2">
                {img.caption || 'Tanpa keterangan'}
              </p>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                {!img.isPrimary ? (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className="text-forest-800 hover:text-forest-900 font-semibold"
                  >
                    Set Jadi Cover
                  </button>
                ) : (
                  <span className="text-stone-400 font-medium">Cover Aktif</span>
                )}

                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                  title="Hapus foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
