import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, AppRoute } from '../../context/NavigationContext';
import { Menu, LogIn, LogOut, User, ShieldCheck, Home } from 'lucide-react';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const ROUTE_LABELS: Record<AppRoute, string> = {
  landing: 'Portal Berita & Layanan',
  login: 'Masuk Akun',
  register: 'Pendaftaran Warga',
  pengajuan: 'Pencatatan Kependudukan',
  riwayat: 'Riwayat Pengajuan',
  persetujuan: 'Persetujuan & Verifikasi Berkas',
  penduduk: 'Master Data Penduduk',
  laporan: 'Laporan & Statistik',
  akun: 'Manajemen Akun Pengguna',
  dashboard: 'Dashboard Kependudukan',
  profil: 'Profil Kependudukan',
  pengaturan: 'Pengaturan Akun'
};

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { profile, role, logout } = useAuth();
  const { currentRoute, navigateTo } = useNavigation();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-stone-200/70 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between shadow-xs transition-colors print:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
          aria-label="Toggle Menu"
          className="p-2 rounded-xl text-stone-700 hover:text-emerald-700 hover:bg-stone-100/80 border border-stone-200/70 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <button
            onClick={() => navigateTo('landing')}
            className="hover:text-emerald-700 hidden sm:flex items-center gap-1 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Desa Bojongloa</span>
          </button>
          <span className="hidden sm:inline text-stone-300">/</span>
          <span className="font-bold text-stone-800 text-xs sm:text-sm">
            {ROUTE_LABELS[currentRoute] || 'Layanan Kependudukan'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {profile ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('profil')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs font-semibold border border-stone-200 transition-all"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">{profile.fullName}</span>
              <span className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                {role || 'Warga'}
              </span>
            </button>
            <button
              onClick={() => {
                logout();
                navigateTo('landing');
              }}
              title="Keluar dari Akun"
              className="p-1.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateTo('login')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              onClick={() => navigateTo('register')}
              className="hidden sm:flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
            >
              <span>Daftar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
