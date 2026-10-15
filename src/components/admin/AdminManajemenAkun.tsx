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
  Info
} from 'lucide-react';

export const AdminManajemenAkun: React.FC = () => {
  const { profile: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form state for role promotion / staff assignment
  const [promoteUserId, setPromoteUserId] = useState('');
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('admin');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await ArchiveService.getAllUsers();
      // Exclude mock demo accounts
      const cleaned = list.filter((u) => !u.id.startsWith('demo-warga-'));
      setUsers(cleaned);
    } catch (err) {
      console.error('Gagal memuat pengguna:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: UserRole, userName: string) => {
    try {
      await ArchiveService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setNotification(`Hak akses akun ${userName} berhasil diubah menjadi ${newRole.toUpperCase()}!`);
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      alert(`Gagal memperbarui peran akun: ${err.message}`);
    }
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteUserId) {
      alert('Silakan pilih akun pengguna yang ingin diatur perannya.');
      return;
    }

    const targetUser = users.find((u) => u.id === promoteUserId);
    if (!targetUser) return;

    await handleUpdateRole(targetUser.id, selectedNewRole, targetUser.fullName);
    setAddModalOpen(false);
    setPromoteUserId('');
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Yakin ingin menghapus akun ${userName} dari profil kependudukan?`)) return;
    try {
      await ArchiveService.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      setNotification(`Akun ${userName} berhasil dihapus dari sistem!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(`Gagal menghapus akun: ${err.message}`);
    }
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
            Daftar pengguna terautentikasi sistem Desa Bojongloa. Kelola peran akses secara aman sesuai otoritas.
          </p>
        </div>

        <button
          onClick={() => {
            setPromoteUserId('');
            setSelectedNewRole('admin');
            setAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Atur Peran Staf / Admin</span>
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
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs">
            Memuat data pengguna dari database aman Supabase...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <User className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">Tidak ada akun ditemukan</p>
            <p className="text-xs text-stone-400 mt-1 mb-4">
              Warga dapat mendaftar mandiri melalui halaman Registrasi NIK.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Nama Pengguna</th>
                  <th className="p-3.5">NIK Kependudukan</th>
                  <th className="p-3.5">Email & Kontak</th>
                  <th className="p-3.5">Hak Akses (Role)</th>
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
                        <div className="text-[10px] text-stone-400 font-mono truncate max-w-xs">
                          UID: {u.id}
                        </div>
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
                        {isCurrentUser ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                            <Shield className="w-3 h-3" />
                            <span>Admin (Akun Aktif)</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={u.role}
                              onChange={(e) =>
                                handleUpdateRole(u.id, e.target.value as UserRole, u.fullName)
                              }
                              className={`text-[11px] font-bold rounded-lg px-2 py-1 border transition-colors cursor-pointer ${
                                u.role === 'admin'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : u.role === 'kades'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-stone-50 text-stone-700 border-stone-300'
                              }`}
                            >
                              <option value="warga">Warga</option>
                              <option value="admin">Admin Desa</option>
                              <option value="kades">Kepala Desa</option>
                            </select>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {isCurrentUser ? (
                          <span className="text-[11px] text-stone-400 italic">Sedang Digunakan</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            title="Hapus profil dari database"
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

      {/* ROLE SETTING & STAFF ASSIGNMENT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  Penetapan Hak Akses Staf Desa
                </h3>
                <p className="text-xs text-stone-500">
                  Tetapkan akun terdaftar menjadi Admin Desa atau Kepala Desa
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Kata sandi dikelola secara aman oleh <strong>Supabase Auth</strong> dan tidak disimpan di basis data publik. Pengguna dapat mendaftar mandiri dengan NIK terlebih dahulu, lalu Admin menetapkan hak aksesnya di sini.
              </p>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Pilih Pengguna Terdaftar <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={promoteUserId}
                  onChange={(e) => setPromoteUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">-- Pilih Akun Berdasarkan Nama / NIK --</option>
                  {users
                    .filter((u) => u.id !== currentAdmin?.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} (NIK: {u.nik || '-'}) — Role Saat Ini: {u.role.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tugaskan Hak Akses Baru <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="admin">Administrator Desa (Kelola Arsip, Warga, dan Verifikasi)</option>
                  <option value="kades">Kepala Desa (Dashboard Eksekutif & Laporan)</option>
                  <option value="warga">Warga Biasa (Layanan Mandiri)</option>
                </select>
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
                  Terapkan Peran Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
