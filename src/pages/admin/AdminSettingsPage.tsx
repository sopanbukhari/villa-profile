import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable settings fields
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [holdHours, setHoldHours] = useState('24');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [bookingPolicy, setBookingPolicy] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getSettings();
        setSettings(data);
        setWhatsappNumber(data.WHATSAPP_NUMBER || '6281234567890');
        setContactEmail(data.CONTACT_EMAIL || 'booking@villaparadisesanctuary.com');
        setContactPhone(data.CONTACT_PHONE || '+62 812-3456-7890');
        setHoldHours(data.HOLD_HOURS || '24');
        setCancellationPolicy(
          data.CANCELLATION_POLICY ||
            'Pembatalan bebas biaya hingga 7 hari sebelum kedatangan.'
        );
        setBookingPolicy(
          data.BOOKING_POLICY ||
            'Pembayaran uang muka (DP) 50% diperlukan untuk konfirmasi reservasi resmi.'
        );
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const updated = await api.updateSettings({
        WHATSAPP_NUMBER: whatsappNumber.trim(),
        CONTACT_EMAIL: contactEmail.trim(),
        CONTACT_PHONE: contactPhone.trim(),
        HOLD_HOURS: holdHours.trim(),
        CANCELLATION_POLICY: cancellationPolicy.trim(),
        BOOKING_POLICY: bookingPolicy.trim(),
      });
      setSettings(updated);
      setSuccessMsg('Pengaturan WhatsApp dan kebijakan berhasil disimpan.');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Pengaturan WhatsApp &amp; Sistem
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Kelola nomor WhatsApp admin untuk redirect customer, durasi hold pending, dan teks kebijakan.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="space-y-5">
          {/* WhatsApp Destination */}
          <div className="p-5 rounded-2xl bg-forest-50/70 border border-forest-200/80 space-y-2">
            <div className="flex items-center gap-2 text-forest-900 font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-forest-800" />
              <span>Nomor WhatsApp Tujuan Booking (Customer Redirect)</span>
            </div>
            <p className="text-xs text-forest-800/80 leading-relaxed">
              Nomor ini digunakan saat customer mengklik tombol "Booking via WhatsApp" pada website publik.
              Dapat diubah kapan saja secara dinamis tanpa mengubah source code.
            </p>
            <div className="pt-2">
              <input
                type="text"
                required
                placeholder="6281234567890 (Gunakan format 62 atau 08)"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-forest-300 text-sm font-mono font-semibold text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-800 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Kontak Resmi
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Telepon Kantor / CS
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Batas Waktu Hold Reservasi PENDING (Jam)
            </label>
            <input
              type="number"
              min={1}
              max={168}
              required
              value={holdHours}
              onChange={(e) => setHoldHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Durasi masa hold saat status diubah menjadi PENDING sebelum otomatis kedaluwarsa.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kebijakan Pembatalan (Cancellation Policy)
            </label>
            <textarea
              rows={3}
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Ketentuan Pemesanan (Booking Terms)
            </label>
            <textarea
              rows={3}
              value={bookingPolicy}
              onChange={(e) => setBookingPolicy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-forest-900 text-white font-semibold text-sm tracking-wide uppercase hover:bg-forest-800 transition-colors shadow disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
