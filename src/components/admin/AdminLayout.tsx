import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArchiveService } from '../../services/archiveService';
import { KabupatenBandungLogo } from '../KabupatenBandungLogo';
import { DESA_INFO } from '../../data/mockData';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  FileText,
  TrendingUp,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Home,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onBackToPublic: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  setCurrentTab,
  onBackToPublic,
  children
}) => {
  const { profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsub = ArchiveService.listenSubmissions(undefined, 'admin', (data) => {
      const pending = data.filter((s) => s.status === 'menunggu').length;
      setPendingCount(pending);
    });
    return () => unsub();
  }, []);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Kependudukan',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'pengajuan',
      label: 'Persetujuan Berkas',
      icon: FileCheck,
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      id: 'penduduk',
      label: 'Data Penduduk',
      icon: Users,
      badge: null
    },
    {
      id: 'laporan',
      label: 'Laporan & Mutasi',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'akun',
      label: 'Manajemen Akun',
      icon: ShieldCheck,
      badge: null
    }
  ];

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Kependudukan';
      case 'pengajuan':
      case 'persetujuan':
        return 'Persetujuan & Verifikasi Berkas';
      case 'penduduk':
        return 'Master Data Penduduk Bojongloa';
      case 'laporan':
        return 'Buku Laporan Mutasi Kependudukan';
      case 'akun':
        return 'Manajemen Akun & Hak Akses';
      default:
        return 'Panel Administrasi Desa';
    }
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col lg:flex-row text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <KabupatenBandungLogo className="w-6 h-7" />
          </div>
          <div>
            <div className="font-extrabold text-stone-900 text-sm leading-tight">Desa Bojongloa</div>
            <div className="text-[10px] text-stone-500 font-medium">Panel Admin Kependudukan</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => setCurrentTab('pengajuan')}
              className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1"
            >
              <span>{pendingCount}</span>
              <span className="text-[10px]">Berkas</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Logo Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md p-1.5 shrink-0">
              <KabupatenBandungLogo className="w-full h-full" />
            </div>
            <div>
              <div className="font-extrabold text-stone-900 text-base leading-tight tracking-tight">
                Desa Bojongloa
              </div>
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Panel Administrasi</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'pengajuan' && currentTab === 'persetujuan');

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-stone-400 group-hover:text-emerald-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white text-emerald-800'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Back to Public + Admin Profile Card */}
        <div className="p-3.5 border-t border-stone-200 space-y-3 bg-stone-50/70">
          <button
            onClick={onBackToPublic}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lihat Portal Berita Desa</span>
            <ExternalLink className="w-3 h-3 text-stone-400 ml-auto" />
          </button>

          {/* User Profile Card */}
          <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {profile?.fullName ? profile.fullName.charAt(0) : 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900 truncate">
                  {profile?.fullName || 'Petugas Administrator'}
                </div>
                <div className="text-[10px] text-stone-500 truncate">
                  {profile?.email || 'admin@bojongloa.desa.id'}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Keluar dari Panel Admin"
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-2xs z-40 lg:hidden"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP ADMIN HEADER BAR */}
        <header className="bg-white border-b border-stone-200 px-5 sm:px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center justify-between gap-4">
            {/* Title & Breadcrumbs */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                <span className="text-stone-400">Pemerintah Desa Bojongloa</span>
                <span>/</span>
                <span className="text-stone-600">Admin Kependudukan</span>
                <span>/</span>
                <span className="text-emerald-700 font-bold capitalize">{currentTab}</span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                {getPageTitle()}
              </h1>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>{currentDate}</span>
              </div>

              {pendingCount > 0 && (
                <button
                  onClick={() => setCurrentTab('pengajuan')}
                  className="relative p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                  title="Ada berkas menunggu verifikasi"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
                </button>
              )}

            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
