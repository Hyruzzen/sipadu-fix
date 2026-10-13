import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArchiveService } from '../../services/archiveService';
import { UserProfile, UserRole } from '../../types';
import {
  Shield,
  User,
  Crown,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { DESA_INFO } from '../../data/mockData';

export const AdminManajemenAkun: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form state for creating user / staff with Password
  const [newStaff, setNewStaff] = useState({
    fullName: '',
    email: '',
    role: 'admin' as UserRole,
    nik: '',
    phone: '',
    address: 'Kantor Desa Bojongloa',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nikError, setNikError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const loadUsers = async () => {
    const list = await ArchiveService.getAllUsers();
    // Exclude mock demo accounts
    const cleaned = list.filter((u) => !u.id.startsWith('demo-warga-'));
    setUsers(cleaned);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setNewStaff({
      fullName: '',
      email: '',
      role: 'admin',
      nik: '',
      phone: '',
      address: 'Kantor Desa Bojongloa',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setNikError('');
    setPasswordError('');
    setAddModalOpen(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setNikError('');
    setPasswordError('');

    const cleanNik = newStaff.nik.trim();
    if (!cleanNik) {
      setNikError('NIK wajib diisi!');
      return;
    }

    if (cleanNik.length !== 16 || !/^\d{16}$/.test(cleanNik)) {
      setNikError('NIK wajib terdiri dari tepat 16 digit angka sesuai KTP/KK!');
      return;
    }

    // Check duplicate NIK among existing users
    if (users.some((u) => u.nik === cleanNik)) {
      setNikError('NIK ini sudah digunakan oleh akun lain!');
      return;
    }

    const cleanPassword = newStaff.password.trim();
    if (!cleanPassword) {
      setPasswordError('Kata sandi wajib diisi untuk login akun!');
      return;
    }

    if (cleanPassword.length < 6) {
      setPasswordError('Kata sandi minimal 6 karakter!');
      return;
    }

    if (cleanPassword !== newStaff.confirmPassword.trim()) {
      setPasswordError('Konfirmasi kata sandi tidak cocok. Silakan periksa kembali!');
      return;
    }

    const now = new Date().toISOString();
    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      email: newStaff.email.trim(),
      fullName: newStaff.fullName.trim(),
      role: newStaff.role,
      nik: cleanNik,
      phone: newStaff.phone.trim(),
      address: newStaff.address.trim(),
      password: cleanPassword,
      createdAt: now,
      updatedAt: now
    };

    await ArchiveService.saveUserProfile(newUser);
    setUsers((prev) => [...prev, newUser]);
    setAddModalOpen(false);
    setNotification(`Akun ${newUser.fullName} (${newUser.role.toUpperCase()}) berhasil dibuat dengan NIK ${newUser.nik}!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Yakin ingin menghapus akun ${userName} dari sistem?`)) return;
    await ArchiveService.deleteUser(userId);
    setUsers(users.filter((u) => u.id !== userId));
    setNotification(`Akun ${userName} berhasil dihapus dari sistem!`);
    setTimeout(() => setNotification(null), 2500);
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.nik && u.nik.includes(searchQuery));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Manajemen Akun & Hak Akses Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Daftar akun pengguna sistem Desa Bojongloa. Hak akses role ditentukan saat akun dibuat.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'Semua Akun' },
            { id: 'warga', label: 'Warga' },
            { id: 'admin', label: 'Admin Desa' },
            { id: 'kades', label: 'Kepala Desa (Kades)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, email, NIK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <User className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">Tidak ada akun ditemukan</p>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              Silakan tambahkan akun pengguna baru dengan NIK wajib 16 digit.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Nama Pengguna</th>
                  <th className="p-3.5">NIK Kependudukan</th>
                  <th className="p-3.5">Email & Kontak</th>
                  <th className="p-3.5">Role Sistem</th>
                  <th className="p-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => {
                  const isCurrentUser = currentAdmin?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{u.fullName}</div>
                        <div className="text-[10px] text-stone-400 font-mono">UID: {u.id}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                          {u.nik || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-stone-400">{u.phone || '-'}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            u.role === 'admin'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : u.role === 'kades'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {u.role === 'kades' && <Crown className="w-3 h-3" />}
                          {u.role === 'warga' && <User className="w-3 h-3" />}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isCurrentUser ? (
                          <span className="text-[11px] text-stone-400 italic">Akun Anda Sendiri</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            title="Hapus akun dari sistem"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 hover:border-red-200 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Tambah Akun Pengguna Baru
                </h3>
                <p className="text-xs text-stone-500">
                  Peran akses (role) ditentukan saat pembuatan akun ini
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              {/* NIK Field - Mandatory */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  NIK Kependudukan (16 Digit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="Contoh: 3204121503920001"
                  value={newStaff.nik}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setNewStaff({ ...newStaff, nik: val });
                    if (nikError) setNikError('');
                  }}
                  className={`w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:outline-hidden ${
                    nikError ? 'border-red-400 focus:ring-red-400' : 'border-stone-300 focus:ring-emerald-500'
                  }`}
                />
                {nikError ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{nikError}</p>
                ) : (
                  <p className="text-[10px] text-stone-400 mt-0.5">Wajib tepat 16 digit angka sesuai KTP/KK</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Pengguna"
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Role Selection at Creation - Non-editable afterwards */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Peran Akses (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="admin">Administrator Desa (Pengelolaan Arsip & Verifikasi)</option>
                  <option value="kades">Kepala Desa (Dashboard Eksekutif & Laporan)</option>
                  <option value="warga">Warga Desa (Pengajuan Layanan Kependudukan Mandiri)</option>
                </select>
                
              </div>

              {/* Password Fields - Mandatory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Kata Sandi Akun <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 karakter"
                      value={newStaff.password}
                      onChange={(e) => {
                        setNewStaff({ ...newStaff, password: e.target.value });
                        if (passwordError) setPasswordError('');
                      }}
                      className="w-full pl-3 pr-8 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi kata sandi"
                      value={newStaff.confirmPassword}
                      onChange={(e) => {
                        setNewStaff({ ...newStaff, confirmPassword: e.target.value });
                        if (passwordError) setPasswordError('');
                      }}
                      className="w-full pl-3 pr-8 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              {passwordError && (
                <p className="text-[11px] text-red-600 font-medium -mt-1">{passwordError}</p>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs transition-colors"
                >
                  Simpan & Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
