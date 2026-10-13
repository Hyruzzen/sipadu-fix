import React, { useEffect, useState } from 'react';
import { ArchiveService } from '../../services/archiveService';
import { Resident, Submission } from '../../types';
import { DESA_INFO } from '../../data/mockData';
import {
  Crown,
  Users,
  Baby,
  HeartCrack,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Building2,
  FileText
} from 'lucide-react';

interface KadesDashboardProps {
  onNavigateToLaporan: () => void;
}

export const KadesDashboard: React.FC<KadesDashboardProps> = ({ onNavigateToLaporan }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);

  useEffect(() => {
    ArchiveService.getSubmissions(undefined, 'kades').then(setSubmissions);
    ArchiveService.getResidents().then(setResidents);
  }, []);

  const totalPenduduk = residents.length;
  const totalLaki = residents.filter((r) => r.gender === 'L').length;
  const totalPerempuan = residents.filter((r) => r.gender === 'P').length;
  const totalKK = new Set(residents.map((r) => r.noKk)).size;

  const totalPengajuan = submissions.length;
  const disetujuiCount = submissions.filter((s) => s.status === 'disetujui').length;
  const menungguCount = submissions.filter((s) => s.status === 'menunggu').length;
  const ditolakCount = submissions.filter((s) => s.status === 'ditolak').length;

  const births = submissions.filter((s) => s.type === 'kelahiran' && s.status === 'disetujui').length;
  const deaths = submissions.filter((s) => s.type === 'kematian' && s.status === 'disetujui').length;
  const moveIn = submissions.filter((s) => s.type === 'pindah_masuk' && s.status === 'disetujui').length;
  const moveOut = submissions.filter((s) => s.type === 'pindah_keluar' && s.status === 'disetujui').length;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Card */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-amber-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>Panel Eksekutif Kepala Desa Bojongloa</span>
              </span>
              <span className="text-xs text-amber-300">• {DESA_INFO.namaKades}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Dashboard Eksekutif Kependudukan Desa
            </h1>
            <p className="text-amber-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Ikhtisar pengawasan dan pemantauan tata kelola kependudukan, arsip surat keterangan warga,
              dan statistik mutasi penduduk Desa Bojongloa.
            </p>
          </div>

          <button
            onClick={onNavigateToLaporan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md shrink-0 transition-transform hover:scale-102"
          >
            <FileText className="w-4 h-4" />
            <span>Buka Laporan Kependudukan Lengkap</span>
          </button>
        </div>
      </div>

      {/* Village Demographics Highlight */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Penduduk Jiwa</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{totalPenduduk} Jiwa</div>
          <div className="text-[11px] text-stone-400 mt-1">L: {totalLaki} | P: {totalPerempuan}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Kepala Keluarga</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{totalKK} KK</div>
          <div className="text-[11px] text-stone-400 mt-1">Tersebar di 4 Dusun</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-semibold">Surat Disahkan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900">{disetujuiCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Selesai diverifikasi</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold">Menunggu Proses Staf</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900">{menungguCount}</div>
          <div className="text-[11px] text-amber-700 mt-1">Dalam antrean kantor desa</div>
        </div>
      </div>

      {/* Mutation & Vital Statistics for Kades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Population Dynamics */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-stone-900 text-sm">Dinamika Mutasi Penduduk Desa</h2>
            </div>
            <span className="text-xs font-semibold text-emerald-700">Surat Disetujui</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-1">
                <Baby className="w-4 h-4" />
                <span>Kelahiran Bayi</span>
              </div>
              <div className="text-2xl font-black text-emerald-900">{births} Jiwa</div>
              <p className="text-[10px] text-emerald-700 mt-1">Pertumbuhan alami desa</p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
              <div className="flex items-center gap-1.5 text-stone-700 font-semibold mb-1">
                <HeartCrack className="w-4 h-4" />
                <span>Kematian</span>
              </div>
              <div className="text-2xl font-black text-stone-900">{deaths} Jiwa</div>
              <p className="text-[10px] text-stone-500 mt-1">Telah dicatatkan akta</p>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-center gap-1.5 text-blue-800 font-semibold mb-1">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Pindah Masuk</span>
              </div>
              <div className="text-2xl font-black text-blue-900">{moveIn} Jiwa</div>
              <p className="text-[10px] text-blue-700 mt-1">Warga baru berdomisili</p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40">
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold mb-1">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Pindah Keluar</span>
              </div>
              <div className="text-2xl font-black text-amber-900">{moveOut} Jiwa</div>
              <p className="text-[10px] text-amber-700 mt-1">Mutasi keluar wilayah</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
            Laju Pertumbuhan Bersih (Net Growth): <strong>{births + moveIn - deaths - moveOut} Jiwa</strong>
          </div>
        </div>

        {/* Dusun Distribution */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-stone-900 text-sm">Sebaran Wilayah Dusun Bojongloa</h2>
            </div>
            <span className="text-xs text-stone-400">Total 4 Wilayah Dusun</span>
          </div>

          <div className="space-y-3">
            {DESA_INFO.daftarDusun.map((dusun) => {
              const count = residents.filter((r) => r.dusun === dusun && r.status === 'aktif').length;
              const pct = totalPenduduk ? Math.round((count / totalPenduduk) * 100) : 25;
              return (
                <div key={dusun} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-800">{dusun}</span>
                    <span className="font-bold text-stone-900">{count} Jiwa ({pct}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t flex justify-end">
            <button
              onClick={onNavigateToLaporan}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Periksa Laporan Resmi Bulanan & Tahunan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
