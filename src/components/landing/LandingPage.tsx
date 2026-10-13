import React, { useState } from 'react';
import { VILLAGE_ARTICLES, DESA_PENGUMUMAN, VillageArticle } from '../../data/newsArticles';
import { DESA_INFO } from '../../data/mockData';
import heroPhoneImg from '../../assets/images/hero_smartphone_opt.webp';
import officeTeamImg from '../../assets/images/office_team_opt.webp';
import {
  FileText,
  Baby,
  HeartCrack,
  ArrowRightLeft,
  Users,
  Building2,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  Check,
  Bell,
  MapPin,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Newspaper,
  Phone,
  Mail,
  X,
  Play,
  Target,
  Compass,
  HelpCircle,
  Award
} from 'lucide-react';

interface LandingPageProps {
  onGoToService: (type?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToService, onOpenAuth }) => {
  const [selectedArticle, setSelectedArticle] = useState<VillageArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showWorkflowModal, setShowWorkflowModal] = useState<boolean>(false);

  const categories = ['all', 'Berita Desa', 'Berita Lokal', 'Kependudukan', 'Pemerintahan', 'Pemberdayaan'];

  const filteredArticles = activeCategory === 'all'
    ? VILLAGE_ARTICLES
    : VILLAGE_ARTICLES.filter((a) => a.category === activeCategory);

  const featuredArticle = VILLAGE_ARTICLES.find((a) => a.featured) || VILLAGE_ARTICLES[0];

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* ========================================================= */}
      {/* 1. HERO SECTION (DARK LUXURY TEAL/SLATE THEME FROM IMAGE 1) */}
      {/* ========================================================= */}
      <section className="relative rounded-[32px] overflow-hidden border border-[#193a4c] bg-gradient-to-b from-[#0a1a24] via-[#0d2331] to-[#08151d] text-white p-6 sm:p-10 lg:p-14 shadow-2xl">
        {/* Subtle background glow effect */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline, Pill, CTAs & Social Proof */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Pill / Badge (like 'Welcome To Optibiz') */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#123142] border border-[#1d4d67] text-[#c6f135] text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#c6f135] animate-pulse" />
              <span>Selamat Datang di Portal Resmi Desa Bojongloa</span>
            </div>

            {/* Massive Bold Headline (like 'Where The Expertise Creates Excellence') */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
              Pencatatan & Pelayanan Kependudukan Desa Digital
            </h1>

            {/* Subtitle description */}
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed max-w-xl font-normal">
              Sistem pencatatan peristiwa dan mutasi kependudukan warga Desa Bojongloa secara cepat, tertib administrasi, dan transparan.
            </p>

            {/* Button Actions (Lime button) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary CTA (Lime Button) */}
              <button
                onClick={() => onGoToService()}
                className="group px-6 py-3.5 rounded-full bg-[#c6f135] hover:bg-[#b4df27] text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-[#c6f135]/20 flex items-center gap-3 transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <span>Mulai Pencatatan Penduduk</span>
                <span className="w-6 h-6 rounded-full bg-stone-950 text-[#c6f135] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: MAIN OBJECT (IMAGE 2 - HERO SMARTPHONE WITH FLOATING BADGES) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative max-w-sm sm:max-w-md w-full">
              {/* Soft ambient back glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-[#c6f135]/20 rounded-[36px] blur-2xl transform scale-95" />

              {/* Main Smartphone Container */}
              <div className="relative rounded-[28px] overflow-hidden border-2 border-white/10 shadow-2xl bg-[#08151e] min-h-[350px] sm:min-h-[440px] flex items-center justify-center">
                <img
                  src={heroPhoneImg}
                  alt="Aplikasi Layanan Digital Desa Bojongloa pada Smartphone"
                  width={500}
                  height={670}
                  className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />

                {/* Subtle sheen highlight overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Badge 1 (Top Right like in Image 1) */}
              <div className="absolute -top-3 -right-3 sm:-right-6 bg-[#0e2736]/90 backdrop-blur-md border border-[#20516e] p-3 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-[210px] animate-bounce-slow">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-[#c6f135] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-[10px] text-slate-200 leading-tight">
                  <span className="font-bold text-white block">Status Realtime</span>
                  Terverifikasi Otomatis
                </div>
              </div>

              {/* Floating Badge 2 (Upper Left / Free Service Pill) */}
              <div className="absolute top-1/4 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md text-stone-900 px-3.5 py-2 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-stone-900">Rp 0,- (Gratis)</span>
              </div>

              {/* Floating Badge 3 (Prominent Lime Box from Image 1: '25+ Years Of Experience') */}
              <div className="absolute -bottom-4 right-4 sm:-right-4 bg-[#c6f135] text-stone-950 p-4 rounded-2xl shadow-2xl shadow-black/40 transform hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl font-black leading-none tracking-tight">25+</div>
                <div className="text-[11px] font-bold text-stone-900 mt-1 uppercase tracking-wide">
                  Tahun Pengabdian Desa
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* HERO BOTTOM: 4 FEATURE CARDS ROW (MATCHING IMAGE 1 CARDS) */}
        {/* --------------------------------------------------------- */}
        <div className="mt-12 pt-8 border-t border-[#183a4f] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Image Card ("How Does It Work?") */}
          <div
            onClick={() => setShowWorkflowModal(true)}
            className="cursor-pointer group relative rounded-2xl overflow-hidden border border-[#1d435b] min-h-[140px] flex flex-col justify-end p-4 bg-[#0d222f] hover:border-[#c6f135] transition-all"
          >
            <img
              src={officeTeamImg}
              alt="Alur Pelayanan Desa"
              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1822] via-[#0a1822]/60 to-transparent" />
            <div className="relative z-10 space-y-1">
              <h4 className="font-bold text-sm text-white group-hover:text-[#c6f135] transition-colors flex items-center justify-between">
                <span>Alur Pencatatan Penduduk</span>
                <ChevronRight className="w-4 h-4 text-[#c6f135] group-hover:translate-x-1 transition-transform" />
              </h4>
              <p className="text-[11px] text-slate-300">
                Pelajari 4 langkah alur pelaporan dan pencatatan peristiwa kependudukan.
              </p>
            </div>
          </div>

          {/* Card 2: Administrasi Kependudukan */}
          <div
            onClick={() => onGoToService()}
            className="cursor-pointer group bg-[#0e2432] hover:bg-[#122e40] border border-[#1b435b] hover:border-[#c6f135]/60 p-4 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#183a4f] text-[#c6f135] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-[#c6f135] transition-colors">
                Pencatatan Kependudukan
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Pencatatan peristiwa kelahiran, kematian, serta mutasi domisili warga desa.
              </p>
            </div>
          </div>

          {/* Card 3: Arsip & Registrasi Digital */}
          <div
            onClick={() => onGoToService()}
            className="cursor-pointer group bg-[#0e2432] hover:bg-[#122e40] border border-[#1b435b] hover:border-[#c6f135]/60 p-4 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#183a4f] text-[#c6f135] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-[#c6f135] transition-colors">
                Buku Induk Kependudukan
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Pemutakhiran basis data warga Desa Bojongloa terintegrasi dan valid.
              </p>
            </div>
          </div>

          {/* Card 4: Financial / Transparansi & Pengaduan */}
          <div
            onClick={() => {
              const el = document.getElementById('lokasi-kontak-desa');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer group bg-[#0e2432] hover:bg-[#122e40] border border-[#1b435b] hover:border-[#c6f135]/60 p-4 rounded-2xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-full bg-[#183a4f] text-[#c6f135] flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm text-white group-hover:text-[#c6f135] transition-colors">
                Layanan Pengaduan & Kontak
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Layanan tanggap cepat dan konsultasi langsung via loket & WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="visi-misi-desa"
        className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 lg:p-12 shadow-xs space-y-8"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eefbc8] text-[#3e5f08] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Arah Pembangunan Desa</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
            Visi &amp; Misi Desa Bojongloa
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <article className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#0c1d27] text-white space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c6f135] text-stone-950 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold uppercase tracking-wider">Visi</h3>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#c6f135]">Desa Bojongloa</p>
              <p className="mt-1 text-sm text-slate-200">
                Bersih, Relegius, Sejahtera, Rapi, dan Indah
              </p>
            </div>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
              “Terwujudnya masyarakat Desa Bojongloa yang Bersih, Relegius, Sejahtera, Rapi dan Indah melalui Akselerasi Pembangunan yang berbasis Keagamaan, Budaya Hukum dan Berwawasan Lingkungan dengan berorentasi pada peningkatan Kinerja Aparatur dan Pemberdayaan Masyarakat”
            </p>
          </article>

          <article className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#eefbc8] text-[#3e5f08] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 uppercase tracking-wider">Misi</h3>
                <p className="text-sm font-semibold text-stone-600">Misi dan Program Desa Bojongloa</p>
              </div>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              Dan untuk melaksanakan visi Desa Bojongloa dilaksanakan misi dan program sebagai berikut:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <section className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900">1. Pembangunan Jangka Panjang</h4>
                <ul className="mt-3 space-y-3 text-sm text-stone-600 leading-relaxed list-disc pl-5">
                  <li>Melanjutkan pembangunan desa yang belum terlaksana.</li>
                  <li>Meningkatkan kerjasama antara pemerintah desa dengan lembaga desa yang ada.</li>
                  <li>Meningkatkan kesejahtraan masyarakat desa dengan meningkatkan sarana dan prasarana ekonomi warga.</li>
                </ul>
              </section>

              <section className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900">2. Pembangunan Jangka Pendek</h4>
                <ul className="mt-3 space-y-3 text-sm text-stone-600 leading-relaxed list-disc pl-5">
                  <li>Mengembangkan dan Menjaga serta melestarikan ada istiadat desa terutama yang telah mengakar di desa Bojongloa.</li>
                  <li>Meningkatkan pelayanan dalam bidang pemerintahan kepada warga masyarakat.</li>
                  <li>Meningkatkan sarana dan prasarana ekonomi warga desa dengan perbaikan prasarana dan sarana ekonomi.</li>
                  <li>Meningkatkan sarana dan prasarana pendidikan guna peningkatan sumber daya manusia Desa Bojongloa.</li>
                </ul>
              </section>
            </div>
          </article>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. OUR SERVICES SECTION (MATCHING SECTION 3 IN IMAGE 1) */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eefbc8] text-[#3e5f08] text-xs font-bold uppercase tracking-wider mb-2">
              <span>Layanan Kami</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Layanan Pencatatan Kependudukan
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
              Pilih pencatatan peristiwa dan mutasi kependudukan Anda. Berkas diverifikasi langsung oleh petugas loket desa.
            </p>
          </div>

          <button
            onClick={() => onGoToService()}
            className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#c6f135] hover:bg-[#b4df27] text-stone-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
          >
            <span>Semua Layanan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Pillars / Service Cards (Styled like Image 1's service cards with dark bottom bar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Service 1: Kelahiran */}
          <div
            onClick={() => onGoToService('kelahiran')}
            className="cursor-pointer group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Baby className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-400 block">REGISTRASI NO. 474.1</span>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors">
                Pencatatan Kelahiran
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan data peristiwa kelahiran bayi warga Desa Bojongloa untuk pembaruan data kependudukan.
              </p>
            </div>
            {/* Dark bottom bar with icon */}
            <div className="bg-[#0c1d27] group-hover:bg-[#102734] text-white p-3.5 px-5 flex items-center justify-between transition-colors">
              <span className="text-xs font-semibold">Catat Kelahiran</span>
              <div className="w-7 h-7 rounded-full bg-[#c6f135] text-stone-950 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Service 2: Kematian */}
          <div
            onClick={() => onGoToService('kematian')}
            className="cursor-pointer group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HeartCrack className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-400 block">REGISTRASI NO. 474.2</span>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors">
                Pencatatan Kematian
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pelaporan dan pencatatan peristiwa kematian warga untuk pemutakhiran data buku induk kependudukan.
              </p>
            </div>
            <div className="bg-[#0c1d27] group-hover:bg-[#102734] text-white p-3.5 px-5 flex items-center justify-between transition-colors">
              <span className="text-xs font-semibold">Catat Kematian</span>
              <div className="w-7 h-7 rounded-full bg-[#c6f135] text-stone-950 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Service 3: Pindah Datang (Masuk) */}
          <div
            onClick={() => onGoToService('pindah_masuk')}
            className="cursor-pointer group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-400 block">REGISTRASI NO. 475.1</span>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors">
                Pencatatan Pindah Datang
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan registrasi warga baru yang berpindah domisili masuk menetap di Desa Bojongloa.
              </p>
            </div>
            <div className="bg-[#0c1d27] group-hover:bg-[#102734] text-white p-3.5 px-5 flex items-center justify-between transition-colors">
              <span className="text-xs font-semibold">Catat Pindah Datang</span>
              <div className="w-7 h-7 rounded-full bg-[#c6f135] text-stone-950 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Service 4: Pindah Keluar */}
          <div
            onClick={() => onGoToService('pindah_keluar')}
            className="cursor-pointer group bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="p-5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-400 block">REGISTRASI NO. 475.2</span>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-700 transition-colors">
                Pencatatan Pindah Keluar
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan mutasi domisili warga Desa Bojongloa yang berpindah alamat keluar wilayah desa.
              </p>
            </div>
            <div className="bg-[#0c1d27] group-hover:bg-[#102734] text-white p-3.5 px-5 flex items-center justify-between transition-colors">
              <span className="text-xs font-semibold">Catat Pindah Keluar</span>
              <div className="w-7 h-7 rounded-full bg-[#c6f135] text-stone-950 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. BERITA & WARTA RESMI DESA */}
      {/* ========================================================= */}
      <section id="berita-desa" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <span>Warta & Informasi Desa Bojongloa</span>
              <span>•</span>
              <span className="text-stone-500 normal-case font-medium">Publikasi Resmi Kegiatan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
              Kabar Terkini, Kegiatan & Transparansi Desa
            </h2>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat === 'all' ? 'Semua Berita' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article Card */}
        {activeCategory === 'all' && (
          <div
            onClick={() => setSelectedArticle(featuredArticle)}
            className="cursor-pointer bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all grid grid-cols-1 md:grid-cols-2 group"
          >
            <div className="h-64 sm:h-80 md:h-auto overflow-hidden relative">
              {featuredArticle.imageUrl ? (
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  width={600}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-emerald-50 text-emerald-700">
                  <Newspaper className="w-12 h-12" />
                  <span className="text-xs font-semibold">Berita Desa Bojongloa</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                BERITA UTAMA
              </div>
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredArticle.date}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {featuredArticle.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
                  {featuredArticle.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-800">{featuredArticle.author}</span>
                  <span className="text-[10px] text-stone-400">• Situs Resmi Desa</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Baca Selengkapnya
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles
            .filter((a) => (activeCategory === 'all' ? a.id !== featuredArticle.id : true))
            .map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="cursor-pointer bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="h-44 overflow-hidden relative">
                  {art.imageUrl ? (
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      width={400}
                      height={176}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700">
                      <Newspaper className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {art.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.author}</span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-400 text-[11px]">{art.author}</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Baca
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. INFORMASI PUBLIK */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 gap-6">
        {/* Left Column: Pengumuman Resmi */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-base">Papan Pengumuman</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Resmi
            </span>
          </div>

          <div className="space-y-3">
            {DESA_PENGUMUMAN.map((ann) => (
              <div key={ann.id} className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ann.badge === 'Penting'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ann.badge}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">{ann.date}</span>
                </div>
                <h4 className="font-bold text-stone-900 text-xs">{ann.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{ann.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Layanan Pengaduan & Informasi WhatsApp: <strong>{DESA_INFO.telepon}</strong></span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. LOKASI KANTOR DESA & PETA GOOGLE MAPS */}
      {/* ========================================================= */}
      <section id="lokasi-kontak-desa" className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" />
              <span>Lokasi & Kontak Kantor Desa</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Peta Lokasi Kantor Desa Bojongloa
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Kunjungi kantor pelayanan desa kami atau hubungi petugas loket pada jam kerja resmi.
            </p>
          </div>
          <a
            href="https://maps.google.com/?q=Kantor+Desa+Bojongloa+-+Rancaekek"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <span>Buka di Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Iframe Peta Google Maps Resmi */}
          <div className="lg:col-span-2 w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.4731765671286!2d107.76319247417635!3d-6.953376368073511!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c482cdfdbd5f%3A0x707e5fdaf44a261a!2sKantor%20Desa%20Bojongloa%20-%20Rancaekek!5e0!3m2!1sen!2sid!4v1791472840059!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Peta Kantor Desa Bojongloa - Rancaekek"
              className="w-full h-full border-0"
            />
          </div>

          {/* Kartu Informasi Alamat & Jam Layanan */}
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Alamat Kantor</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {DESA_INFO.kantorDesa}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {DESA_INFO.kecamatan}, {DESA_INFO.kabupaten}, {DESA_INFO.provinsi}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Jam Operasional Pelayanan</h4>
                  <div className="text-xs text-stone-600 mt-1 space-y-1">
                    <p className="flex justify-between gap-4">
                      <span>Senin - Kamis:</span>
                      <strong className="text-stone-800">08.00 - 15.00 WIB</strong>
                    </p>
                    <p className="flex justify-between gap-4">
                      <span>Jumat:</span>
                      <strong className="text-stone-800">08.00 - 14.30 WIB</strong>
                    </p>
                    <p className="flex justify-between gap-4 text-rose-600">
                      <span>Sabtu, Minggu & Libur:</span>
                      <strong>Tutup</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Kontak Kami</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Telepon: <strong className="text-stone-800">{DESA_INFO.telepon}</strong>
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Email:{' '}
                    <a
                      href={`mailto:${DESA_INFO.email}`}
                      className="text-stone-800 font-mono text-[11px] hover:underline"
                    >
                      {DESA_INFO.email}
                    </a>
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Kode pos: <strong className="text-stone-800">{DESA_INFO.kodePos}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. MODAL: ALUR & PANDUAN PENGAJUAN (HOW DOES IT WORK) */}
      {/* ========================================================= */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-[#0c1d27] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#c6f135] text-stone-950 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Alur Pencatatan Penduduk</h3>
                  <p className="text-xs text-slate-300">4 Langkah Pelaporan & Pencatatan Data Kependudukan</p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Pilih Jenis Pencatatan & Masuk Akun</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Pilih kategori pencatatan (Kelahiran, Kematian, Pindah Datang, atau Pindah Keluar) lalu login dengan NIK atau akun warga.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Isi Formulir & Unggah Berkas Persyaratan</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Lengkapi data kependudukan pemohon dan unggah dokumen pendukung resmi (KTP, KK, surat keterangan dokter/bidan atau surat pindah).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Verifikasi oleh Petugas Loket Desa</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Petugas administrasi desa memeriksa kelengkapan dan keabsahan berkas yang dilaporkan warga secara cermat.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Pencatatan Resmi dalam Buku Induk</h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Setelah disetujui, data kependudukan resmi diperbarui ke dalam buku induk registrasi desa dan arsip kependudukan digital.
                  </p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowWorkflowModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup Panduan
                </button>
                <button
                  onClick={() => {
                    setShowWorkflowModal(false);
                    onGoToService();
                  }}
                  className="px-5 py-2 bg-[#c6f135] hover:bg-[#b4df27] text-stone-950 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Mulai Pencatatan Sekarang →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. ARTICLE FULL READER MODAL */}
      {/* ========================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="h-64 sm:h-72 overflow-hidden relative">
              {selectedArticle.imageUrl ? (
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  width={672}
                  height={288}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700">
                  <Newspaper className="w-16 h-16" />
                </div>
              )}
              <button
                onClick={() => setSelectedArticle(null)}
                aria-label="Tutup jendela baca artikel"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900/70 text-white hover:bg-stone-900 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-xs">
                {selectedArticle.category}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto max-h-[60vh]">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>Oleh: <strong>{selectedArticle.author}</strong></span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                  {selectedArticle.title}
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed text-justify">
                {selectedArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
                <span>Diterbitkan resmi oleh <strong>Pemerintah Desa Bojongloa</strong></span>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedArticle.sourceUrl || 'https://bojongloa.desa.id'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-2 text-emerald-700 hover:bg-emerald-50 rounded-xl font-semibold"
                  >
                    Baca di Situs Resmi
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs"
                  >
                    Tutup Artikel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
