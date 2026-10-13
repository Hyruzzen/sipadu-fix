import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { LandingPage } from './components/landing/LandingPage';
import { KabupatenBandungLogo } from './components/KabupatenBandungLogo';
import { DESA_INFO } from './data/mockData';
import {
  Menu,
  Home,
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  Shield,
  FileText
} from 'lucide-react';

// Code-split heavy portal views and modals for sub-second initial load
const AuthView = lazy(() => import('./components/auth/AuthView').then(m => ({ default: m.AuthView })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));
const PengajuanForm = lazy(() => import('./components/warga/PengajuanForm').then(m => ({ default: m.PengajuanForm })));
const RiwayatPengajuan = lazy(() => import('./components/warga/RiwayatPengajuan').then(m => ({ default: m.RiwayatPengajuan })));
const ProfilWarga = lazy(() => import('./components/warga/ProfilWarga').then(m => ({ default: m.ProfilWarga })));
const PengaturanWarga = lazy(() => import('./components/warga/PengaturanWarga').then(m => ({ default: m.PengaturanWarga })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminPengajuan = lazy(() => import('./components/admin/AdminPengajuan').then(m => ({ default: m.AdminPengajuan })));
const AdminDataPenduduk = lazy(() => import('./components/admin/AdminDataPenduduk').then(m => ({ default: m.AdminDataPenduduk })));
const AdminLaporan = lazy(() => import('./components/admin/AdminLaporan').then(m => ({ default: m.AdminLaporan })));
const AdminManajemenAkun = lazy(() => import('./components/admin/AdminManajemenAkun').then(m => ({ default: m.AdminManajemenAkun })));
const KadesDashboard = lazy(() => import('./components/kades/KadesDashboard').then(m => ({ default: m.KadesDashboard })));
const KadesLaporan = lazy(() => import('./components/kades/KadesLaporan').then(m => ({ default: m.KadesLaporan })));

const ViewLoadingFallback: React.FC = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <span className="text-xs font-semibold text-stone-500">Memuat modul pelayanan...</span>
  </div>
);

const MainContent: React.FC = () => {
  const { role, profile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'portal' | 'auth'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auto-set tab based on role when logging in
  useEffect(() => {
    if (role === 'admin') {
      setCurrentTab('dashboard');
      setViewMode('portal');
    } else if (role === 'kades') {
      setCurrentTab('dashboard');
      setViewMode('portal');
    } else if (role === 'warga') {
      setCurrentTab('pengajuan');
      setViewMode('portal');
    }
  }, [role]);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setViewMode('auth');
  };

  const handleGoToService = (type?: string) => {
    if (!profile) {
      handleOpenAuth('login');
    } else {
      setViewMode('portal');
      setCurrentTab('pengajuan');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/90 text-stone-900 flex font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* COLLAPSIBLE SIDEBAR (Bisa buka dan tutup) */}
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAuth={handleOpenAuth}
      />

      {/* MAIN VIEWPORT (Adjusts left margin smoothly based on sidebarOpen state) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out print:pl-0 print:m-0 print:p-0 ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        {/* TOPBAR BERSIH DENGAN SEDIKIT BLUR & HANYA TOMBOL HAMBURGER */}
        <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-6 lg:px-8 h-14 flex items-center shadow-xs transition-colors print:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
            aria-label="Toggle Menu"
            className="p-2 rounded-xl text-stone-700 hover:text-emerald-700 hover:bg-stone-100/80 border border-stone-200/70 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 print:p-0 print:m-0 print:max-w-none print:w-full">
          <Suspense fallback={<ViewLoadingFallback />}>
            {/* VIEW: AUTHENTICATION (Login / Register Screen) */}
            {viewMode === 'auth' && (
              <AuthView
                initialMode={authMode}
                onSuccess={() => {
                  setViewMode('portal');
                }}
                onBackToLanding={() => setViewMode('landing')}
              />
            )}

            {/* VIEW: LANDING PAGE (Portal Berita & Kabar Desa Bojongloa) */}
            {viewMode === 'landing' && (
              <LandingPage
                onGoToService={handleGoToService}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {/* VIEW: PORTAL (Protected Role-based views) */}
            {viewMode === 'portal' && (
              <>
                {!profile ? (
                  /* Unauthenticated fallback prompt */
                  <div className="max-w-xl mx-auto mt-4 sm:mt-6 mb-12 bg-white rounded-3xl border border-stone-200 p-8 shadow-xl text-center space-y-5 animate-in fade-in">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                      <KabupatenBandungLogo className="w-12 h-13" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-stone-900">
                        Akses Layanan Arsip Kependudukan
                      </h2>
                      <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                        Untuk menjaga keamanan data dan keabsahan berkas, akses portal arsip kependudukan Desa Bojongloa
                        memerlukan autentikasi akun terdaftar.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                      <button
                        onClick={() => handleOpenAuth('login')}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
                      >
                        Masuk ke Akun Anda
                      </button>
                      <button
                        onClick={() => handleOpenAuth('register')}
                        className="px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs"
                      >
                        Daftar Warga Baru
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Authenticated views by role */
                  <div>
                    {/* WARGA ROLE */}
                    {role === 'warga' && (
                      <div>
                        {currentTab === 'pengajuan' && (
                          <PengajuanForm onSuccess={() => setCurrentTab('riwayat')} />
                        )}
                        {currentTab === 'riwayat' && <RiwayatPengajuan />}
                        {currentTab === 'profil' && <ProfilWarga />}
                        {currentTab === 'pengaturan' && <PengaturanWarga />}
                      </div>
                    )}

                    {/* ADMIN DESA ROLE */}
                    {role === 'admin' && (
                      <div>
                        {currentTab === 'dashboard' && (
                          <AdminDashboard
                            onNavigateToPengajuan={() => setCurrentTab('pengajuan')}
                            onNavigateToPenduduk={() => setCurrentTab('penduduk')}
                            onNavigateToLaporan={() => setCurrentTab('laporan')}
                          />
                        )}
                        {(currentTab === 'pengajuan' || currentTab === 'persetujuan') && (
                          <AdminPengajuan />
                        )}
                        {currentTab === 'penduduk' && <AdminDataPenduduk />}
                        {currentTab === 'laporan' && <AdminLaporan />}
                        {currentTab === 'akun' && <AdminManajemenAkun />}
                      </div>
                    )}

                    {/* KADES ROLE */}
                    {role === 'kades' && (
                      <div>
                        {currentTab === 'dashboard' && (
                          <KadesDashboard onNavigateToLaporan={() => setCurrentTab('laporan')} />
                        )}
                        {currentTab === 'laporan' && <KadesLaporan />}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Suspense>
        </main>

        {/* CIVIC FOOTER */}
        <footer className="bg-stone-900 text-stone-300 mt-16 pt-12 pb-8 border-t border-stone-800 print:hidden text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Identity */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-3">
                  <KabupatenBandungLogo className="w-10 h-11 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-white text-base">
                      PEMERINTAH DESA BOJONGLOA
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      Kecamatan Rancaekek, Kabupaten Bandung, Provinsi Jawa Barat
                    </p>
                  </div>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed max-w-md">
                  Sistem Informasi Pencatatan Kependudukan Resmi dan Administrasi Warga Desa Bojongloa.
                  Mewujudkan tata kelola kependudukan desa yang transparan, akuntabel, dan terpercaya.
                </p>
                <div className="flex items-center gap-4 text-emerald-400 font-medium pt-1">
                  <span>Portal Resmi Kependudukan</span>
                  <span>•</span>
                  <span>Kode Wilayah Desa: {DESA_INFO.kodeWilayah}</span>
                </div>
              </div>

              {/* Kontak Resmi */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
                  Kontak & Pelayanan
                </h4>
                <div className="space-y-2 text-stone-400 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{DESA_INFO.kantorDesa}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{DESA_INFO.telepon}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{DESA_INFO.email}</span>
                  </div>
                </div>
              </div>

              {/* Tautan Cepat */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
                  Akses Mandiri
                </h4>
                <ul className="space-y-1.5 text-stone-400">
                  <li>
                    <button
                      onClick={() => {
                        setViewMode('landing');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors"
                    >
                      Portal Berita Desa
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleGoToService()}
                      className="hover:text-white transition-colors"
                    >
                      Pencatatan Penduduk
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleOpenAuth('login')}
                      className="hover:text-white transition-colors"
                    >
                      Masuk Akun Warga / Staf
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
              <div>
                Hak Cipta © {new Date().getFullYear()} Pemerintah Desa Bojongloa. Dilindungi Undang-Undang.
              </div>
              <div className="flex items-center gap-3">
                <span>Sistem Kependudukan Terintegrasi Firebase</span>
                <span>•</span>
                <span>Kec. Rancaekek, Kab. Bandung</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* MODALS */}
      <Suspense fallback={null}>
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            defaultMode={authMode}
            onSuccess={() => setViewMode('portal')}
          />
        )}
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
