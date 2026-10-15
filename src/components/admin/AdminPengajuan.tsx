import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArchiveService, FORBIDDEN_DETAIL_KEYS } from '../../services/archiveService';
import { Submission, SubmissionStatus, SubmissionType, Resident } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Check,
  X,
  ChevronDown,
  Paperclip,
  User,
  Building,
  RotateCw,
  Eye
} from 'lucide-react';
import { DocumentPreviewModal } from './DocumentPreviewModal';

export const AdminPengajuan: React.FC = () => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('menunggu');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Rejection Modal State
  const [rejectingItem, setRejectingItem] = useState<Submission | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  // Approval Modal State
  const [approvingItem, setApprovingItem] = useState<Submission | null>(null);
  const [customLetterNumber, setCustomLetterNumber] = useState('');
  const [syncToMasterResident, setSyncToMasterResident] = useState(true);

  // Review / Inspection Modal
  const [inspectingItem, setInspectingItem] = useState<Submission | null>(null);

  // Document Preview Modal State
  const [previewSubmission, setPreviewSubmission] = useState<Submission | null>(null);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = ArchiveService.listenSubmissions(undefined, 'admin', (data) => {
      setSubmissions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesType = typeFilter === 'all' || sub.type === typeFilter;
    const matchesSearch =
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userNik.includes(searchQuery) ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.suratNumber && sub.suratNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Handle Mark "Diproses"
  const handleSetDiproses = async (sub: Submission) => {
    await ArchiveService.updateSubmissionStatus(
      sub.id,
      'diproses',
      profile?.fullName || 'Petugas Administrasi Desa'
    );
  };

  // Open Approval Confirmation
  const openApprovalModal = async (sub: Submission) => {
    const generatedNumber = await ArchiveService.generateNomorRegistrasi(
      sub.type,
      submissions.filter((s) => s.status === 'disetujui').length + 1
    );
    setCustomLetterNumber(generatedNumber);
    setApprovingItem(sub);
  };

  // Confirm Approval Action
  const handleConfirmApproval = async () => {
    if (!approvingItem) return;

    await ArchiveService.updateSubmissionStatus(
      approvingItem.id,
      'disetujui',
      profile?.fullName || 'Petugas Administrasi Desa',
      undefined,
      customLetterNumber
    );

    // Sync to Master Data Penduduk if enabled
    if (syncToMasterResident) {
      try {
        let details: any = {};
        try {
          details = JSON.parse(approvingItem.details || '{}');
        } catch {
          details = {};
        }

        const now = new Date().toISOString();

        if (approvingItem.type === 'kelahiran' && details.namaBayi) {
          const newResident: Resident = {
            id: 'res-' + Date.now(),
            nik: '320412' + Math.floor(1000000000 + Math.random() * 9000000000),
            noKk: details.noKk || '3204120101180001',
            fullName: details.namaBayi,
            gender: details.jenisKelaminBayi || 'L',
            birthPlace: details.tempatLahir || 'Bojongloa',
            birthDate: details.tanggalLahir || now.split('T')[0],
            religion: 'Islam',
            maritalStatus: 'Belum Kawin',
            occupation: 'Belum/Tidak Bekerja',
            dusun: 'Dusun Babakan',
            rt: '01',
            rw: '01',
            address: 'Desa Bojongloa',
            status: 'aktif',
            createdAt: now,
            updatedAt: now
          };
          await ArchiveService.saveResident(newResident);
        } else if (approvingItem.type === 'kematian' && details.nikAlmarhum) {
          const allResidents = await ArchiveService.getResidents();
          const target = allResidents.find((r) => r.nik === details.nikAlmarhum);
          if (target) {
            await ArchiveService.saveResident({
              ...target,
              status: 'meninggal',
              updatedAt: now
            });
          }
        } else if (approvingItem.type === 'pindah_masuk' && details.namaKepalaKeluarga) {
          const newResident: Resident = {
            id: 'res-' + Date.now(),
            nik: details.nikPemohon || '320412' + Math.floor(1000000000 + Math.random() * 9000000000),
            noKk: '32041201' + Math.floor(10000000 + Math.random() * 90000000),
            fullName: details.namaKepalaKeluarga,
            gender: 'L',
            birthPlace: details.kabupatenAsal || 'Luar Kota',
            birthDate: '1985-01-01',
            religion: 'Islam',
            maritalStatus: 'Kawin',
            occupation: 'Wiraswasta',
            dusun: details.dusunTujuan || 'Dusun Bojongloa Pusat',
            rt: details.rtTujuan || '01',
            rw: details.rwTujuan || '01',
            address: details.alamatTujuanBojongloa || 'Desa Bojongloa',
            status: 'aktif',
            createdAt: now,
            updatedAt: now
          };
          await ArchiveService.saveResident(newResident);
        } else if (approvingItem.type === 'pindah_keluar' && details.nikPemohon) {
          const allResidents = await ArchiveService.getResidents();
          const target = allResidents.find((r) => r.nik === details.nikPemohon);
          if (target) {
            await ArchiveService.saveResident({
              ...target,
              status: 'pindah_keluar',
              updatedAt: now
            });
          }
        }
      } catch (err) {
        console.warn('Sync error:', err);
      }
    }

    setApprovingItem(null);
  };

  // Open Rejection Dialog
  const openRejectionModal = (sub: Submission) => {
    setRejectingItem(sub);
    setRejectionNote('');
    setRejectionError('');
  };

  // Confirm Rejection Action (MANDATORY NOTE VALIDATION)
  const handleConfirmRejection = async () => {
    if (!rejectionNote.trim()) {
      setRejectionError('Wajib mengisi catatan alasan penolakan agar warga mengetahui kekurangan berkas!');
      return;
    }

    if (!rejectingItem) return;

    await ArchiveService.updateSubmissionStatus(
      rejectingItem.id,
      'ditolak',
      profile?.fullName || 'Petugas Administrasi Desa',
      rejectionNote.trim()
    );

    setRejectingItem(null);
    setRejectionNote('');
    setRejectionError('');
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'disetujui':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'ditolak':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'diproses':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Kelola & Verifikasi Pengajuan Arsip
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Periksa keabsahan berkas permohonan kependudukan warga. Tindak lanjuti dengan menyetujui atau
            menolak (wajib melampirkan catatan alasan penolakan).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          {[
            { id: 'menunggu', label: 'Menunggu' },
            { id: 'diproses', label: 'Diproses' },
            { id: 'disetujui', label: 'Disetujui' },
            { id: 'ditolak', label: 'Ditolak' },
            { id: 'all', label: 'Semua Status' }
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

          {/* Type Filter Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 focus:outline-hidden"
          >
            <option value="all">Semua Jenis Surat</option>
            <option value="kelahiran">Kelahiran (474.1)</option>
            <option value="kematian">Kematian (474.2)</option>
            <option value="pindah_masuk">Pindah Masuk (475.1)</option>
            <option value="pindah_keluar">Pindah Keluar (475.2)</option>
          </select>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIK, atau no surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table of Submissions */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">
            <RotateCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-sm">Memuat data pengajuan warga...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">Tidak ada pengajuan ditemukan</p>
            <p className="text-xs text-stone-400">Silakan ubah filter atau pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Pemohon (Warga)</th>
                  <th className="p-3.5">Jenis & Judul Permohonan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Nomor Surat / Catatan</th>
                  <th className="p-3.5 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSubmissions.map((sub) => {
                  const dateStr = new Date(sub.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={sub.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 text-stone-500 whitespace-nowrap">{dateStr}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-stone-900">{sub.userName}</div>
                        <div className="text-[11px] text-stone-500 font-mono">NIK: {sub.userNik}</div>
                        <div className="text-[10px] text-stone-400">{sub.userEmail}</div>
                      </td>
                      <td className="p-3.5 max-w-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 block w-fit mb-1">
                          {sub.type.replace('_', ' ')}
                        </span>
                        <div className="font-semibold text-stone-800 truncate" title={sub.title}>
                          {sub.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <button
                            onClick={() => {
                              setPreviewSubmission(sub);
                              setPreviewInitialIndex(0);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition-colors shadow-2xs"
                            title="Pratinjau Berkas Lampiran Pemohon"
                          >
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>
                              Preview Dokumen (
                              {(() => {
                                try {
                                  return JSON.parse(sub.attachments || '[]').length;
                                } catch {
                                  return 0;
                                }
                              })()}
                              )
                            </span>
                          </button>
                          <span className="text-stone-300">•</span>
                          <button
                            onClick={() => setInspectingItem(sub)}
                            className="text-[10px] text-stone-500 hover:text-emerald-700 hover:underline font-medium"
                          >
                            Rincian Data
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs text-stone-600">
                        {sub.status === 'disetujui' && (
                          <div className="font-mono text-emerald-800 font-bold text-[11px]">
                            {sub.suratNumber || '-'}
                          </div>
                        )}
                        {sub.status === 'ditolak' && (
                          <div className="text-red-700 text-[11px] bg-red-50 p-2 rounded-lg border border-red-100">
                            <strong>Catatan:</strong> {sub.rejectionNote}
                          </div>
                        )}
                        {sub.status === 'menunggu' && (
                          <span className="text-stone-400 italic">Belum diverifikasi</span>
                        )}
                        {sub.status === 'diproses' && (
                          <span className="text-blue-600 font-medium">Sedang diteliti</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If Pending or In-process */}
                          {sub.status === 'menunggu' && (
                            <button
                              onClick={() => handleSetDiproses(sub)}
                              title="Tandai Sedang Diproses"
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                            >
                              Proses
                            </button>
                          )}

                          {/* Action Setujui */}
                          {sub.status !== 'disetujui' && (
                            <button
                              onClick={() => openApprovalModal(sub)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                          )}

                          {/* Action Tolak */}
                          {sub.status !== 'ditolak' && (
                            <button
                              onClick={() => openRejectionModal(sub)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: INSPECT DETAILS */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base">{inspectingItem.title}</h3>
                <p className="text-xs text-stone-500 font-mono">
                  Ref: {inspectingItem.id} | Pemohon: {inspectingItem.userName}
                </p>
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="text-stone-400 hover:text-stone-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-stone-800 mb-2">Parameter Data Formulir:</h4>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5">
                  {Object.entries(JSON.parse(inspectingItem.details || '{}'))
                    .filter(([k, v]) => !FORBIDDEN_DETAIL_KEYS.includes(k) && v !== '' && v !== null && v !== undefined)
                    .map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-2 py-0.5 border-b border-stone-100 last:border-0">
                      <span className="font-semibold text-stone-600 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="col-span-2 text-stone-900 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-stone-800">Berkas Lampiran Persyaratan:</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSubmission(inspectingItem);
                      setPreviewInitialIndex(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Semua Berkas</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {JSON.parse(inspectingItem.attachments || '[]').map((att: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setPreviewSubmission(inspectingItem);
                        setPreviewInitialIndex(idx);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-300 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium text-stone-800 truncate group-hover:text-emerald-950">
                          {att.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                          {att.type || 'Dokumen'}
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Preview
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {inspectingItem.rejectionNote && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
                  <div className="font-bold">Catatan Penolakan Sebelumnya:</div>
                  <div>"{inspectingItem.rejectionNote}"</div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <div className="flex gap-2">
                {inspectingItem.status !== 'disetujui' && (
                  <button
                    onClick={() => {
                      const item = inspectingItem;
                      setInspectingItem(null);
                      openApprovalModal(item);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Setujui Permohonan
                  </button>
                )}
                {inspectingItem.status !== 'ditolak' && (
                  <button
                    onClick={() => {
                      const item = inspectingItem;
                      setInspectingItem(null);
                      openRejectionModal(item);
                    }}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Tolak Permohonan
                  </button>
                )}
              </div>
              <button
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MANDATORY REJECTION NOTE MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Tolak Pengajuan Surat</h3>
                <p className="text-xs text-stone-500">
                  Pemohon: <strong>{rejectingItem.userName}</strong> ({rejectingItem.title})
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold block mb-1">Ketentuan Sistem:</span>
                Sesuai SOP, admin <strong>wajib menyertakan catatan penolakan</strong> yang jelas agar
                warga mengetahui dokumen apa yang kurang atau salah untuk diperbaiki.
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Catatan Alasan Penolakan <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Contoh: Lampiran Kartu Keluarga buram / Surat Pengantar RT setempat belum ditandatangani Ketua RT / Mohon lengkapi formulir F-1.08..."
                  value={rejectionNote}
                  onChange={(e) => {
                    setRejectionNote(e.target.value);
                    if (rejectionError) setRejectionError('');
                  }}
                  className="w-full p-3 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                />
                {rejectionError && (
                  <p className="text-red-600 text-xs mt-1 font-semibold">{rejectionError}</p>
                )}
              </div>

              {/* Quick Template suggestions */}
              <div>
                <span className="text-[11px] text-stone-500 font-medium">Pilihan Cepat Catatan:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setRejectionNote(
                        'Lampiran dokumen Kartu Keluarga tidak terbaca/buram. Silakan unggah ulang foto dokumen yang jelas.'
                      )
                    }
                    className="text-[10px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700"
                  >
                    Foto KK Buram
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRejectionNote(
                        'Belum melampirkan Surat Pengantar dari RT/RW setempat. Mohon minta tanda tangan Ketua RT/RW terlebih dahulu.'
                      )
                    }
                    className="text-[10px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700"
                  >
                    Kurang Pengantar RT/RW
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRejectionNote(
                        'Data NIK atau Nama yang dicantumkan tidak sesuai dengan data kependudukan resmi di database desa.'
                      )
                    }
                    className="text-[10px] px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700"
                  >
                    NIK Tidak Sesuai
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Konfirmasi Penolakan Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: APPROVAL CONFIRMATION MODAL */}
      {approvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Setujui & Catat Pengarsipan Penduduk</h3>
                <p className="text-xs text-stone-500">
                  Pemohon: <strong>{approvingItem.userName}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Nomor Registrasi Pengarsipan Kependudukan:
                </label>
                <input
                  type="text"
                  value={customLetterNumber}
                  onChange={(e) => setCustomLetterNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Format otomatis: Klasifikasi / No Urut / Desa-BJL / Bulan Romawi / Tahun
                </p>
              </div>

              {/* Quick Document Preview inside Approval Modal */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-stone-800 text-xs">
                      Dokumen Lampiran (
                      {(() => {
                        try {
                          return JSON.parse(approvingItem.attachments || '[]').length;
                        } catch {
                          return 0;
                        }
                      })()}{' '}
                      berkas)
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Periksa keaslian dokumen sebelum menerbitkan nomor register
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewSubmission(approvingItem);
                    setPreviewInitialIndex(0);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-emerald-500 hover:text-emerald-700 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Preview Dokumen</span>
                </button>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncToMasterResident}
                  onChange={(e) => setSyncToMasterResident(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                />
                <div>
                  <span className="font-bold text-emerald-950 block">
                    Sinkronisasi Otomatis ke Master Data Penduduk
                  </span>
                  <span className="text-emerald-800 text-[11px]">
                    Jika dicentang, sistem akan langsung memperbarui status penduduk (kelahiran dimasukkan sebagai penduduk baru, kematian dicoret/meninggal, atau mutasi pindah).
                  </span>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setApprovingItem(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Setujui & Terbitkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={!!previewSubmission}
        onClose={() => setPreviewSubmission(null)}
        submission={previewSubmission}
        initialIndex={previewInitialIndex}
        onApprove={(sub) => openApprovalModal(sub)}
        onReject={(sub) => openRejectionModal(sub)}
      />
    </div>
  );
};
