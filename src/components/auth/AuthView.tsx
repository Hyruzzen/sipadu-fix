import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DESA_INFO } from '../../data/mockData';
import { KabupatenBandungLogo } from '../KabupatenBandungLogo';
import {
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';

interface AuthViewProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onBackToLanding?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
  onBackToLanding,
}) => {
  const { loginWithNik, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form states
  const [loginNik, setLoginNik] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
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
    address: 'Desa Bojongloa',
  });

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
      setErrorMessage('Nomor NIK harus tepat 16 digit angka sesuai KTP.');
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
      setSuccessMessage(
        `Berhasil masuk! Selamat datang, ${loggedProfile.fullName} (${loggedProfile.role.toUpperCase()}).`
      );
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Gagal masuk. Pastikan NIK dan kata sandi Anda sudah benar.'
      );
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
      setErrorMessage('Nomor NIK harus tepat 16 digit angka sesuai KTP.');
      setLoading(false);
      return;
    }

    if (!regData.fullName.trim()) {
      setErrorMessage('Nama lengkap sesuai KTP wajib diisi.');
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
        address: `${regData.address}, Dusun ${regData.dusun} RT ${regData.rt}/RW ${regData.rw}`,
      });

      setSuccessMessage('Pendaftaran akun warga berhasil! Anda telah masuk secara otomatis.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftar. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-2 sm:mt-4 mb-8">
      {/* CARD CONTAINER */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* BRAND HEADER */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white p-6 sm:p-8 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs p-2 flex items-center justify-center border border-white/20 shrink-0 shadow-lg">
              <KabupatenBandungLogo className="w-full h-full text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold tracking-wide uppercase mb-1 border border-emerald-400/30">
                Pemerintah Kabupaten Bandung
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Desa Bojongloa, Rancaekek
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Sistem Informasi Arsip & Layanan Mandiri Kependudukan
              </p>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50/50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk dengan NIK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Warga Baru</span>
          </button>
        </div>

        {/* FORM CONTENT */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Status Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK Anda (contoh: 320412...)"
                    value={loginNik}
                    onChange={(e) => setLoginNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Gunakan 16 digit NIK yang tercantum pada KTP-el atau Kartu Keluarga Anda.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-700">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi akun..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Memeriksa Data...' : 'Masuk ke Portal Kependudukan'}</span>
              </button>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Asep Saepudin"
                    value={regData.fullName}
                    onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    NIK (16 Digit Angka) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="320412..."
                      value={regData.nik}
                      onChange={(e) =>
                        setRegData({ ...regData, nik: e.target.value.replace(/\D/g, '') })
                      }
                      className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, gender: 'L' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="warga@email.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    No. WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="08123456789"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 karakter"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      className="w-full pl-10 pr-9 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Ulangi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Konfirmasi sandi"
                      value={regData.confirmPassword}
                      onChange={(e) =>
                        setRegData({ ...regData, confirmPassword: e.target.value })
                      }
                      className="w-full pl-10 pr-9 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Wilayah Dusun di Bojongloa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regData.dusun}
                    onChange={(e) => setRegData({ ...regData, dusun: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    {DESA_INFO.daftarDusun.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">RT</label>
                    <input
                      type="text"
                      placeholder="01"
                      value={regData.rt}
                      onChange={(e) => setRegData({ ...regData, rt: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">RW</label>
                    <input
                      type="text"
                      placeholder="01"
                      value={regData.rw}
                      onChange={(e) => setRegData({ ...regData, rw: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar Akun Warga Bojongloa'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sistem Terenkripsi & Terintegrasi Desa</span>
            </div>
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="text-stone-600 hover:text-emerald-700 font-semibold"
              >
                &larr; Kembali ke Beranda
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
