import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { LoadingFallback } from './components/common/LoadingFallback';
import { AuthPrompt } from './components/common/AuthPrompt';

// Code-split pages for sub-second initial load and clean modular maintenance
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PengajuanPage = lazy(() => import('./pages/warga/PengajuanPage'));
const RiwayatPengajuanPage = lazy(() => import('./pages/warga/RiwayatPengajuanPage'));
const ProfilPage = lazy(() => import('./pages/warga/ProfilPage'));
const PengaturanPage = lazy(() => import('./pages/warga/PengaturanPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const PersetujuanPage = lazy(() => import('./pages/admin/PersetujuanPage'));
const DataPendudukPage = lazy(() => import('./pages/admin/DataPendudukPage'));
const LaporanPage = lazy(() => import('./pages/admin/LaporanPage'));
const ManajemenAkunPage = lazy(() => import('./pages/admin/ManajemenAkunPage'));
const KadesDashboardPage = lazy(() => import('./pages/kades/KadesDashboardPage'));
const KadesLaporanPage = lazy(() => import('./pages/kades/KadesLaporanPage'));

const MainContent: React.FC = () => {
  const { role, profile } = useAuth();
  const { currentRoute } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Router dispatcher: memetakan URL route ke komponen halaman yang sesuai
  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'landing':
        return <LandingPage />;

      case 'login':
        return <LoginPage />;

      case 'register':
        return <RegisterPage />;

      case 'pengajuan':
        if (!profile) {
          return (
            <AuthPrompt
              title="Akses Formulir Pencatatan Kependudukan"
              description="Untuk mengajukan pencatatan kelahiran, kematian, atau pindah domisili, silakan masuk ke akun warga Anda terlebih dahulu."
            />
          );
        }
        return <PengajuanPage />;

      case 'riwayat':
        if (!profile) {
          return (
            <AuthPrompt
              title="Akses Riwayat Pengajuan"
              description="Untuk memantau status persetujuan berkas permohonan Anda, silakan masuk ke akun warga Anda."
            />
          );
        }
        return <RiwayatPengajuanPage />;

      case 'profil':
        if (!profile) {
          return <AuthPrompt title="Profil Kependudukan Saya" />;
        }
        return <ProfilPage />;

      case 'pengaturan':
        if (!profile) {
          return <AuthPrompt title="Pengaturan Akun" />;
        }
        return <PengaturanPage />;

      case 'persetujuan':
        if (!profile || (role !== 'admin' && role !== 'kades')) {
          return (
            <AuthPrompt
              title="Akses Persetujuan & Verifikasi Berkas"
              description="Modul verifikasi dan persetujuan berkas pendaftaran kependudukan hanya dapat diakses oleh Administrator Desa."
            />
          );
        }
        return <PersetujuanPage />;

      case 'penduduk':
        if (!profile || (role !== 'admin' && role !== 'kades')) {
          return (
            <AuthPrompt
              title="Akses Master Data Penduduk"
              description="Database arsip induk kependudukan Desa Bojongloa hanya dapat diakses oleh Administrator Desa."
            />
          );
        }
        return <DataPendudukPage />;

      case 'laporan':
        if (!profile || (role !== 'admin' && role !== 'kades')) {
          return (
            <AuthPrompt
              title="Akses Laporan & Rekapitulasi Mutasi"
              description="Laporan rekapitulasi kependudukan desa dikhususkan untuk Administrator Desa dan Kepala Desa."
            />
          );
        }
        return role === 'kades' ? <KadesLaporanPage /> : <LaporanPage />;

      case 'akun':
        if (!profile || role !== 'admin') {
          return (
            <AuthPrompt
              title="Akses Manajemen Akun Staf"
              description="Pengaturan hak akses dan akun staf pemerintahan desa hanya dapat dikelola oleh Administrator Desa."
            />
          );
        }
        return <ManajemenAkunPage />;

      case 'dashboard':
        if (!profile) {
          return <AuthPrompt title="Dashboard Kependudukan" />;
        }
        return role === 'kades' ? <KadesDashboardPage /> : <AdminDashboardPage />;

      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-stone-900 flex font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* COLLAPSIBLE SIDEBAR */}
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* MAIN VIEWPORT */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out print:pl-0 print:m-0 print:p-0 ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        {/* TOPBAR HEADER DENGAN BREADCRUMB & STATUS USER */}
        <AppHeader
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* MAIN BODY: HALAMAN AKTIF */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 print:p-0 print:m-0 print:max-w-none print:w-full">
          <Suspense fallback={<LoadingFallback />}>
            {renderCurrentPage()}
          </Suspense>
        </main>

        {/* FOOTER RESMI PEMERINTAH DESA */}
        <AppFooter />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <MainContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
