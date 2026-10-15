import React, { useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { UserRole } from '../../src/types';
import { DESA_INFO } from '../../src/data/mockData';
import { KabupatenBandungLogo } from './KabupatenBandungLogo';
import {
  FileText,
  User,
  Shield,
  Crown,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  CheckCircle2,
  Home
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  viewMode: 'landing' | 'portal';
  setViewMode: (mode: 'landing' | 'portal') => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  viewMode,
  setViewMode,
  onOpenAuthModal
}) => {
  const { profile, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tabs for portal views based on authenticated role
  const getPortalTabs = () => {
    if (!role) return [];
    if (role === 'warga') {
      return [
        { id: 'pengajuan', label: 'Pencatatan Penduduk', icon: FileText },
        { id: 'riwayat', label: 'Riwayat Pengajuan', icon: CheckCircle2 },
        { id: 'profil', label: 'Profil Saya', icon: User },
        { id: 'pengaturan', label: 'Pengaturan', icon: Shield },
      ];
    } else if (role === 'admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Shield },
        { id: 'pengajuan', label: 'Persetujuan Berkas', icon: FileText },
        { id: 'penduduk', label: 'Data Penduduk', icon: User },
        { id: 'laporan', label: 'Laporan & Mutasi', icon: CheckCircle2 },
        { id: 'akun', label: 'Manajemen Akun', icon: Shield },
      ];
    } else {
      // kades
      return [
        { id: 'dashboard', label: 'Dashboard Eksekutif', icon: Crown },
        { id: 'laporan', label: 'Laporan Kependudukan', icon: CheckCircle2 },
      ];
    }
  };

  const portalTabs = getPortalTabs();

  const getRoleBadge = (r: UserRole | null) => {
    switch (r) {
      case 'admin':
        return { label: 'Admin Desa', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Shield };
      case 'kades':
        return { label: 'Kepala Desa', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Crown };
      case 'warga':
        return { label: 'Warga Desa', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: User };
      default:
        return null;
    }
  };

  const currentRoleBadge = getRoleBadge(role);
  const RoleIcon = currentRoleBadge?.icon;

  const handleServiceClick = () => {
    if (!profile) {
      onOpenAuthModal('login');
    } else {
      setViewMode('portal');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity (Official Kabupaten Bandung Emblem) */}
          <div
            onClick={() => setViewMode('landing')}
            className="flex items-center gap-3.5 cursor-pointer group select-none py-1"
          >
            <div className="transition-transform group-hover:scale-105 duration-200 shrink-0">
              <KabupatenBandungLogo className="w-11 h-12 sm:w-12 sm:h-13" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 tracking-tight text-lg sm:text-xl">
                  DESA BOJONGLOA
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                  Kec. Rancaekek
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                Pemerintah Kabupaten Bandung • Wilayah Desa Bojongloa
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {/* Beranda Website Desa */}
            <button
              onClick={() => setViewMode('landing')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                viewMode === 'landing'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Portal Berita Desa</span>
            </button>

            {/* Portal Arsip Layanan Mandiri */}
            <button
              onClick={handleServiceClick}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                viewMode === 'portal'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Layanan Arsip Kependudukan</span>
            </button>

            {/* If in portal mode & authenticated, show role subtabs */}
            {viewMode === 'portal' && profile && (
              <div className="flex items-center pl-2 ml-2 border-l border-stone-200 gap-1">
                {portalTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-stone-900 text-white'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Right Action Controls: Authenticated Profile OR Login/Register */}
          <div className="flex items-center gap-2 sm:gap-3">
            {profile && currentRoleBadge && RoleIcon ? (
              /* User is logged in: Show Name + Verified Role Badge + Logout */
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setViewMode('portal');
                    if (role === 'warga') setCurrentTab('profil');
                    else setCurrentTab('dashboard');
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 transition-colors shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {profile.fullName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="leading-tight max-w-[130px] truncate">{profile.fullName}</div>
                    <div className="text-[10px] text-stone-400 capitalize">{currentRoleBadge.label}</div>
                  </div>
                </button>

                {/* Role indicator pill */}
                <span
                  className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${currentRoleBadge.bg}`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span>{currentRoleBadge.label}</span>
                </span>

                <button
                  onClick={logout}
                  title="Keluar dari Akun"
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* User is NOT logged in: Show Login & Register buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 border border-stone-300 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-stone-600" />
                  <span>Masuk</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Daftar Warga</span>
                  <span className="sm:hidden">Daftar</span>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 lg:hidden text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-emerald-200 space-y-3">
            <div className="flex gap-2 p-1 bg-emerald-50 rounded-xl">
              <button
                onClick={() => {
                  setViewMode('landing');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                  viewMode === 'landing' ? 'bg-emerald-200 shadow-xs text-emerald-900' : 'text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                Portal Berita Desa
              </button>
              <button
                onClick={() => {
                  handleServiceClick();
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                  viewMode === 'portal' ? 'bg-emerald-200 shadow-xs text-emerald-900' : 'text-emerald-400 hover:bg-emerald-100'
                }`}
              >
                Layanan Arsip
              </button>
            </div>

            {viewMode === 'portal' && profile && (
              <div className="space-y-1 pt-2">
                <div className="text-[11px] font-bold text-emerald-400 px-3 uppercase">
                  Menu Panel {currentRoleBadge?.label}
                </div>
                {portalTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setCurrentTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
