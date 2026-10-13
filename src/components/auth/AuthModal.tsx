import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DESA_INFO } from '../../data/mockData';
import { KabupatenBandungLogo } from '../KabupatenBandungLogo';
import {
  X,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  CreditCard,
  User
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess
}) => {
  const { loginWithNik, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form: NIK & Password
  const [loginNik, setLoginNik] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form: Nama, NIK, Jenis Kelamin (No KK REMOVED), Email, Phone, Password, Konfirmasi, Dusun, RT, RW
  const [regData, setRegData] = useState({
    fullName: '',
    nik: '',
    gender: 'L' as 'L' | 'P',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dusun: DESA_INFO.daftarDusun[0],
    rt: '01',
    rw: '01',
    address: 'Desa Bojongloa'
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanNik = loginNik.trim();
    if (!cleanNik) {
      setErrorMessage('Nomor Induk Kependudukan (NIK) wajib diisi.');
      setLoading(false);
      return;
    }
    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      setErrorMessage('Nomor NIK harus tepat 16 digit angka sesuai KTP!');
      setLoading(false);
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Kata sandi wajib diisi.');
      setLoading(false);
      return;
    }

    try {
      const loggedProfile = await loginWithNik(cleanNik, loginPassword);
      setSuccessMessage(`Berhasil masuk! Selamat datang, ${loggedProfile.fullName} (${loggedProfile.role.toUpperCase()}).`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk. Pastikan NIK dan kata sandi Anda sudah benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanNik = regData.nik.trim();
    if (cleanNik.length !== 16 || !/^\d+$/.test(cleanNik)) {
      setErrorMessage('Nomor NIK harus tepat 16 digit angka sesuai KTP!');
      setLoading(false);
      return;
    }

    if (!regData.password || regData.password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      setLoading(false);
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.');
      setLoading(false);
      return;
    }

    try {
      await register({
        fullName: regData.fullName.trim(),
        nik: cleanNik,
        gender: regData.gender,
        email: regData.email.trim(),
        phone: regData.phone.trim(),
        password: regData.password,
        dusun: regData.dusun,
        rt: regData.rt,
        rw: regData.rw,
        address: `${regData.address}, Dusun ${regData.dusun} RT ${regData.rt}/RW ${regData.rw}`
      });

      setSuccessMessage('Pendaftaran akun warga berhasil! Anda telah masuk sebagai Warga Desa Bojongloa.');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftar. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KabupatenBandungLogo className="w-10 h-11 shrink-0" />
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {mode === 'login' ? 'Masuk ke Portal Kependudukan' : 'Pendaftaran Akun Warga Baru'}
              </h3>
              <p className="text-xs text-stone-500">
                Pemerintah Desa Bojongloa, Kecamatan Rancaekek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-white">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Masuk dengan NIK
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Daftar Warga Baru
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM (NIK & PASSWORD ONLY - GOOGLE BUTTON REMOVED) */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK Anda (contoh: 320412...)"
                    value={loginNik}
                    onChange={(e) => setLoginNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi akun..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk dengan NIK</span>
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM (NO KK REMOVED, REPLACED WITH JENIS KELAMIN) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Asep Saepudin"
                  value={regData.fullName}
                  onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    NIK (16 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="320412..."
                    value={regData.nik}
                    onChange={(e) => setRegData({ ...regData, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* JENIS KELAMIN (REPLACES NO KK) */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, gender: 'L' })}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        regData.gender === 'L'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-600 font-bold'
                          : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span>Laki-laki</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, gender: 'P' })}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        regData.gender === 'P'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-600 font-bold'
                          : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span>Perempuan</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="warga@email.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    No. WhatsApp/HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0812..."
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 karakter"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Ulangi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Konfirmasi kata sandi"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Wilayah Dusun di Bojongloa <span className="text-red-500">*</span>
                </label>
                <select
                  value={regData.dusun}
                  onChange={(e) => setRegData({ ...regData, dusun: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
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
                    placeholder="01"
                    value={regData.rt}
                    onChange={(e) => setRegData({ ...regData, rt: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">RW</label>
                  <input
                    type="text"
                    placeholder="01"
                    value={regData.rw}
                    onChange={(e) => setRegData({ ...regData, rw: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun Warga</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
