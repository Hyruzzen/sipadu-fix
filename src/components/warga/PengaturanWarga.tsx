import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DESA_INFO } from '../../data/mockData';
import {
  Bell,
  Lock,
  Phone,
  HelpCircle,
  FileCheck,
  CheckCircle,
  Clock,
  Shield,
  Send
} from 'lucide-react';

export const PengaturanWarga: React.FC = () => {
  const { profile } = useAuth();
  const [waNotify, setWaNotify] = useState(true);
  const [emailNotify, setEmailNotify] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  const handleSavePreferences = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
          Pengaturan & Pusat Informasi
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Konfigurasi notifikasi pembaruan berkas dan pedoman standar pelayanan kependudukan Desa Bojongloa.
        </p>
      </div>

      {savedSettings && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferensi notifikasi pengajuan berhasil disimpan!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifikasi Pengajuan */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Notifikasi Status Pengajuan Arsip</span>
          </div>
          <p className="text-xs text-stone-500">
            Dapatkan informasi otomatis ketika berkas Anda disetujui, diproses, atau ditolak oleh petugas.
          </p>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-stone-800 block">Notifikasi WhatsApp</span>
                <span className="text-[11px] text-stone-500">Kirim pemberitahuan ke {profile?.phone || 'nomor HP Anda'}</span>
              </div>
              <input
                type="checkbox"
                checked={waNotify}
                onChange={(e) => setWaNotify(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-stone-800 block">Notifikasi Email Resmi</span>
                <span className="text-[11px] text-stone-500">Kirim bukti surat elektronik ke {profile?.email}</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Simpan Preferensi
            </button>
          </div>
        </div>

        {/* Jam Layanan Kantor Desa */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Jam Operasional Pelayanan Kantor Desa</span>
          </div>
          <p className="text-xs text-stone-500">
            Pengajuan yang dikirimkan secara daring akan diverifikasi pada hari dan jam kerja:
          </p>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-stone-700">Senin - Kamis:</span>
              <span className="text-stone-900 font-mono">08:00 - 15:30 WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-stone-700">Jumat:</span>
              <span className="text-stone-900 font-mono">08:00 - 11:30 WIB</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Sabtu - Minggu:</span>
              <span>Libur (Pelayanan Daring Tetap Aktif)</span>
            </div>
          </div>

          <div className="text-xs text-stone-600 space-y-1 pt-1">
            <p><strong>Alamat:</strong> {DESA_INFO.kantorDesa}</p>
            <p><strong>Kontak Petugas:</strong> {DESA_INFO.telepon}</p>
          </div>
        </div>
      </div>

      {/* Standar Pelayanan Kependudukan */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>Panduan Persyaratan Dokumen Kependudukan Desa</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/70 space-y-2">
            <h4 className="font-bold text-stone-800">1. Keterangan Kelahiran</h4>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>Surat Keterangan Lahir dari Bidan / Rumah Sakit / Penolong.</li>
              <li>Fotokopi Kartu Keluarga (KK) orang tua.</li>
              <li>Fotokopi KTP Ayah dan Ibu.</li>
              <li>Fotokopi Buku Nikah / Akta Perkawinan orang tua.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/70 space-y-2">
            <h4 className="font-bold text-stone-800">2. Keterangan Kematian</h4>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>Surat Pernyataan / Pengantar Kematian dari Ketua RT/RW setempat.</li>
              <li>KTP asli atau fotokopi almarhum/almarhumah.</li>
              <li>Kartu Keluarga di mana almarhum tercantum.</li>
              <li>Surat keterangan dokter/rumah sakit jika meninggal di fasilitas kesehatan.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/70 space-y-2">
            <h4 className="font-bold text-stone-800">3. Pindah Datang (Masuk)</h4>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>Surat Keterangan Pindah WNI (SKPWNI) dari Disdukcapil daerah asal.</li>
              <li>Kartu Keluarga dari daerah asal.</li>
              <li>Surat persetujuan penerimaan dari RT/RW tujuan di Desa Bojongloa.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/70 space-y-2">
            <h4 className="font-bold text-stone-800">4. Pindah Keluar</h4>
            <ul className="list-disc pl-4 space-y-1 text-stone-600">
              <li>Surat Pengantar Pindah dari RT/RW domisili di Bojongloa.</li>
              <li>Kartu Keluarga asli dan fotokopi KTP pemohon.</li>
              <li>Formulir permohonan pindah yang ditandatangani Kepala Keluarga.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
