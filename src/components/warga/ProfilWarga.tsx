import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DESA_INFO } from '../../data/mockData';
import { KabupatenBandungLogo } from '../KabupatenBandungLogo';
import {
  User,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  Building,
  ShieldCheck
} from 'lucide-react';

export const ProfilWarga: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    nik: profile?.nik || '',
    noKk: profile?.noKk || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    dusun: profile?.dusun || DESA_INFO.daftarDusun[0],
    rt: profile?.rt || '01',
    rw: profile?.rw || '01',
    gender: profile?.gender || 'L',
    birthPlace: profile?.birthPlace || 'Bandung',
    birthDate: profile?.birthDate || '1990-01-01',
    occupation: profile?.occupation || 'Wiraswasta'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Profil Kependudukan Warga
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Kelola data diri kependudukan Anda yang tercatat pada sistem administrasi Desa Bojongloa.
          </p>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
            editing
              ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {editing ? 'Batal Ubah' : 'Perbarui Profil'}
        </button>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Data profil berhasil diperbarui dan disinkronkan ke database kependudukan.</span>
        </div>
      )}

      {/* Visual Digital Resident Card (Kartu Penduduk Bojongloa) */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-emerald-600/40 pb-5">
          <div className="flex items-center gap-3">
            <KabupatenBandungLogo className="w-12 h-13 shrink-0 drop-shadow-md" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                Pemerintah Kabupaten Bandung • Desa Bojongloa
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                IDENTITAS PENDUDUK ELEKTRONIK
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Terverifikasi Sistem</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-emerald-300 font-medium block">Nomor Induk Kependudukan (NIK)</span>
                <span className="font-mono font-bold text-sm sm:text-base tracking-wider">
                  {profile?.nik || '320412••••••••••'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-300 font-medium block">Jenis Kelamin</span>
                <span className="font-bold text-sm sm:text-base">
                  {profile?.gender === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-300 font-medium block">Nama Lengkap</span>
                <span className="font-bold text-sm uppercase">{profile?.fullName}</span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-300 font-medium block">Tempat, Tanggal Lahir</span>
                <span className="text-sm">
                  {profile?.birthPlace || 'Bandung'}, {profile?.birthDate || '15 Maret 1992'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-700/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-emerald-300 font-medium block">Alamat Domisili</span>
                <span className="text-stone-200">{profile?.address || 'Jl. Desa Bojongloa No. 14'}</span>
              </div>
              <div>
                <span className="text-[11px] text-emerald-300 font-medium block">Dusun / RT / RW</span>
                <span className="text-stone-200">
                  {profile?.dusun || 'Dusun Babakan'}, RT {profile?.rt || '02'} / RW {profile?.rw || '03'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                Kontak Terdaftar
              </span>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-stone-200">
                  <Mail className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-200">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{profile?.phone || '0812-3456-7890'}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] text-emerald-300">
              Desa Bojongloa, Kec. Rancaekek, Kab. Bandung, Jawa Barat 40394
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="font-bold text-stone-900 text-sm border-b pb-2">
            Perbarui Data Pribadi
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Induk Kependudukan (NIK)</label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor Kartu Keluarga (KK)</label>
              <input
                type="text"
                maxLength={16}
                value={formData.noKk}
                onChange={(e) => setFormData({ ...formData, noKk: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nomor HP / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Dusun di Bojongloa</label>
              <select
                value={formData.dusun}
                onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              >
                {DESA_INFO.daftarDusun.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">RT</label>
                <input
                  type="text"
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">RW</label>
                <input
                  type="text"
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Alamat Domisili Lengkap</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
