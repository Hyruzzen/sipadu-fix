import React, { useState, useMemo } from 'react';
import { Submission, SubmissionType } from '../../types';
import { ArchiveService } from '../../services/archiveService';
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  PlusCircle,
  Radio,
  ArrowUpRight,
  Info
} from 'lucide-react';

interface RealtimePengajuanChartProps {
  submissions: Submission[];
  onNavigateToPengajuan?: () => void;
  onFilterMonth?: (monthIndex: number, year: number) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

type CategoryType = 'kelahiran' | 'kematian' | 'pindah_masuk' | 'pindah_keluar';

const CATEGORY_CONFIG: Record<
  CategoryType,
  {
    id: CategoryType;
    label: string;
    colorHex: string;
    barGradient: string;
    activeTabClass: string;
    badgeActiveClass: string;
    textColor: string;
    lightBg: string;
    ringClass: string;
  }
> = {
  kelahiran: {
    id: 'kelahiran',
    label: 'Kelahiran',
    colorHex: '#059669',
    barGradient: 'bg-gradient-to-t from-emerald-600 to-emerald-400',
    activeTabClass: 'bg-emerald-600 text-white shadow-2xs',
    badgeActiveClass: 'bg-emerald-700 text-white',
    textColor: 'text-emerald-700',
    lightBg: 'bg-emerald-50',
    ringClass: 'ring-emerald-500',
  },
  kematian: {
    id: 'kematian',
    label: 'Kematian',
    colorHex: '#e11d48',
    barGradient: 'bg-gradient-to-t from-rose-600 to-rose-400',
    activeTabClass: 'bg-rose-600 text-white shadow-2xs',
    badgeActiveClass: 'bg-rose-700 text-white',
    textColor: 'text-rose-700',
    lightBg: 'bg-rose-50',
    ringClass: 'ring-rose-500',
  },
  pindah_masuk: {
    id: 'pindah_masuk',
    label: 'Pindah Masuk',
    colorHex: '#2563eb',
    barGradient: 'bg-gradient-to-t from-blue-600 to-blue-400',
    activeTabClass: 'bg-blue-600 text-white shadow-2xs',
    badgeActiveClass: 'bg-blue-700 text-white',
    textColor: 'text-blue-700',
    lightBg: 'bg-blue-50',
    ringClass: 'ring-blue-500',
  },
  pindah_keluar: {
    id: 'pindah_keluar',
    label: 'Pindah Keluar',
    colorHex: '#d97706',
    barGradient: 'bg-gradient-to-t from-amber-600 to-amber-400',
    activeTabClass: 'bg-amber-600 text-white shadow-2xs',
    badgeActiveClass: 'bg-amber-700 text-white',
    textColor: 'text-amber-700',
    lightBg: 'bg-amber-50',
    ringClass: 'ring-amber-500',
  },
};

export const RealtimePengajuanChart: React.FC<RealtimePengajuanChartProps> = ({
  submissions,
  onNavigateToPengajuan,
  onFilterMonth
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('kelahiran');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(currentMonthIdx);
  const [isSimulating, setIsSimulating] = useState(false);
  const [justUpdatedPulse, setJustUpdatedPulse] = useState(false);

  const currentCatConfig = CATEGORY_CONFIG[selectedCategory];

  // Available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>([currentYear, currentYear - 1]);
    submissions.forEach(s => {
      const y = new Date(s.createdAt).getFullYear();
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [submissions, currentYear]);

  // Aggregate submissions per month for selectedYear
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: MONTH_NAMES[i],
      shortName: MONTH_SHORT[i],
      total: 0,
      kelahiran: 0,
      kematian: 0,
      pindah_masuk: 0,
      pindah_keluar: 0,
      disetujui: 0,
      diproses: 0,
      menunggu: 0,
      ditolak: 0,
    }));

    // Live submissions dari database / state
    submissions.forEach((sub) => {
      const date = new Date(sub.createdAt);
      if (isNaN(date.getTime())) return;
      if (date.getFullYear() !== selectedYear) return;

      const mIdx = date.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        months[mIdx].total += 1;

        if (sub.type === 'kelahiran') months[mIdx].kelahiran += 1;
        else if (sub.type === 'kematian') months[mIdx].kematian += 1;
        else if (sub.type === 'pindah_masuk') months[mIdx].pindah_masuk += 1;
        else if (sub.type === 'pindah_keluar') months[mIdx].pindah_keluar += 1;

        if (sub.status === 'disetujui') months[mIdx].disetujui += 1;
        else if (sub.status === 'diproses') months[mIdx].diproses += 1;
        else if (sub.status === 'menunggu') months[mIdx].menunggu += 1;
        else if (sub.status === 'ditolak') months[mIdx].ditolak += 1;
      }
    });

    return months;
  }, [submissions, selectedYear]);

  // Max value calculation for chart scaling
  const maxMonthValue = useMemo(() => {
    let max = 0;
    monthlyData.forEach(m => {
      const val = m[selectedCategory];
      if (val > max) max = val;
    });
    return Math.max(max, 5); // Minimum scale 5
  }, [monthlyData, selectedCategory]);

  // Overall Statistics for selected year
  const stats = useMemo(() => {
    let totalYear = 0;
    let totalKelahiran = 0;
    let totalKematian = 0;
    let totalPindahMasuk = 0;
    let totalPindahKeluar = 0;
    let totalDisetujui = 0;
    let peakMonth = monthlyData[0];

    monthlyData.forEach(m => {
      totalYear += m.total;
      totalKelahiran += m.kelahiran;
      totalKematian += m.kematian;
      totalPindahMasuk += m.pindah_masuk;
      totalPindahKeluar += m.pindah_keluar;
      totalDisetujui += m.disetujui;
      if (m.total > peakMonth.total) {
        peakMonth = m;
      }
    });

    const activeMonthsCount = selectedYear === currentYear ? (currentMonthIdx + 1) : 12;
    const avgPerMonth = activeMonthsCount > 0 ? (totalYear / activeMonthsCount).toFixed(1) : '0';
    const completionRate = totalYear > 0 ? Math.round((totalDisetujui / totalYear) * 100) : 100;

    // Growth compared to previous month
    const thisMonthVal = monthlyData[currentMonthIdx]?.total || 0;
    const prevMonthVal = currentMonthIdx > 0 ? (monthlyData[currentMonthIdx - 1]?.total || 0) : 0;
    const growthPercent = prevMonthVal > 0 
      ? Math.round(((thisMonthVal - prevMonthVal) / prevMonthVal) * 100)
      : (thisMonthVal > 0 ? 100 : 0);

    return {
      totalYear,
      totalKelahiran,
      totalKematian,
      totalPindahMasuk,
      totalPindahKeluar,
      totalDisetujui,
      avgPerMonth,
      peakMonth,
      completionRate,
      growthPercent
    };
  }, [monthlyData, selectedYear, currentYear, currentMonthIdx]);

  // Active or hovered month data
  const highlightedMonth = monthlyData[hoveredMonthIdx ?? activeMonthIdx] || monthlyData[currentMonthIdx];

  // Quick simulation helper to test real-time reactivity
  const handleSimulateRealtimeSubmission = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const types: SubmissionType[] = ['kelahiran', 'kematian', 'pindah_masuk', 'pindah_keluar'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomNames = ['Bpk. Yayan Sopian', 'Ibu Entin Supartini', 'Agus Permana', 'Cecep Gunawan', 'Siti Maryam'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomNik = '320412' + Math.floor(1000000000 + Math.random() * 9000000000);

    const titles: Record<SubmissionType, string> = {
      kelahiran: `Pengajuan Keterangan Kelahiran - Bayi ${randomName}`,
      kematian: `Pengajuan Keterangan Kematian - ${randomName}`,
      pindah_masuk: `Pengajuan Keterangan Pindah Masuk - ${randomName}`,
      pindah_keluar: `Pengajuan Pindah Keluar - ${randomName}`
    };

    try {
      await ArchiveService.createSubmission({
        userId: 'demo-sim-' + Date.now(),
        userEmail: `warga.${Date.now()}@bojongloa.desa.id`,
        userName: randomName,
        userNik: randomNik,
        userPhone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
        type: randomType,
        status: 'menunggu',
        title: titles[randomType],
        details: JSON.stringify({ pemohon: randomName, catatan: 'Pengajuan online via loket digital warga' }),
        attachments: JSON.stringify([{ name: 'KTP_KK_Pemohon.pdf', type: 'Identitas', url: '#' }])
      });

      setJustUpdatedPulse(true);
      setTimeout(() => setJustUpdatedPulse(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  // SVG dimensions for Area Chart
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Compute points for SVG Area/Line
  const points = monthlyData.map((m, idx) => {
    const val = m[selectedCategory];
    const x = paddingX + (idx / 11) * chartW;
    const y = svgHeight - paddingY - (maxMonthValue > 0 ? (val / maxMonthValue) * chartH : 0);
    return { x, y, val, month: m };
  });

  // Construct curved path using Catmull-Rom or cubic Bezier
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (!linePath) return '';
    return `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
  }, [linePath, points, svgHeight, paddingY]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all">
      {/* 1. Header with Title & Real-time Indicator */}
      <div className="p-5 sm:p-6 border-b border-stone-200/80 bg-gradient-to-r from-stone-50/70 via-white to-emerald-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span className={`w-2 h-2 rounded-full bg-emerald-600 ${justUpdatedPulse ? 'animate-ping' : 'animate-pulse'}`} />
              <span>Realtime Live-Sync</span>
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Database Desa Bojongloa
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500">
              Total {stats.totalYear} Pengajuan ({selectedYear})
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Grafik Pengajuan per Bulan</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Statistik tren permohonan mutasi kependudukan (Kelahiran, Kematian, Pindah Masuk & Pindah Keluar) yang masuk secara realtime.
          </p>
        </div>

        {/* Action Controls: Year, Chart Type, Test Simulator */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Year Selector */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 text-xs font-semibold">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedYear === yr
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setChartType('bar')}
              title="Grafik Batang Komparatif"
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Batang</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              title="Grafik Tren Garis"
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                chartType === 'area'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Tren</span>
            </button>
          </div>

          {/* Test Realtime Button */}
          <button
            onClick={handleSimulateRealtimeSubmission}
            disabled={isSimulating}
            title="Uji simulasi pengajuan warga baru masuk secara langsung"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-2xs transition-all active:scale-95 disabled:opacity-50"
          >
            <PlusCircle className={`w-3.5 h-3.5 text-emerald-700 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Memproses...' : '+ Uji Realtime'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-stone-100 divide-x divide-y md:divide-y-0 divide-stone-100 bg-stone-50/40 text-xs">
        <div className="p-3.5 sm:p-4">
          <div className="text-stone-500 text-[11px] font-semibold">Total Pengajuan ({selectedYear})</div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5 tracking-tight">
            {stats.totalYear} <span className="text-xs font-semibold text-stone-500">Berkas</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-1 font-semibold">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>Aktif dipantau</span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="text-stone-500 text-[11px] font-semibold">Rata-rata per Bulan</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-0.5 tracking-tight">
            {stats.avgPerMonth} <span className="text-xs font-semibold text-stone-500">Berkas/bln</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1 font-medium">
            Tingkat aktivitas pelayanan
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="text-stone-500 text-[11px] font-semibold">Bulan Pengajuan Tertinggi</div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5 tracking-tight">
            {stats.peakMonth.shortName} <span className="text-xs font-bold text-amber-700">({stats.peakMonth.total} berkas)</span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1 font-medium">
            Puncak volume pelayanan warga
          </div>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="text-stone-500 text-[11px] font-semibold">Tingkat Terselesaikan</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-800 mt-0.5 tracking-tight">
            {stats.completionRate}%
          </div>
          <div className="text-[10px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{stats.totalDisetujui} surat resmi terbit</span>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="px-5 py-2.5 bg-stone-50/70 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-stone-500 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" />
            Kategori:
          </span>
          {[
            { id: 'kelahiran' as CategoryType, label: 'Kelahiran', count: stats.totalKelahiran },
            { id: 'kematian' as CategoryType, label: 'Kematian', count: stats.totalKematian },
            { id: 'pindah_masuk' as CategoryType, label: 'Pindah Masuk', count: stats.totalPindahMasuk },
            { id: 'pindah_keluar' as CategoryType, label: 'Pindah Keluar', count: stats.totalPindahKeluar }
          ].map((cat) => {
            const config = CATEGORY_CONFIG[cat.id];
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isCatActive
                    ? config.activeTabClass
                    : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200/80'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isCatActive ? config.badgeActiveClass : 'bg-stone-100 text-stone-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Category Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">Kategori Aktif:</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${currentCatConfig.lightBg} ${currentCatConfig.textColor} border border-stone-200 shadow-2xs`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentCatConfig.colorHex }} />
            <span>Permohonan {currentCatConfig.label} ({chartType === 'bar' ? 'Grafik Batang' : 'Grafik Tren'})</span>
          </span>
        </div>
      </div>

      {/* 4. Chart Visualization Area */}
      <div className="p-4 sm:p-6">
        {chartType === 'bar' ? (
          /* BAR CHART VIEW */
          <div className="space-y-4">
            {/* Bars container */}
            <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 px-1 border-b border-stone-200">
              {monthlyData.map((m, idx) => {
                const value = m[selectedCategory];
                const heightPercent = maxMonthValue > 0 ? (value / maxMonthValue) * 100 : 0;
                const isCurrentMonth = selectedYear === currentYear && idx === currentMonthIdx;
                const isSelected = activeMonthIdx === idx;
                const isHovered = hoveredMonthIdx === idx;

                return (
                  <div
                    key={m.shortName}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                    onClick={() => {
                      setActiveMonthIdx(idx);
                      if (onFilterMonth) onFilterMonth(idx, selectedYear);
                    }}
                  >
                    {/* Value Badge above bar */}
                    <div
                      className={`text-[10px] font-bold mb-1 transition-all duration-200 ${
                        isSelected || isHovered
                          ? `${currentCatConfig.textColor} scale-110 font-extrabold`
                          : 'text-stone-400 group-hover:text-stone-700'
                      }`}
                    >
                      {value > 0 ? value : '-'}
                    </div>

                    {/* Bar container */}
                    <div className="w-full max-w-[42px] h-full flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 relative overflow-hidden flex flex-col justify-end ${
                          isSelected
                            ? `ring-2 ${currentCatConfig.ringClass} shadow-md ring-offset-1`
                            : isHovered
                            ? `ring-1 ${currentCatConfig.ringClass} shadow-xs`
                            : ''
                        }`}
                        style={{ height: `${Math.max(heightPercent, value > 0 ? 6 : 2)}%` }}
                      >
                        <div
                          className={`w-full h-full rounded-t-lg transition-colors ${currentCatConfig.barGradient}`}
                          title={`${currentCatConfig.label} (${m.shortName}): ${value}`}
                        />
                      </div>
                    </div>

                    {/* Month Label below bar */}
                    <div className="mt-2 text-center w-full">
                      <span
                        className={`block text-[11px] font-semibold transition-colors ${
                          isSelected
                            ? `${currentCatConfig.textColor} font-extrabold`
                            : isCurrentMonth
                            ? 'text-stone-900 font-bold'
                            : 'text-stone-500 group-hover:text-stone-800'
                        }`}
                      >
                        {m.shortName}
                      </span>
                      {isCurrentMonth && (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: currentCatConfig.colorHex }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* AREA / LINE TREND VIEW (Responsive SVG) */
          <div className="space-y-4">
            <div className="h-64 sm:h-72 w-full relative">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentCatConfig.colorHex} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={currentCatConfig.colorHex} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = svgHeight - paddingY - pct * chartH;
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#e7e5e4"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fontSize="9"
                        fill="#78716c"
                        textAnchor="end"
                        fontWeight="600"
                      >
                        {Math.round(pct * maxMonthValue)}
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve */}
                {areaPath && (
                  <path d={areaPath} fill="url(#areaGradient)" />
                )}

                {/* The Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={currentCatConfig.colorHex}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Interactive Points */}
                {points.map((pt, idx) => {
                  const isSelected = activeMonthIdx === idx;
                  const isHovered = hoveredMonthIdx === idx;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                      onClick={() => {
                        setActiveMonthIdx(idx);
                        if (onFilterMonth) onFilterMonth(idx, selectedYear);
                      }}
                    >
                      {/* Outer pulse if selected */}
                      {isSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="10"
                          fill={currentCatConfig.colorHex}
                          fillOpacity="0.2"
                        />
                      )}
                      {/* Main point */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected || isHovered ? 6 : 4}
                        fill="#ffffff"
                        stroke={currentCatConfig.colorHex}
                        strokeWidth="2.5"
                      />
                      {/* Month label along bottom */}
                      <text
                        x={pt.x}
                        y={svgHeight - 10}
                        fontSize="10"
                        fill={isSelected ? currentCatConfig.colorHex : '#78716c'}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {pt.month.shortName}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* 5. Detail Box for the Selected / Hovered Month */}
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="font-extrabold text-stone-900 text-sm">
                Rincian Bulan {highlightedMonth.monthName} {selectedYear}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {highlightedMonth.total} Pengajuan Masuk
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Berikut rincian komposisi jenis permohonan surat dan status tindak lanjut petugas pada bulan ini.
            </p>
          </div>

          {/* Breakdown Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Kelahiran */}
            <button
              onClick={() => setSelectedCategory('kelahiran')}
              className={`px-2.5 py-1.5 rounded-lg border text-emerald-900 flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                selectedCategory === 'kelahiran'
                  ? 'bg-emerald-100/90 border-emerald-400 ring-2 ring-emerald-500/40 shadow-2xs font-bold'
                  : 'bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100/60'
              }`}
              title="Filter grafik: Kelahiran"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Kelahiran: <strong className="font-bold">{highlightedMonth.kelahiran}</strong></span>
            </button>

            {/* Kematian */}
            <button
              onClick={() => setSelectedCategory('kematian')}
              className={`px-2.5 py-1.5 rounded-lg border text-rose-900 flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                selectedCategory === 'kematian'
                  ? 'bg-rose-100/90 border-rose-400 ring-2 ring-rose-500/40 shadow-2xs font-bold'
                  : 'bg-rose-50 border-rose-200/80 hover:bg-rose-100/60'
              }`}
              title="Filter grafik: Kematian"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Kematian: <strong className="font-bold">{highlightedMonth.kematian}</strong></span>
            </button>

            {/* Pindah Masuk */}
            <button
              onClick={() => setSelectedCategory('pindah_masuk')}
              className={`px-2.5 py-1.5 rounded-lg border text-blue-900 flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                selectedCategory === 'pindah_masuk'
                  ? 'bg-blue-100/90 border-blue-400 ring-2 ring-blue-500/40 shadow-2xs font-bold'
                  : 'bg-blue-50 border-blue-200/80 hover:bg-blue-100/60'
              }`}
              title="Filter grafik: Pindah Masuk"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Pindah Masuk: <strong className="font-bold">{highlightedMonth.pindah_masuk}</strong></span>
            </button>

            {/* Pindah Keluar */}
            <button
              onClick={() => setSelectedCategory('pindah_keluar')}
              className={`px-2.5 py-1.5 rounded-lg border text-amber-900 flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                selectedCategory === 'pindah_keluar'
                  ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-500/40 shadow-2xs font-bold'
                  : 'bg-amber-50 border-amber-200/80 hover:bg-amber-100/60'
              }`}
              title="Filter grafik: Pindah Keluar"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Pindah Keluar: <strong className="font-bold">{highlightedMonth.pindah_keluar}</strong></span>
            </button>

            {/* Action to jump to submission table */}
            {onNavigateToPengajuan && (
              <button
                onClick={onNavigateToPengajuan}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-all"
              >
                <span>Kelola Berkas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
