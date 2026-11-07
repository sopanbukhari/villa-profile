import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, ChevronLeft, Maximize2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Villa, VillaImage } from '../../types';

export const GalleryPage: React.FC = () => {
  const [villa, setVilla] = useState<Villa | null>(null);
  const [images, setImages] = useState<VillaImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const data = await api.getVilla('primary');
        setVilla(data);
        setImages(data.images || []);
      } catch (err) {
        console.error('Error fetching gallery', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
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
          <span className="text-forest-900 font-medium">Galeri Foto</span>
        </div>

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-200 text-forest-900 text-xs font-semibold tracking-wider uppercase mb-3">
            Dokumentasi Visual
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-forest-950 mb-3">
            Galeri Keindahan Villa
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Setiap sudut Villa Paradise Sanctuary dirancang untuk memanjakan pandangan dan menenangkan jiwa.
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <div
              key={img.id || index}
              onClick={() => openLightbox(index)}
              className="group relative rounded-2xl overflow-hidden shadow-sm bg-stone-200 aspect-[4/3] cursor-pointer hover:shadow-xl transition-all"
            >
              <img
                src={img.url}
                alt={img.caption || `Villa photo ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{img.caption || 'Villa Paradise Sanctuary'}</span>
                  <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
              {img.isPrimary && (
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-forest-900/90 text-white text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                  Cover Utama
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/availability"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-forest-900 text-white font-bold text-sm uppercase tracking-wider hover:bg-forest-800 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pesan Tanggal Menginap Anda</span>
          </Link>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
            title="Tutup"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
            title="Foto Sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
            title="Foto Berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
          >
            <img
              src={images[selectedImageIndex].url}
              alt={images[selectedImageIndex].caption || 'Villa photo'}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-4 text-center text-white">
              <p className="text-base font-medium">
                {images[selectedImageIndex].caption || 'Villa Paradise Sanctuary'}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {selectedImageIndex + 1} dari {images.length} foto
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
