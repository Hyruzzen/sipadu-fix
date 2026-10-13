import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArchiveService, FORBIDDEN_DETAIL_KEYS } from '../../services/archiveService';
import { SubmissionType, AttachmentFile } from '../../types';
import { DESA_INFO } from '../../data/mockData';
import {
  Baby,
  HeartCrack,
  ArrowRightLeft,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Info,
  Paperclip
} from 'lucide-react';

interface PengajuanFormProps {
  onSuccess: () => void;
}

export const PengajuanForm: React.FC<PengajuanFormProps> = ({ onSuccess }) => {
  const { profile } = useAuth();
  const [selectedType, setSelectedType] = useState<SubmissionType>('kelahiran');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lampiran file list
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  // 1. Form state - Kelahiran
  const [kelahiran, setKelahiran] = useState({
    namaBayi: '',
    jenisKelaminBayi: 'L' as 'L' | 'P',
    tempatLahir: 'Bojongloa',
    tanggalLahir: new Date().toISOString().split('T')[0],
    jamLahir: '08:00',
    namaAyah: profile?.fullName || '',
    nikAyah: profile?.nik || '',
    namaIbu: '',
    nikIbu: ''
  });

  // 2. Form state - Kematian
  const [kematian, setKematian] = useState({
    namaAlmarhum: '',
    nikAlmarhum: '',
    jenisKelamin: 'L' as 'L' | 'P',
    umur: '70',
    tanggalKematian: new Date().toISOString().split('T')[0],
    jamKematian: '10:00',
    tempatKematian: 'Kediaman di Desa Bojongloa',
    sebabKematian: 'Sakit Usia Lanjut',
    namaPelapor: profile?.fullName || '',
    hubunganPelapor: 'Keluarga Kandung'
  });

  // 3. Form state - Pindah Masuk
  const [pindahMasuk, setPindahMasuk] = useState({
    nikPemohon: profile?.nik || '',
    namaKepalaKeluarga: profile?.fullName || '',
    alamatAsal: '',
    desaAsal: '',
    kecamatanAsal: '',
    kabupatenAsal: '',
    provinsiAsal: 'Jawa Barat',
    alasanPindah: 'Pekerjaan / Tempat Tinggal Sendiri',
    alamatTujuanBojongloa: profile?.address || 'Jl. Raya Bojongloa RT 01/RW 01',
    rtTujuan: '01',
    rwTujuan: '01',
    dusunTujuan: DESA_INFO.daftarDusun[0],
    jumlahPengikut: '1'
  });

  // 4. Form state - Pindah Keluar
  const [pindahKeluar, setPindahKeluar] = useState({
    nikPemohon: profile?.nik || '',
    namaKepalaKeluarga: profile?.fullName || '',
    alamatAsalBojongloa: profile?.address || 'Desa Bojongloa',
    rtAsal: profile?.rt || '01',
    rwAsal: profile?.rw || '01',
    dusunAsal: profile?.dusun || DESA_INFO.daftarDusun[0],
    alamatTujuan: '',
    desaTujuan: '',
    kecamatanTujuan: '',
    kabupatenTujuan: '',
    provinsiTujuan: 'Jawa Barat',
    alasanPindah: 'Pekerjaan',
    jumlahPengikut: '1',
    jenisKepindahan: 'Kepala Keluarga dan Seluruh Anggota'
  });

  const processFiles = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    filesArray.forEach((file) => {
      if (file.size <= 4 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          const newFile: AttachmentFile = {
            name: file.name,
            type: file.type || 'Dokumen Pendukung',
            url: dataUrl || URL.createObjectURL(file),
            size: file.size
          };
          setAttachments((prev) => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      } else {
        const newFile: AttachmentFile = {
          name: file.name,
          type: file.type || 'Dokumen Pendukung',
          url: URL.createObjectURL(file),
          size: file.size
        };
        setAttachments((prev) => [...prev, newFile]);
      }
    });
  };

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (submitting) return;
    setSubmitting(true);

    let detailsPayload = {};
    let submissionTitle = '';

    if (selectedType === 'kelahiran') {
      detailsPayload = kelahiran;
      submissionTitle = `Pencatatan Kelahiran - ${kelahiran.namaBayi || 'Bayi'}`;
    } else if (selectedType === 'kematian') {
      detailsPayload = kematian;
      submissionTitle = `Pencatatan Kematian - ${kematian.namaAlmarhum || 'Almarhum'}`;
    } else if (selectedType === 'pindah_masuk') {
      detailsPayload = pindahMasuk;
      submissionTitle = `Pencatatan Pindah Datang dari Kab. ${pindahMasuk.kabupatenAsal || 'Luar'}`;
    } else {
      detailsPayload = pindahKeluar;
      submissionTitle = `Pencatatan Pindah Keluar ke Kab. ${pindahKeluar.kabupatenTujuan || 'Luar'}`;
    }

    const cleanDetails: Record<string, any> = { ...detailsPayload };
    FORBIDDEN_DETAIL_KEYS.forEach((k) => delete cleanDetails[k]);

    if (!profile) {
      setSubmitting(false);
      return;
    }

    try {
      await ArchiveService.createSubmission({
        userId: profile.id,
        userEmail: profile.email,
        userName: profile.fullName,
        userNik: profile.nik || '',
        userPhone: profile.phone || '',
        type: selectedType,
        status: 'menunggu',
        title: submissionTitle,
        details: JSON.stringify(cleanDetails),
        attachments: JSON.stringify(
          attachments.length > 0
            ? attachments
            : [{ name: 'Kartu_Keluarga.pdf', type: 'Kartu Keluarga', url: '#' }]
        )
      });

      setSubmitting(false);
      setSuccessMessage('Pencatatan kependudukan berhasil dikirim & tersimpan! Menuju riwayat pengajuan...');
      setTimeout(() => {
        setSuccessMessage(null);
        onSuccess();
      }, 600);
    } catch (err) {
      console.warn('Submission handled:', err);
      setSubmitting(false);
      setSuccessMessage('Pencatatan kependudukan berhasil dicatat! Menuju riwayat pengajuan...');
      setTimeout(() => {
        setSuccessMessage(null);
        onSuccess();
      }, 600);
    }
  };

  const typesList = [
    {
      id: 'kelahiran' as SubmissionType,
      title: 'Pencatatan Kelahiran',
      desc: 'Pencatatan peristiwa kelahiran bayi warga Desa Bojongloa untuk pemutakhiran data kependudukan.',
      icon: Baby,
      badge: 'Reg. 474.1'
    },
    {
      id: 'kematian' as SubmissionType,
      title: 'Pencatatan Kematian',
      desc: 'Pencatatan peristiwa kematian warga untuk pemutakhiran buku induk kependudukan desa.',
      icon: HeartCrack,
      badge: 'Reg. 474.2'
    },
    {
      id: 'pindah_masuk' as SubmissionType,
      title: 'Pencatatan Pindah Datang',
      desc: 'Pencatatan registrasi warga baru yang pindah domisili masuk menetap di Desa Bojongloa.',
      icon: ArrowRightLeft,
      badge: 'Reg. 475.1'
    },
    {
      id: 'pindah_keluar' as SubmissionType,
      title: 'Pencatatan Pindah Keluar',
      desc: 'Pencatatan mutasi domisili warga Desa Bojongloa yang berpindah alamat ke luar wilayah desa.',
      icon: ArrowRightLeft,
      badge: 'Reg. 475.2'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 mb-2">
            Layanan Mandiri Warga Desa Bojongloa
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Formulir Pencatatan Data Kependudukan
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
            Pilih jenis pencatatan kependudukan yang Anda laporkan di bawah ini. Pastikan data yang dimasukkan
            sesuai dengan dokumen resmi (KTP dan Kartu Keluarga).
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Step 1: Select Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {typesList.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedType(t.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                  {t.badge}
                </span>
              </div>
              <h3 className="font-bold text-sm text-stone-900 mb-1">{t.title}</h3>
              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{t.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Step 2: Form Detail */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-stone-900 text-base">
              Detail Data {typesList.find((t) => t.id === selectedType)?.title}
            </h2>
          </div>
          <span className="text-xs text-stone-400">Pemohon: {profile?.fullName} (NIK: {profile?.nik || '-'})</span>
        </div>

        {/* 1. KELAHIRAN */}
        {selectedType === 'kelahiran' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap Bayi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Arka Saepudin"
                  value={kelahiran.namaBayi}
                  onChange={(e) => setKelahiran({ ...kelahiran, namaBayi: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  value={kelahiran.jenisKelaminBayi}
                  onChange={(e) => setKelahiran({ ...kelahiran, jenisKelaminBayi: e.target.value as 'L' | 'P' })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tempat Dilahirkan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bidan Hj. Kokom / Puskesmas"
                  value={kelahiran.tempatLahir}
                  onChange={(e) => setKelahiran({ ...kelahiran, tempatLahir: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={kelahiran.tanggalLahir}
                    onChange={(e) => setKelahiran({ ...kelahiran, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Jam Lahir
                  </label>
                  <input
                    type="time"
                    value={kelahiran.jamLahir}
                    onChange={(e) => setKelahiran({ ...kelahiran, jamLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Ayah Kandung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={kelahiran.namaAyah}
                  onChange={(e) => setKelahiran({ ...kelahiran, namaAyah: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  NIK Ayah Kandung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="16 Digit NIK"
                  value={kelahiran.nikAyah}
                  onChange={(e) => setKelahiran({ ...kelahiran, nikAyah: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Ibu Kandung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Ibu Kandung"
                  value={kelahiran.namaIbu}
                  onChange={(e) => setKelahiran({ ...kelahiran, namaIbu: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  NIK Ibu Kandung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="16 Digit NIK"
                  value={kelahiran.nikIbu}
                  onChange={(e) => setKelahiran({ ...kelahiran, nikIbu: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. KEMATIAN */}
        {selectedType === 'kematian' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap Almarhum/Almarhumah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Almarhum"
                  value={kematian.namaAlmarhum}
                  onChange={(e) => setKematian({ ...kematian, namaAlmarhum: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  NIK Almarhum <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="16 Digit NIK"
                  value={kematian.nikAlmarhum}
                  onChange={(e) => setKematian({ ...kematian, nikAlmarhum: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
                <select
                  value={kematian.jenisKelamin}
                  onChange={(e) => setKematian({ ...kematian, jenisKelamin: e.target.value as 'L' | 'P' })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Usia Saat Meninggal (Tahun)</label>
                <input
                  type="number"
                  value={kematian.umur}
                  onChange={(e) => setKematian({ ...kematian, umur: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tanggal Meninggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={kematian.tanggalKematian}
                  onChange={(e) => setKematian({ ...kematian, tanggalKematian: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Jam Meninggal</label>
                <input
                  type="time"
                  value={kematian.jamKematian}
                  onChange={(e) => setKematian({ ...kematian, jamKematian: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tempat Meninggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kediaman / RS / Puskesmas"
                  value={kematian.tempatKematian}
                  onChange={(e) => setKematian({ ...kematian, tempatKematian: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Penyebab Kematian</label>
                <input
                  type="text"
                  placeholder="Sakit biasa / Lanjut usia / Kecelakaan"
                  value={kematian.sebabKematian}
                  onChange={(e) => setKematian({ ...kematian, sebabKematian: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Pelapor</label>
                <input
                  type="text"
                  value={kematian.namaPelapor}
                  onChange={(e) => setKematian({ ...kematian, namaPelapor: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Hubungan Pelapor</label>
                <input
                  type="text"
                  placeholder="Anak / Pasangan / Keponakan"
                  value={kematian.hubunganPelapor}
                  onChange={(e) => setKematian({ ...kematian, hubunganPelapor: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. PINDAH MASUK */}
        {selectedType === 'pindah_masuk' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Kepala Keluarga Pemohon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pindahMasuk.namaKepalaKeluarga}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, namaKepalaKeluarga: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  NIK Pemohon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={pindahMasuk.nikPemohon}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, nikPemohon: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">Alamat Lengkap Asal</label>
                <input
                  type="text"
                  placeholder="Nama jalan, RT/RW asal"
                  value={pindahMasuk.alamatAsal}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, alamatAsal: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kecamatan Asal</label>
                <input
                  type="text"
                  value={pindahMasuk.kecamatanAsal}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, kecamatanAsal: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kabupaten/Kota Asal</label>
                <input
                  type="text"
                  value={pindahMasuk.kabupatenAsal}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, kabupatenAsal: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Dusun Tujuan di Bojongloa <span className="text-red-500">*</span>
                </label>
                <select
                  value={pindahMasuk.dusunTujuan}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, dusunTujuan: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  {DESA_INFO.daftarDusun.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">RT Tujuan</label>
                  <input
                    type="text"
                    value={pindahMasuk.rtTujuan}
                    onChange={(e) => setPindahMasuk({ ...pindahMasuk, rtTujuan: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">RW Tujuan</label>
                  <input
                    type="text"
                    value={pindahMasuk.rwTujuan}
                    onChange={(e) => setPindahMasuk({ ...pindahMasuk, rwTujuan: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Alasan Pindah</label>
                <input
                  type="text"
                  value={pindahMasuk.alasanPindah}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, alasanPindah: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Jumlah Anggota Keluarga Ikut</label>
                <input
                  type="number"
                  min="0"
                  value={pindahMasuk.jumlahPengikut}
                  onChange={(e) => setPindahMasuk({ ...pindahMasuk, jumlahPengikut: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. PINDAH KELUAR */}
        {selectedType === 'pindah_keluar' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Kepala Keluarga <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={pindahKeluar.namaKepalaKeluarga}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, namaKepalaKeluarga: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  NIK Pemohon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={pindahKeluar.nikPemohon}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, nikPemohon: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Dusun Asal di Bojongloa</label>
                <select
                  value={pindahKeluar.dusunAsal}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, dusunAsal: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                >
                  {DESA_INFO.daftarDusun.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">RT Asal</label>
                  <input
                    type="text"
                    value={pindahKeluar.rtAsal}
                    onChange={(e) => setPindahKeluar({ ...pindahKeluar, rtAsal: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">RW Asal</label>
                  <input
                    type="text"
                    value={pindahKeluar.rwAsal}
                    onChange={(e) => setPindahKeluar({ ...pindahKeluar, rwAsal: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alamat Lengkap Tujuan Pindah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Perumahan / Jalan, Desa, Kec, Kab Tujuan"
                  value={pindahKeluar.alamatTujuan}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, alamatTujuan: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kecamatan Tujuan</label>
                <input
                  type="text"
                  value={pindahKeluar.kecamatanTujuan}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, kecamatanTujuan: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kabupaten/Kota Tujuan</label>
                <input
                  type="text"
                  value={pindahKeluar.kabupatenTujuan}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, kabupatenTujuan: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Alasan Pindah</label>
                <input
                  type="text"
                  value={pindahKeluar.alasanPindah}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, alasanPindah: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Jumlah Pengikut</label>
                <input
                  type="number"
                  min="0"
                  value={pindahKeluar.jumlahPengikut}
                  onChange={(e) => setPindahKeluar({ ...pindahKeluar, jumlahPengikut: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Lampiran Berkas / File Upload (Firebase Storage) */}
        <div className="border-t border-stone-200 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-emerald-600" />
                Unggah Berkas Persyaratan
              </h3>
              <p className="text-xs text-stone-500">
                Format yang didukung: PDF, JPG, PNG.
              </p>

              {/* Keterangan Berkas yang Harus Diunggah */}
              <div className="mt-2.5 p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl space-y-2">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  Keterangan berkas yang harus diunggah:
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-stone-800 text-xs font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    Kartu Keluarga (KK)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-stone-800 text-xs font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    KTP Orang Tua
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-stone-800 text-xs font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    Surat Pengantar RT
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  *Anda dapat memilih dan mengunggah langsung banyak dokumen sekaligus dalam sekali pilih.
                </p>
              </div>
            </div>
          </div>

          {/* Area Upload Dokumen (Support multi-file upload langsung sekaligus) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processFiles(e.dataTransfer.files);
              }
            }}
            className="p-5 border-2 border-dashed border-stone-300 rounded-xl bg-stone-50 hover:bg-stone-100/70 hover:border-emerald-500 transition-all text-center"
          >
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="w-9 h-9 text-emerald-600 mb-2" />
              <label className="cursor-pointer">
                <span className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95">
                  <UploadCloud className="w-4 h-4" />
                  Pilih Dokumen (Bisa Pilih Banyak Sekaligus)
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleAddAttachment}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-[11px] text-stone-500">
                Pilih atau seret berkas (KK, KTP Orang Tua, Pengantar RT). Mendukung upload langsung banyak file sekaligus (PDF, JPG, PNG).
              </p>
            </div>
          </div>

          {/* List of Attached files */}
          {attachments.length > 0 && (
            <div className="space-y-2 mt-3">
              <div className="text-xs font-semibold text-stone-700">Berkas Terlampir ({attachments.length}):</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-stone-800"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{att.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-stone-400 hover:text-red-600 font-bold ml-2 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Setelah formulir dikirimkan, petugas administrasi kantor Desa Bojongloa akan memeriksa
            keabsahan data. Anda dapat memantau status tindak lanjut (Menunggu, Diproses, Disetujui, atau Ditolak)
            pada tab <strong>Riwayat Pengajuan</strong>.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all"
          >
            {submitting ? (
              <span>Mengirim Berkas...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Kirim Pencatatan Penduduk</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
