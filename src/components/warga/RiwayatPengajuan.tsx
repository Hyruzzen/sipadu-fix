import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArchiveService, FORBIDDEN_DETAIL_KEYS } from '../../services/archiveService';
import { Submission, SubmissionStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Search,
  ChevronRight,
  Info
} from 'lucide-react';

export const RiwayatPengajuan: React.FC = () => {
  const { profile, role } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalItem, setDetailModalItem] = useState<Submission | null>(null);

  useEffect(() => {
    // Listen to submissions for this warga
    const unsubscribe = ArchiveService.listenSubmissions(
      profile?.id,
      role || undefined,
      (data) => {
        setSubmissions(data);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [profile?.id, role]);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesSearch =
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.suratNumber && sub.suratNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sub.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'disetujui':
        return {
          label: 'Disetujui',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
          color: 'text-emerald-600'
        };
      case 'ditolak':
        return {
          label: 'Ditolak (Perlu Revisi)',
          bg: 'bg-red-50 text-red-800 border-red-200',
          icon: XCircle,
          color: 'text-red-600'
        };
      case 'diproses':
        return {
          label: 'Sedang Diproses',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: Clock,
          color: 'text-blue-600'
        };
      default:
        return {
          label: 'Menunggu Verifikasi',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertTriangle,
          color: 'text-amber-600'
        };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'kelahiran':
        return 'Pencatatan Kelahiran';
      case 'kematian':
        return 'Pencatatan Kematian';
      case 'pindah_masuk':
        return 'Pencatatan Pindah Datang';
      case 'pindah_keluar':
        return 'Pencatatan Pindah Keluar';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Riwayat Pencatatan Kependudukan
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Pantau status verifikasi dan pencatatan peristiwa kependudukan Anda di Kantor Desa Bojongloa.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'all', label: 'Semua Berkas' },
            { id: 'menunggu', label: 'Menunggu' },
            { id: 'diproses', label: 'Diproses' },
            { id: 'disetujui', label: 'Disetujui' },
            { id: 'ditolak', label: 'Ditolak' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari pencatatan atau nomor registrasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 bg-white rounded-xl border border-stone-200">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-sm">Memuat riwayat pengajuan arsip...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 mb-1">Belum Ada Pengajuan</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {statusFilter !== 'all'
              ? `Tidak ditemukan pencatatan dengan status "${statusFilter}".`
              : 'Anda belum pernah mengirimkan pencatatan kependudukan. Klik tab "Pencatatan Kependudukan" untuk membuat pelaporan baru.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const badge = getStatusBadge(sub.status);
            const BadgeIcon = badge.icon;
            const dateStr = new Date(sub.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={sub.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
                  sub.status === 'ditolak'
                    ? 'border-red-200 bg-red-50/10'
                    : sub.status === 'disetujui'
                    ? 'border-emerald-200'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {getTypeLabel(sub.type)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                      {sub.suratNumber && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                          No: {sub.suratNumber}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-stone-900 text-base">{sub.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span>Ref ID: <strong className="font-mono">{sub.id}</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => setDetailModalItem(sub)}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1 transition-colors"
                    >
                      <span>Lihat Rincian</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CRITICAL FEATURE: PROMINENT REJECTION NOTE */}
                {sub.status === 'ditolak' && (
                  <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-red-900 flex items-center gap-1.5">
                        <span>Catatan Penolakan dari Admin Desa:</span>
                      </div>
                      <p className="text-red-800 leading-relaxed font-medium">
                        "{sub.rejectionNote || 'Persyaratan administrasi belum terpenuhi. Silakan ajukan ulang dengan berkas lengkap.'}"
                      </p>
                      <div className="text-[11px] text-red-700/80 italic">
                        Diverifikasi oleh: {sub.approvedBy || 'Petugas Administrasi Desa Bojongloa'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Notice */}
                {sub.status === 'disetujui' && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Data kependudukan telah diverifikasi & dicatat ke database kependudukan oleh <strong>{sub.approvedBy || 'Petugas Administrasi Desa Bojongloa'}</strong>.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-stone-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">{detailModalItem.title}</h3>
                <span className="text-xs text-stone-500 font-mono">ID: {detailModalItem.id}</span>
              </div>
              <button
                onClick={() => setDetailModalItem(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl space-y-1.5 border border-stone-200">
                <div className="font-bold text-stone-800">Status Permohonan:</div>
                <div className="capitalize font-semibold">{detailModalItem.status}</div>
                {detailModalItem.rejectionNote && (
                  <div className="text-red-700 pt-1 border-t border-stone-200 mt-2">
                    <strong>Catatan Penolakan:</strong> {detailModalItem.rejectionNote}
                  </div>
                )}
                {detailModalItem.suratNumber && (
                  <div className="text-emerald-700 pt-1 border-t border-stone-200 mt-2">
                    <strong>Nomor Registrasi Surat:</strong> {detailModalItem.suratNumber}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-stone-800 mb-1">Rincian Data Formulir:</h4>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                  {Object.entries(JSON.parse(detailModalItem.details || '{}'))
                    .filter(([k, v]) => !FORBIDDEN_DETAIL_KEYS.includes(k) && v !== '' && v !== null && v !== undefined)
                    .map(([k, v]) => {
                      const labelsMap: Record<string, string> = {
                        namaBayi: 'Nama Lengkap Bayi',
                        jenisKelaminBayi: 'Jenis Kelamin',
                        tempatLahir: 'Tempat Lahir',
                        tanggalLahir: 'Tanggal Lahir',
                        jamLahir: 'Jam Lahir',
                        namaAyah: 'Nama Ayah Kandung',
                        nikAyah: 'NIK Ayah',
                        namaIbu: 'Nama Ibu Kandung',
                        nikIbu: 'NIK Ibu',
                        namaAlmarhum: 'Nama Almarhum/ah',
                        nikAlmarhum: 'NIK Almarhum/ah',
                        tanggalKematian: 'Tanggal Kematian',
                        jamKematian: 'Jam Kematian',
                        tempatKematian: 'Tempat Kematian',
                        sebabKematian: 'Penyebab Kematian',
                        namaPelapor: 'Nama Pelapor',
                        hubunganPelapor: 'Hubungan Pelapor',
                        nikPemohon: 'NIK Pemohon',
                        namaKepalaKeluarga: 'Kepala Keluarga',
                        alamatAsal: 'Alamat Asal',
                        desaAsal: 'Desa Asal',
                        kecamatanAsal: 'Kecamatan Asal',
                        kabupatenAsal: 'Kabupaten Asal',
                        provinsiAsal: 'Provinsi Asal',
                        alasanPindah: 'Alasan Kepindahan',
                        alamatTujuanBojongloa: 'Alamat Tujuan',
                        dusunTujuan: 'Dusun Tujuan',
                        rtTujuan: 'RT Tujuan',
                        rwTujuan: 'RW Tujuan',
                        alamatAsalBojongloa: 'Alamat Asal',
                        dusunAsal: 'Dusun Asal',
                        rtAsal: 'RT Asal',
                        rwAsal: 'RW Asal',
                        alamatTujuan: 'Alamat Tujuan',
                        desaTujuan: 'Desa Tujuan',
                        kecamatanTujuan: 'Kecamatan Tujuan',
                        kabupatenTujuan: 'Kabupaten Tujuan',
                        provinsiTujuan: 'Provinsi Tujuan',
                        jumlahPengikut: 'Jumlah Pengikut',
                        jenisKepindahan: 'Jenis Kepindahan'
                      };
                      const displayLabel = labelsMap[k] || k.replace(/([A-Z])/g, ' $1');
                      const displayVal = (k === 'jenisKelaminBayi' || k === 'jenisKelamin') && (v === 'L' || v === 'P')
                        ? (v === 'L' ? 'Laki-laki' : 'Perempuan')
                        : String(v);

                      return (
                        <div key={k} className="grid grid-cols-3 gap-2 py-1 border-b border-stone-100 last:border-0">
                          <span className="font-semibold text-stone-600">{displayLabel}:</span>
                          <span className="col-span-2 text-stone-900 font-medium">{displayVal}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-800 mb-1">Berkas Lampiran:</h4>
                <div className="space-y-1">
                  {JSON.parse(detailModalItem.attachments || '[]').map((att: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded bg-stone-100 text-stone-700">
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span className="font-medium">{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setDetailModalItem(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
