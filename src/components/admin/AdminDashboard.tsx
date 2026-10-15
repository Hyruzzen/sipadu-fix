import React, { useEffect, useState } from 'react';
import { ArchiveService } from '../../services/archiveService';
import { Resident, Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { RealtimePengajuanChart } from './RealtimePengajuanChart';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Baby,
  HeartCrack,
  ArrowRightLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  Search,
  Plus,
  Printer,
  Calendar,
  Check,
  X,
  FileCheck,
  Eye,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { DESA_INFO } from '../../data/mockData';

interface AdminDashboardProps {
  onNavigateToPengajuan: () => void;
  onNavigateToPenduduk: () => void;
  onNavigateToLaporan?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToPengajuan,
  onNavigateToPenduduk,
  onNavigateToLaporan
}) => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  // Table filter state
  const [tableFilter, setTableFilter] = useState<'all' | 'menunggu' | 'diproses' | 'disetujui'>('all');
  const [searchTable, setSearchTable] = useState('');

  // Quick Action Modal states
  const [selectedSubForReview, setSelectedSubForReview] = useState<Submission | null>(null);
  const [rejectingItem, setRejectingItem] = useState<Submission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvingItem, setApprovingItem] = useState<Submission | null>(null);
  const [customLetterNumber, setCustomLetterNumber] = useState('');
  const [previewSubmission, setPreviewSubmission] = useState<Submission | null>(null);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);

  useEffect(() => {
    const unsubSub = ArchiveService.listenSubmissions(undefined, 'admin', (data) => {
      setSubmissions(data);
    });
    const unsubRes = ArchiveService.listenResidents((data) => {
      setResidents(data);
      setLoading(false);
    });

    return () => {
      unsubSub();
      unsubRes();
    };
  }, []);

  const totalPengajuan = submissions.length;
  const menungguCount = submissions.filter((s) => s.status === 'menunggu').length;
  const diprosesCount = submissions.filter((s) => s.status === 'diproses').length;
  const disetujuiCount = submissions.filter((s) => s.status === 'disetujui').length;
  const ditolakCount = submissions.filter((s) => s.status === 'ditolak').length;

  const kelahiranCount = submissions.filter((s) => s.type === 'kelahiran').length;
  const kematianCount = submissions.filter((s) => s.type === 'kematian').length;
  const pindahMasukCount = submissions.filter((s) => s.type === 'pindah_masuk').length;
  const pindahKeluarCount = submissions.filter((s) => s.type === 'pindah_keluar').length;

  // Active Population stats
  const activeResidents = residents.filter((r) => r.status === 'aktif');
  const totalPenduduk = activeResidents.length;
  const totalLaki = activeResidents.filter((r) => r.gender === 'L').length;
  const totalPerempuan = activeResidents.filter((r) => r.gender === 'P').length;
  const totalKK = new Set(residents.map((r) => r.noKk).filter(Boolean)).size;

  // Recent Submissions filtered for table
  const recentSubmissions = submissions
    .filter((s) => {
      if (tableFilter !== 'all' && s.status !== tableFilter) return false;
      if (!searchTable.trim()) return true;
      const q = searchTable.toLowerCase();
      return (
        s.userName.toLowerCase().includes(q) ||
        s.userNik.includes(q) ||
        s.title.toLowerCase().includes(q) ||
        (s.suratNumber && s.suratNumber.toLowerCase().includes(q))
      );
    })
    .slice(0, 8);

  const handleOpenApprove = async (sub: Submission) => {
    const seq = submissions.filter((s) => s.status === 'disetujui').length + 1;
    const genNo = await ArchiveService.generateSuratNumber(sub.type, seq);
    setCustomLetterNumber(genNo);
    setApprovingItem(sub);
  };

  const handleConfirmApproval = async () => {
    if (!approvingItem) return;
    await ArchiveService.updateSubmissionStatus(
      approvingItem.id,
      'disetujui',
      profile?.fullName || 'Petugas Administrasi Desa',
      undefined,
      customLetterNumber
    );
    setApprovingItem(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    if (!rejectionReason.trim()) {
      alert('Harap masukkan catatan/alasan penolakan berkas!');
      return;
    }
    await ArchiveService.updateSubmissionStatus(
      rejectingItem.id,
      'ditolak',
      profile?.fullName || 'Petugas Administrasi Desa',
      rejectionReason.trim()
    );
    setRejectingItem(null);
    setRejectionReason('');
  };

  const handleSetDiproses = async (sub: Submission) => {
    await ArchiveService.updateSubmissionStatus(
      sub.id,
      'diproses',
      profile?.fullName || 'Petugas Administrasi Desa'
    );
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome & Notification Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 rounded-2xl p-6 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
              Panel Administrator Desa Bojongloa
            </span>
            <span className="text-xs text-emerald-200">• {DESA_INFO.kecamatan}</span>
            <span className="text-xs text-emerald-300">• {currentDateFormatted}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Dashboard Pengarsipan Data Penduduk & Mutasi Warga
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Kelola arsip mutasi warga secara terintegrasi, verifikasi berkas pengajuan pencatatan data penduduk warga,
            dan perbarui buku induk kependudukan resmi desa.
          </p>
        </div>

        {/* Top Action Pills */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {menungguCount > 0 ? (
            <button
              onClick={onNavigateToPengajuan}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-transform hover:scale-102"
            >
              <AlertTriangle className="w-4 h-4 text-stone-950" />
              <span>{menungguCount} Berkas Menunggu Verifikasi</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/50 border border-emerald-400/40 text-emerald-100 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Semua Berkas Tertangani</span>
            </div>
          )}

          <button
            onClick={onNavigateToPenduduk}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>+ Catat Penduduk Baru</span>
          </button>
        </div>
      </div>

      {/* Realtime Citizen Submissions Monthly Chart (Menggantikan 4 kartu metrik) */}
      <RealtimePengajuanChart
        submissions={submissions}
        onNavigateToPengajuan={onNavigateToPengajuan}
      />

      {/* Quick Action Bar (Aksi Cepat Admin) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Aksi Cepat Administrasi:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateToPengajuan}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <span>Verifikasi Berkas ({menungguCount})</span>
          </button>

          <button
            onClick={onNavigateToPenduduk}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-700" />
            <span>+ Tambah Data Penduduk</span>
          </button>

          {onNavigateToLaporan && (
            <button
              onClick={onNavigateToLaporan}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Cetak Rekap Kependudukan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Section: Left (Table of Approvals), Right (Demographics & Mutations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Persetujuan Berkas Terkini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden">
          {/* Header of Table */}
          <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-stone-900 text-base">
                  Persetujuan Berkas Terkini
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Daftar pengajuan pencatatan data kependudukan warga yang memerlukan verifikasi petugas desa.
              </p>
            </div>

            <button
              onClick={onNavigateToPengajuan}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 w-fit"
            >
              <span>Kelola Semua ({submissions.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Table Filters & Search */}
          <div className="px-5 py-3 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'menunggu', label: `Menunggu (${menungguCount})` },
                { id: 'diproses', label: `Diproses (${diprosesCount})` },
                { id: 'disetujui', label: `Disetujui (${disetujuiCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTableFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                    tableFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, NIK, judul..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-stone-200 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submissions Table Body */}
          <div className="overflow-x-auto flex-1">
            {recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-stone-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="font-semibold text-stone-800 text-sm">Tidak ada berkas yang sesuai filter.</div>
                <div className="text-xs text-stone-400">Silakan ubah kata kunci pencarian atau tab filter.</div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Pemohon / Warga</th>
                    <th className="py-3 px-4">Jenis Surat</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentSubmissions.map((sub) => {
                    const statusBadge = () => {
                      switch (sub.status) {
                        case 'menunggu':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Menunggu</span>;
                        case 'diproses':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Diproses</span>;
                        case 'disetujui':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Disetujui</span>;
                        case 'ditolak':
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">Ditolak</span>;
                      }
                    };

                    const typeBadge = () => {
                      switch (sub.type) {
                        case 'kelahiran':
                          return <span className="text-emerald-700 font-semibold">Kelahiran (474.1)</span>;
                        case 'kematian':
                          return <span className="text-stone-700 font-semibold">Kematian (474.2)</span>;
                        case 'pindah_masuk':
                          return <span className="text-blue-700 font-semibold">Pindah Masuk (475.1)</span>;
                        case 'pindah_keluar':
                          return <span className="text-amber-700 font-semibold">Pindah Keluar (475.2)</span>;
                      }
                    };

                    return (
                      <tr key={sub.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{sub.userName}</div>
                          <div className="text-[10px] text-stone-400 font-mono">NIK: {sub.userNik}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {typeBadge()}
                          <div className="text-[10px] text-stone-400 truncate max-w-[180px]">{sub.title}</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {statusBadge()}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {sub.status === 'menunggu' && (
                              <>
                                <button
                                  onClick={() => handleOpenApprove(sub)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                                  title="Setujui dan beri nomor surat resmi"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => setRejectingItem(sub)}
                                  className="px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 text-[11px] font-semibold transition-colors"
                                  title="Tolak berkas dengan catatan"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {sub.status === 'diproses' && (
                              <button
                                onClick={() => handleOpenApprove(sub)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Finalisasi</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedSubForReview(sub)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                              title="Lihat Detail Berkas"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Mutasi Kependudukan & Sebaran Dusun */}
        <div className="space-y-6">
          {/* Card: Rekap Mutasi Bulan Berjalan */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-stone-900 text-sm">
                  Mutasi Kependudukan
                </h2>
              </div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Buku Mutasi Desa
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Kelahiran */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <Baby className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold">Kelahiran</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono">474.1</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-950">{kelahiranCount}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Jiwa baru terdaftar</div>
              </div>

              {/* Kematian */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex items-center justify-between text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <HeartCrack className="w-4 h-4 text-stone-500" />
                    <span className="text-xs font-bold">Kematian</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">474.2</span>
                </div>
                <div className="text-2xl font-extrabold text-stone-900">{kematianCount}</div>
                <div className="text-[10px] text-stone-500 font-medium">Akta kematian terbit</div>
              </div>

              {/* Pindah Masuk */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                <div className="flex items-center justify-between text-blue-800">
                  <div className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold">Pindah Masuk</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-mono">475.1</span>
                </div>
                <div className="text-2xl font-extrabold text-blue-950">{pindahMasukCount}</div>
                <div className="text-[10px] text-blue-700 font-medium">Warga baru datang</div>
              </div>

              {/* Pindah Keluar */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1">
                <div className="flex items-center justify-between text-amber-800">
                  <div className="flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold">Pindah Keluar</span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-mono">475.2</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-950">{pindahKeluarCount}</div>
                <div className="text-[10px] text-amber-700 font-medium">Mutasi ke luar desa</div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Pertumbuhan Penduduk Bersih:</span>
              <span className="font-bold text-emerald-700">
                +{kelahiranCount + pindahMasukCount - kematianCount - pindahKeluarCount} Jiwa
              </span>
            </div>
          </div>

          {/* Card: Sebaran Penduduk per Dusun */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h2 className="font-extrabold text-stone-900 text-sm">
                  Sebaran Wilayah Dusun
                </h2>
              </div>
              <button
                onClick={onNavigateToPenduduk}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Detail
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {DESA_INFO.daftarDusun.map((dusun) => {
                const countDusun = residents.filter((r) => r.dusun === dusun && r.status === 'aktif').length;
                const percent = totalPenduduk > 0 ? Math.round((countDusun / totalPenduduk) * 100) : 0;
                return (
                  <div key={dusun} className="space-y-1">
                    <div className="flex justify-between items-center text-stone-700">
                      <span className="font-semibold">{dusun}</span>
                      <span className="font-mono text-stone-500 font-bold">
                        {countDusun.toLocaleString('id-ID')} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Database Real-Time
              </span>
              <span className="font-semibold text-stone-700">Terhubung Firestore</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Review & Detail Submissions */}
      {selectedSubForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden text-xs">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-sm">Detail Berkas Permohonan Warga</h3>
              </div>
              <button
                onClick={() => setSelectedSubForReview(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1 border border-stone-200">
                <div className="font-bold text-stone-900 text-sm">{selectedSubForReview.title}</div>
                <div className="text-stone-600">Pemohon: <strong>{selectedSubForReview.userName}</strong> (NIK: {selectedSubForReview.userNik})</div>
                <div className="text-[11px] text-stone-500">
                  Tanggal Pengajuan: {new Date(selectedSubForReview.createdAt).toLocaleString('id-ID')}
                </div>
              </div>

              <div>
                <span className="font-bold text-stone-700 block mb-1">Rincian Data Berkas:</span>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] text-stone-800 space-y-1 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {(() => {
                    try {
                      const d = JSON.parse(selectedSubForReview.details || '{}');
                      return Object.entries(d).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-stone-500">{k}:</span> {String(v)}
                        </div>
                      ));
                    } catch {
                      return selectedSubForReview.details;
                    }
                  })()}
                </div>
              </div>

              {/* Berkas Lampiran with Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-stone-700">Berkas Lampiran Persyaratan:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const item = selectedSubForReview;
                      setPreviewSubmission(item);
                      setPreviewInitialIndex(0);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview Dokumen</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {JSON.parse(selectedSubForReview.attachments || '[]').map((att: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => {
                        const item = selectedSubForReview;
                        setPreviewSubmission(item);
                        setPreviewInitialIndex(idx);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50 hover:bg-emerald-50/60 border border-stone-200 hover:border-emerald-300 transition-colors cursor-pointer group text-[11px]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium text-stone-800 truncate group-hover:text-emerald-950">
                          {att.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center gap-1 shrink-0">
                        <Eye className="w-3 h-3" />
                        Preview
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSubForReview.rejectionNote && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  <div className="font-bold mb-0.5">Catatan Penolakan / Revisi:</div>
                  <div>{selectedSubForReview.rejectionNote}</div>
                </div>
              )}

              {selectedSubForReview.suratNumber && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <div className="font-bold mb-0.5">Nomor Surat Resmi Diterbitkan:</div>
                  <div className="font-mono font-bold text-xs">{selectedSubForReview.suratNumber}</div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedSubForReview(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {selectedSubForReview.status === 'menunggu' && (
                  <button
                    onClick={() => {
                      const item = selectedSubForReview;
                      setSelectedSubForReview(null);
                      handleOpenApprove(item);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Setujui & Catat Penduduk
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Approval Confirmation with Official Number */}
      {approvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Persetujuan & Penomoran Surat</h3>
                <p className="text-stone-500">Penerbitan surat resmi kependudukan desa</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="font-bold text-stone-800">{approvingItem.title}</div>
              <div className="text-stone-600">Pemohon: {approvingItem.userName} ({approvingItem.userNik})</div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nomor Surat Resmi Kemendagri / Desa Bojongloa:
              </label>
              <input
                type="text"
                value={customLetterNumber}
                onChange={(e) => setCustomLetterNumber(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Format otomatis sesuai kode jenis arsip dan klasifikasi penomoran Jawa Barat.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                onClick={() => setApprovingItem(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
              >
                Konfirmasi & Terbitkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Rejection with Note */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">Tolak / Minta Revisi Berkas</h3>
                <p className="text-stone-500">Berikan catatan perbaikan kepada warga</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="font-bold text-stone-800">{rejectingItem.title}</div>
              <div className="text-stone-600">Pemohon: {rejectingItem.userName}</div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Alasan Penolakan / Catatan Perbaikan <span className="text-red-500">*</span>:
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Lampiran KTP/KK kurang jelas, mohon upload ulang..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Tolak Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewSubmission}
        onClose={() => setPreviewSubmission(null)}
        submission={previewSubmission}
        initialIndex={previewInitialIndex}
        onApprove={(sub) => handleOpenApprove(sub)}
        onReject={(sub) => {
          setSelectedSubForReview(null);
          setRejectingItem(sub);
        }}
      />
    </div>
  );
};
