import React, { useEffect, useState, useMemo } from 'react';
import { ArchiveService } from '../../services/archiveService';
import { Resident, Submission } from '../../types';
import { DESA_INFO } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Printer, Calendar, Sliders, Check } from 'lucide-react';

const MONTH_NAMES = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER'
];

export const AdminLaporan: React.FC = () => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const now = new Date();
  const [reportType, setReportType] = useState<'bulanan' | 'tahunan'>('bulanan');
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  // Purge any old localStorage keys for lampid base to ensure completely clean state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lampid_base_laki');
      localStorage.removeItem('lampid_base_perempuan');
    }
  }, []);

  // Real database calculation: count active residents entered in the system
  const baseLaki = useMemo(
    () => residents.filter((r) => r.gender === 'L' && (r.status === 'aktif' || r.status === 'warga_baru')).length,
    [residents]
  );
  const basePerempuan = useMemo(
    () => residents.filter((r) => r.gender === 'P' && (r.status === 'aktif' || r.status === 'warga_baru')).length,
    [residents]
  );

  // Report Date & Officer Name (defaults to today's date & logged in officer)
  const [reportDate, setReportDate] = useState<string>(() => {
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${d}-${m}-${y}`;
  });
  const [officerName, setOfficerName] = useState<string>(() => {
    return profile?.fullName || DESA_INFO.namaKasiPelayanan || 'Petugas Registrasi';
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    ArchiveService.getSubmissions().then(setSubmissions);
    ArchiveService.getResidents().then(setResidents);
  }, []);

  useEffect(() => {
    if (profile?.fullName && officerName === 'Petugas Registrasi') {
      setOfficerName(profile.fullName);
    }
  }, [profile]);

  const handlePrint = () => {
    window.print();
  };

  // Format number in Indonesian dot-separated format (e.g., 12.111, 24.352, 0)
  const fmt = (n: number) => {
    if (n === 0) return '0';
    return n.toLocaleString('id-ID');
  };

  // Compute 12 months data for selectedYear sequentially
  const yearMonthlyData = useMemo(() => {
    const result: Array<{
      monthIndex: number;
      monthName: string;
      blLaki: number;
      blPerempuan: number;
      blTotal: number;
      lahirLaki: number;
      lahirPerempuan: number;
      lahirTotal: number;
      matiLaki: number;
      matiPerempuan: number;
      matiTotal: number;
      pindahLaki: number;
      pindahPerempuan: number;
      pindahTotal: number;
      datangLaki: number;
      datangPerempuan: number;
      datangTotal: number;
      totLaki: number;
      totPerempuan: number;
      jumdukTotal: number;
    }> = [];

    let currentLaki = baseLaki;
    let currentPerempuan = basePerempuan;

    for (let m = 0; m < 12; m++) {
      const subsInMonth = submissions.filter((s) => {
        if (s.status !== 'disetujui') return false;
        const d = new Date(s.updatedAt || s.createdAt);
        return d.getFullYear() === selectedYear && d.getMonth() === m;
      });

      // 1. Lahir
      let lahirL = 0;
      let lahirP = 0;
      subsInMonth
        .filter((s) => s.type === 'kelahiran')
        .forEach((s) => {
          try {
            const d = JSON.parse(s.details || '{}');
            const jk = d.jenisKelaminBayi || d.jenisKelamin || 'L';
            if (jk === 'P') lahirP++;
            else lahirL++;
          } catch {
            lahirL++;
          }
        });
      const lahirTot = lahirL + lahirP;

      // 2. Mati
      let matiL = 0;
      let matiP = 0;
      subsInMonth
        .filter((s) => s.type === 'kematian')
        .forEach((s) => {
          try {
            const d = JSON.parse(s.details || '{}');
            const jk = d.jenisKelamin || 'L';
            if (jk === 'P') matiP++;
            else matiL++;
          } catch {
            matiL++;
          }
        });

      const matiTot = matiL + matiP;

      // 3. Pindah (Keluar)
      let pindahL = 0;
      let pindahP = 0;
      subsInMonth
        .filter((s) => s.type === 'pindah_keluar')
        .forEach((s) => {
          try {
            const d = JSON.parse(s.details || '{}');
            const pengikut = parseInt(d.jumlahPengikut || '0', 10);
            const tot = 1 + (isNaN(pengikut) ? 0 : pengikut);
            const half = Math.floor(tot / 2);
            pindahL += tot - half;
            pindahP += half;
          } catch {
            pindahL++;
          }
        });

      const pindahTot = pindahL + pindahP;

      // 4. Datang (Pindah Masuk)
      let datangL = 0;
      let datangP = 0;
      subsInMonth
        .filter((s) => s.type === 'pindah_masuk')
        .forEach((s) => {
          try {
            const d = JSON.parse(s.details || '{}');
            const pengikut = parseInt(d.jumlahPengikut || '0', 10);
            const tot = 1 + (isNaN(pengikut) ? 0 : pengikut);
            const half = Math.floor(tot / 2);
            datangL += tot - half;
            datangP += half;
          } catch {
            datangL++;
          }
        });
      const datangTot = datangL + datangP;

      const blL = currentLaki;
      const blP = currentPerempuan;
      const blTot = blL + blP;

      const totL = blL + lahirL - matiL - pindahL + datangL;
      const totP = blP + lahirP - matiP - pindahP + datangP;
      const jumdukTot = totL + totP;

      result.push({
        monthIndex: m,
        monthName: MONTH_NAMES[m],
        blLaki: blL,
        blPerempuan: blP,
        blTotal: blTot,
        lahirLaki: lahirL,
        lahirPerempuan: lahirP,
        lahirTotal: lahirTot,
        matiLaki: matiL,
        matiPerempuan: matiP,
        matiTotal: matiTot,
        pindahLaki: pindahL,
        pindahPerempuan: pindahP,
        pindahTotal: pindahTot,
        datangLaki: datangL,
        datangPerempuan: datangP,
        datangTotal: datangTot,
        totLaki: totL,
        totPerempuan: totP,
        jumdukTotal: jumdukTot
      });

      // Progress forward to next month
      currentLaki = totL;
      currentPerempuan = totP;
    }

    return result;
  }, [submissions, residents, selectedYear, baseLaki, basePerempuan]);

  // Rows to display: single month if bulanan, all 12 months if tahunan
  const rowsToDisplay =
    reportType === 'bulanan'
      ? [yearMonthlyData[selectedMonth] || yearMonthlyData[0]]
      : yearMonthlyData;

  // Yearly total summary row for tahunan
  const yearlySummary = useMemo(() => {
    if (yearMonthlyData.length === 0) return null;
    const first = yearMonthlyData[0];
    const last = yearMonthlyData[11];

    let sumLahirL = 0;
    let sumLahirP = 0;
    let sumMatiL = 0;
    let sumMatiP = 0;
    let sumPindahL = 0;
    let sumPindahP = 0;
    let sumDatangL = 0;
    let sumDatangP = 0;

    yearMonthlyData.forEach((r) => {
      sumLahirL += r.lahirLaki;
      sumLahirP += r.lahirPerempuan;
      sumMatiL += r.matiLaki;
      sumMatiP += r.matiPerempuan;
      sumPindahL += r.pindahLaki;
      sumPindahP += r.pindahPerempuan;
      sumDatangL += r.datangLaki;
      sumDatangP += r.datangPerempuan;
    });

    return {
      blLaki: first.blLaki,
      blPerempuan: first.blPerempuan,
      blTotal: first.blTotal,
      lahirLaki: sumLahirL,
      lahirPerempuan: sumLahirP,
      lahirTotal: sumLahirL + sumLahirP,
      matiLaki: sumMatiL,
      matiPerempuan: sumMatiP,
      matiTotal: sumMatiL + sumMatiP,
      pindahLaki: sumPindahL,
      pindahPerempuan: sumPindahP,
      pindahTotal: sumPindahL + sumPindahP,
      datangLaki: sumDatangL,
      datangPerempuan: sumDatangP,
      datangTotal: sumDatangL + sumDatangP,
      totLaki: last.totLaki,
      totPerempuan: last.totPerempuan,
      jumdukTotal: last.jumdukTotal
    };
  }, [yearMonthlyData]);

  return (
    <div className="space-y-6">
      {/* CSS Print Stylesheet fixed to official F4 / Folio Landscape LAMPID */}
      <style>{`
        @media print {
          @page {
            size: 330mm 215mm landscape; /* Standar Resmi Kertas F4 / Folio Landscape (33 x 21.5 cm) */
            margin: 8mm 6mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, header, nav, footer {
            display: none !important;
          }
          /* Hide everything on the page except the printable report */
          body * {
            visibility: hidden;
          }
          #printable-report,
          #printable-report * {
            visibility: visible !important;
          }
          #printable-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* TOOLBAR CONTROLS (Hidden during print) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              Rekapitulasi Laporan LAMPID
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Gunakan Kertas: F4 / Folio Landscape (33 x 21.5 cm)
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Format resmi pelaporan kependudukan Desa Bojongloa. Data dihitung murni dari Master Data Penduduk & berkas mutasi yang disetujui.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              type="button"
              onClick={() => setReportType('bulanan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                reportType === 'bulanan'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Laporan Bulanan
            </button>
            <button
              type="button"
              onClick={() => setReportType('tahunan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                reportType === 'tahunan'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Laporan Tahunan
            </button>
          </div>

          {/* Month Selector if Bulanan */}
          {reportType === 'bulanan' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-800 focus:outline-hidden"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx}>
                  Bulan {m}
                </option>
              ))}
            </select>
          )}

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-stone-300 text-stone-800 focus:outline-hidden"
          >
            {[2023, 2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
            
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* SETTINGS DRAWER (Hidden during print) */}
      {showSettings && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-stone-800 space-y-3 print:hidden">
          <div className="flex items-center justify-between">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-700" />
              <span>Pengaturan Tanggal & Penandatangan Laporan</span>
            </div>
            <div className="text-[11px] text-stone-600 bg-amber-100/70 px-2 py-0.5 rounded-md">
              Data Penduduk Riil di Database: <strong className="text-stone-900">{baseLaki} L</strong> / <strong className="text-stone-900">{basePerempuan} P</strong> (Total: {baseLaki + basePerempuan})
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Tanggal Penandatanganan:
              </label>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Nama Petugas Registrasi:
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="Nama Petugas"
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL LAMPID REPORT PAPER (REPLICATING THE OFFICIAL PHOTO PRECISELY) */}
      {/* ========================================================================= */}
      <div
        id="printable-report"
        className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-10 shadow-md text-black font-sans print-full-width overflow-x-auto"
      >
        <div className="min-w-[950px] mx-auto space-y-5">
          {/* 1. DOCUMENT TITLE */}
          <div className="text-center pt-2 pb-1">
            <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-black">
              {reportType === 'bulanan'
                ? `REKAPITULASI LAPORAN LAMPID BULAN ${MONTH_NAMES[selectedMonth]} TAHUN ${selectedYear}`
                : `REKAPITULASI LAPORAN LAMPID TAHUN ${selectedYear}`}
            </h1>
          </div>

          {/* 2. REGION METADATA (LEFT: PROVINSI & KAB/KOTA, RIGHT: KECAMATAN & DESA) */}
          <div className="grid grid-cols-2 gap-8 text-[11px] sm:text-xs font-semibold px-2">
            {/* Left metadata */}
            <div className="space-y-1">
              <div className="flex">
                <span className="w-36 text-black">Provinsi</span>
                <span className="w-4">:</span>
                <span className="font-bold uppercase text-black">JAWA BARAT</span>
              </div>
              <div className="flex">
                <span className="w-36 text-black">Kabupaten / Kota</span>
                <span className="w-4">:</span>
                <span className="font-bold uppercase text-black">BANDUNG</span>
              </div>
            </div>

            {/* Right metadata */}
            <div className="space-y-1">
              <div className="flex">
                <span className="w-36 text-black">Kecamatan</span>
                <span className="w-4">:</span>
                <span className="font-bold uppercase text-black">RANCAEKEK</span>
              </div>
              <div className="flex">
                <span className="w-36 text-black">Desa / Kelurahan</span>
                <span className="w-4">:</span>
                <span className="font-bold uppercase text-black">BOJONGLOA</span>
              </div>
              {reportType === 'bulanan' && (
                <div className="flex">
                  <span className="w-36 text-black">Bulan Pelaporan</span>
                  <span className="w-4">:</span>
                  <span className="font-bold uppercase text-black">
                    {MONTH_NAMES[selectedMonth]} {selectedYear}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. OFFICIAL 19-COLUMN LAMPID TABLE */}
          <div className="border border-black overflow-hidden shadow-2xs">
            <table className="w-full text-center border-collapse text-[9px] sm:text-[10px]">
              {/* Header Row with Yellow Background exactly matching the photo */}
              <thead className="bg-[#fff9c4] text-black font-bold uppercase select-none">
                <tr className="border-b border-black divide-x divide-black">
                  <th className="py-2 px-1 border border-black min-w-[70px]">BULAN</th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    BULAN<br />LALU<br />LAKI
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    BULAN<br />LALU<br />PEREMPUAN
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    BULAN<br />LALU<br />TOTAL
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    LAHIR<br />LAKI
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    LAHIR<br />PEREMPUAN
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    LAHIR<br />TOTAL
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    MATI<br />LAKI
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    MATI<br />PEREMPUAN
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    MATI<br />TOTAL
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    PINDAH<br />LAKI
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    PINDAH<br />PEREMPUAN
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    PINDAH<br />TOTAL
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    DATANG<br />LAKI
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    DATANG<br />PEREMPUAN
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    DATANG<br />TOTAL
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    TOTAL<br />LAKI
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight">
                    TOTAL<br />PEREMPUAN
                  </th>
                  <th className="py-1 px-1 border border-black leading-tight min-w-[65px]">
                    JUMDUK<br />TOTAL
                  </th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody className="divide-y divide-black bg-white font-mono text-[9px] sm:text-[10px]">
                {rowsToDisplay.map((row) => (
                  <tr
                    key={row.monthIndex}
                    className="divide-x divide-black hover:bg-stone-50 transition-colors"
                  >
                    <td className="py-2 px-1 border border-black font-sans font-bold text-center">
                      {row.monthName}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(row.blLaki)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(row.blPerempuan)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2 font-bold">
                      {fmt(row.blTotal)}
                    </td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.lahirLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.lahirPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center font-bold">{fmt(row.lahirTotal)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.matiLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.matiPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center font-bold">{fmt(row.matiTotal)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.pindahLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.pindahPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center font-bold">{fmt(row.pindahTotal)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.datangLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(row.datangPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center font-bold">{fmt(row.datangTotal)}</td>
                    <td className="py-2 px-1 border border-black text-right pr-2 font-bold">
                      {fmt(row.totLaki)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2 font-bold">
                      {fmt(row.totPerempuan)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2 font-bold">
                      {fmt(row.jumdukTotal)}
                    </td>
                  </tr>
                ))}

                {/* Additional Summary Row for Laporan Tahunan */}
                {reportType === 'tahunan' && yearlySummary && (
                  <tr className="divide-x divide-black bg-[#fffde7] font-bold border-t-2 border-black">
                    <td className="py-2 px-1 border border-black font-sans text-center">
                      JUMLAH
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(yearlySummary.blLaki)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(yearlySummary.blPerempuan)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(yearlySummary.blTotal)}
                    </td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.lahirLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.lahirPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.lahirTotal)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.matiLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.matiPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.matiTotal)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.pindahLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.pindahPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.pindahTotal)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.datangLaki)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.datangPerempuan)}</td>
                    <td className="py-2 px-1 border border-black text-center">{fmt(yearlySummary.datangTotal)}</td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(yearlySummary.totLaki)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(yearlySummary.totPerempuan)}
                    </td>
                    <td className="py-2 px-1 border border-black text-right pr-2">
                      {fmt(yearlySummary.jumdukTotal)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. SIGNATURE SECTION (POJOK KIRI TTD KADES, POJOK KANAN PETUGAS - KOSONG UNTUK TTD & STEMPEL BASAH MANUAL) */}
          <div className="pt-8 pb-4 flex justify-between items-start text-xs text-black">
            {/* POJOK KIRI: TTD KEPALA DESA */}
            <div className="w-72 text-center space-y-1 relative pl-6">
              <p className="text-black font-medium">Mengetahui,</p>
              <p className="font-extrabold uppercase text-black tracking-wide">KEPALA DESA</p>

              {/* Ruang Kosong untuk Tanda Tangan Basah & Cap Stempel Manual */}
              <div className="h-28" />

              {/* NAMA KEPALA DESA */}
              <p className="font-extrabold underline uppercase text-black text-sm tracking-wide">
                {DESA_INFO.namaKades || 'H. AYENG'}
              </p>
            </div>

            {/* POJOK KANAN: TTD PETUGAS REGISTRASI */}
            <div className="w-72 text-center space-y-1 pr-6">
              <p className="text-black font-semibold">
                BOJONGLOA, {reportDate}
              </p>
              <p className="font-extrabold text-black tracking-wide">
                Petugas Registrasi
              </p>

              {/* Ruang Kosong untuk Tanda Tangan Basah Manual */}
              <div className="h-28" />

              {/* NAMA PETUGAS REGISTRASI DENGAN GARIS BAWAH */}
              <p className="font-extrabold underline uppercase text-black text-sm tracking-wide">
                {officerName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
