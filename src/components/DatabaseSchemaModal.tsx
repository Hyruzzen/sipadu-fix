import React, { useState } from 'react';
import { X, Database, Shield, Server, FileText, Users, HardDrive, Check, Copy } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'collections' | 'rules' | 'architecture'>('collections');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyBlueprintJson = () => {
    navigator.clipboard.writeText(JSON.stringify(blueprintData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const blueprintData = {
    collections: {
      users: {
        path: '/users/{userId}',
        description: 'Menyimpan identitas warga, nomor NIK, No KK, Dusun, RT/RW, dan role akun.',
        fields: [
          { name: 'id', type: 'string', required: true, desc: 'Firebase Auth UID' },
          { name: 'email', type: 'string', required: true, desc: 'Email aktif pengguna' },
          { name: 'fullName', type: 'string', required: true, desc: 'Nama lengkap sesuai KTP' },
          { name: 'role', type: "'warga' | 'admin' | 'kades'", required: true, desc: 'Peran pengguna dalam sistem' },
          { name: 'nik', type: 'string(16)', required: false, desc: 'Nomor Induk Kependudukan (16 digit)' },
          { name: 'noKk', type: 'string(16)', required: false, desc: 'Nomor Kartu Keluarga (16 digit)' },
          { name: 'phone', type: 'string', required: false, desc: 'Nomor WhatsApp/HP' },
          { name: 'address', type: 'string', required: false, desc: 'Alamat tempat tinggal' },
          { name: 'rt', type: 'string', required: false, desc: 'Nomor RT (01-05)' },
          { name: 'rw', type: 'string', required: false, desc: 'Nomor RW (01-05)' },
          { name: 'dusun', type: 'string', required: false, desc: 'Nama Dusun di Desa Bojongloa' },
          { name: 'createdAt', type: 'timestamp', required: true, desc: 'Waktu pembuatan akun' }
        ]
      },
      submissions: {
        path: '/submissions/{submissionId}',
        description: 'Menampung berkas pengajuan pencatatan data kependudukan warga (Kelahiran, Kematian, Pindah Masuk, Pindah Keluar) beserta bukti lampiran persyaratan.',
        fields: [
          { name: 'id', type: 'string', required: true, desc: 'ID unik pengajuan' },
          { name: 'userId', type: 'string', required: true, desc: 'UID pemohon (Foreign Key -> users.id)' },
          { name: 'userEmail', type: 'string', required: true, desc: 'Email pemohon' },
          { name: 'userName', type: 'string', required: true, desc: 'Nama warga pemohon' },
          { name: 'userNik', type: 'string', required: true, desc: 'NIK warga pemohon' },
          { name: 'type', type: "'kelahiran' | 'kematian' | 'pindah_masuk' | 'pindah_keluar'", required: true, desc: 'Jenis pengarsipan kependudukan' },
          { name: 'status', type: "'menunggu' | 'diproses' | 'disetujui' | 'ditolak'", required: true, desc: 'Status verifikasi pengajuan' },
          { name: 'title', type: 'string', required: true, desc: 'Judul ringkas pengajuan' },
          { name: 'details', type: 'JSON string', required: true, desc: 'Parameter detail formulir data kependudukan' },
          { name: 'attachments', type: 'JSON string', required: true, desc: 'Daftar lampiran berkas persyaratan (KTP, KK, Surat RS/RT)' },
          { name: 'rejectionNote', type: 'string', required: false, desc: 'Catatan wajib jika pengajuan ditolak oleh admin' },
          { name: 'nomorRegistrasi', type: 'string', required: false, desc: 'Nomor registrasi arsip resmi desa jika disetujui (e.g. REG-474.1/042/ARSIP-BJL/IX/2026)' },
          { name: 'approvedBy', type: 'string', required: false, desc: 'Nama staf/admin yang memverifikasi' },
          { name: 'approvedAt', type: 'timestamp', required: false, desc: 'Waktu persetujuan/penolakan' },
          { name: 'createdAt', type: 'timestamp', required: true, desc: 'Waktu pengajuan dikirim warga' }
        ]
      },
      residents: {
        path: '/residents/{residentId}',
        description: 'Master data kependudukan resmi Desa Bojongloa untuk administrasi kependudukan & mutasi.',
        fields: [
          { name: 'id', type: 'string', required: true, desc: 'ID unik rekaman penduduk' },
          { name: 'nik', type: 'string(16)', required: true, desc: 'NIK Penduduk (Unique)' },
          { name: 'noKk', type: 'string(16)', required: true, desc: 'Nomor KK keluarga' },
          { name: 'fullName', type: 'string', required: true, desc: 'Nama lengkap penduduk' },
          { name: 'gender', type: "'L' | 'P'", required: true, desc: 'Jenis Kelamin' },
          { name: 'birthPlace', type: 'string', required: true, desc: 'Tempat lahir' },
          { name: 'birthDate', type: 'string', required: true, desc: 'Tanggal lahir (YYYY-MM-DD)' },
          { name: 'religion', type: 'string', required: true, desc: 'Agama' },
          { name: 'maritalStatus', type: 'string', required: true, desc: 'Status Perkawinan' },
          { name: 'occupation', type: 'string', required: true, desc: 'Pekerjaan' },
          { name: 'dusun', type: 'string', required: true, desc: 'Dusun tempat tinggal di Bojongloa' },
          { name: 'rt', type: 'string', required: true, desc: 'RT' },
          { name: 'rw', type: 'string', required: true, desc: 'RW' },
          { name: 'status', type: "'aktif' | 'meninggal' | 'pindah_keluar' | 'warga_baru'", required: true, desc: 'Status kependudukan dalam arsip desa' }
        ]
      },
      admins: {
        path: '/admins/{adminId}',
        description: 'Daftar user UID dengan hak akses administratif desa untuk Firestore Security Rules ABAC.',
        fields: [
          { name: 'userId', type: 'string', required: true, desc: 'Firebase Auth UID yang memiliki wewenang Admin' },
          { name: 'email', type: 'string', required: true, desc: 'Email staf/admin desa' },
          { name: 'role', type: "'admin' | 'kades'", required: true, desc: 'Tingkat wewenang admin' }
        ]
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Rancangan Skema Database & Arsitektur Sistem
              </h2>
              <p className="text-xs text-stone-500">
                Sistem Pengarsipan Data Penduduk Desa Bojongloa (Firebase Firestore + Auth + Storage)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyBlueprintJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin JSON Skema'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-stone-200 px-5 bg-white">
          <button
            onClick={() => setActiveTab('collections')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'collections'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Database className="w-4 h-4" />
            Koleksi Firestore (4 Entities)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            Role-Based Access Control (RBAC)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Server className="w-4 h-4" />
            Kombinasi Infrastruktur & Hosting
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm bg-stone-50/50">
          {activeTab === 'collections' && (
            <div className="space-y-6">
              {Object.entries(blueprintData.collections).map(([key, col]) => (
                <div key={key} className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {col.path}
                      </span>
                      <span className="font-bold text-stone-800 uppercase text-xs tracking-wider">
                        {key}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400">{col.fields.length} atribut data</span>
                  </div>
                  <p className="text-xs text-stone-600 mb-3">{col.description}</p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-stone-100 rounded-lg overflow-hidden">
                      <thead className="bg-stone-100 text-stone-700 font-semibold">
                        <tr>
                          <th className="p-2">Nama Kolom / Field</th>
                          <th className="p-2">Tipe Data</th>
                          <th className="p-2">Wajib</th>
                          <th className="p-2">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {col.fields.map((f, i) => (
                          <tr key={i} className="hover:bg-stone-50">
                            <td className="p-2 font-mono font-medium text-stone-900">{f.name}</td>
                            <td className="p-2 font-mono text-stone-600">{f.type}</td>
                            <td className="p-2">
                              {f.required ? (
                                <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-semibold">
                                  Ya
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400">Opsional</span>
                              )}
                            </td>
                            <td className="p-2 text-stone-600">{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-stone-200 p-4">
                <h3 className="font-bold text-stone-900 text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Matriks Hak Akses (3 Role: Warga, Admin, Kades)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-stone-100 rounded-lg">
                    <thead className="bg-stone-100 text-stone-700 font-semibold">
                      <tr>
                        <th className="p-2.5">Fitur & Entitas Data</th>
                        <th className="p-2.5 text-center">Warga Desa</th>
                        <th className="p-2.5 text-center">Admin / Kasi</th>
                        <th className="p-2.5 text-center">Kepala Desa (Kades)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td className="p-2.5 font-medium">Buat Pengajuan Baru (4 Jenis Surat)</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Penuh</td>
                        <td className="p-2.5 text-center text-stone-400">-</td>
                        <td className="p-2.5 text-center text-stone-400">-</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Lihat Riwayat & Status Pengajuan</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Milik Sendiri</td>
                        <td className="p-2.5 text-center text-indigo-600 font-bold">✓ Semua Berkas</td>
                        <td className="p-2.5 text-center text-amber-600 font-bold">✓ Semua Berkas</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Tindak Lanjut (Setujui / Tolak + Catatan)</td>
                        <td className="p-2.5 text-center text-stone-400">✗ Tidak berhak</td>
                        <td className="p-2.5 text-center text-indigo-600 font-bold">✓ Penuh (Wajib Catatan jika Ditolak)</td>
                        <td className="p-2.5 text-center text-stone-400">✗ Read-Only</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Cetak Surat Keterangan Resmi Desa</td>
                        <td className="p-2.5 text-center text-emerald-600 font-bold">✓ Jika Disetujui</td>
                        <td className="p-2.5 text-center text-indigo-600 font-bold">✓ Kapan Saja</td>
                        <td className="p-2.5 text-center text-amber-600 font-bold">✓ Kapan Saja</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Kelola Master Data Penduduk</td>
                        <td className="p-2.5 text-center text-stone-400">✗ Tidak berhak</td>
                        <td className="p-2.5 text-center text-indigo-600 font-bold">✓ Tambah, Edit, Hapus</td>
                        <td className="p-2.5 text-center text-stone-400">✗ Read-Only</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Laporan Bulanan & Tahunan Mutasi</td>
                        <td className="p-2.5 text-center text-stone-400">✗ Tidak berhak</td>
                        <td className="p-2.5 text-center text-indigo-600 font-bold">✓ Akses & Cetak</td>
                        <td className="p-2.5 text-center text-amber-600 font-bold">✓ Akses & Cetak Eksekutif</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Manajemen Akun & Role User</td>
                        <td className="p-2.5 text-center text-stone-400">✗ Profil sendiri</td>
                        <td className="p-2.5 text-center text-indigo-600 font-bold">✓ Kelola Akun & Role</td>
                        <td className="p-2.5 text-center text-stone-400">✗ Read-Only</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-stone-900 text-stone-200 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <div className="text-stone-400 mb-2">// Cuplikan Keamanan firestore.rules Terverifikasi</div>
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Warga hanya dapat membuat permohonan dengan status 'menunggu'
    match /submissions/{submissionId} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.status == 'menunggu';
      
      // 2. Hanya Admin yang dapat mengubah status (menyetujui/menolak)
      allow update: if request.auth != null && isAdmin();
      
      // 3. Warga membaca pengajuan miliknya, Admin & Kades membaca semua
      allow get, list: if request.auth != null && (
        resource.data.userId == request.auth.uid || isAdmin() || isKades()
      );
    }
  }
}`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <Server className="w-4 h-4 text-emerald-600" />
                  Kombinasi Teknologi Sesuai Kebutuhan
                </div>
                <ul className="text-xs space-y-2 text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-stone-900 w-28">Frontend:</span>
                    <span>React (TypeScript) + Vite 6</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-stone-900 w-28">UI Styling:</span>
                    <span>Tailwind CSS v4 (Modern & Elegan)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-stone-900 w-28">Database:</span>
                    <span>Firebase Firestore (NoSQL Real-time)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-stone-900 w-28">Autentikasi:</span>
                    <span>Firebase Authentication (Google & Role State)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-stone-900 w-28">File Upload:</span>
                    <span>Firebase Storage (Lampiran KTP, KK, Surat Pengantar)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-stone-900 w-28">Hosting:</span>
                    <span>Firebase App Hosting / Hosting (Free Quota)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-stone-900 w-28">SSL & Domain:</span>
                    <span>Otomatis SSL Gratis dari Firebase Hosting</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                  <HardDrive className="w-4 h-4 text-indigo-600" />
                  Siklus Pengajuan Arsip (Workflow)
                </div>
                <ol className="text-xs space-y-2 text-stone-600 list-decimal pl-4">
                  <li>
                    <strong className="text-stone-800">Warga Mengajukan:</strong> Mengisi formulir (Kelahiran, Kematian, Pindah Masuk/Keluar) dan mengunggah dokumen pendukung.
                  </li>
                  <li>
                    <strong className="text-stone-800">Status "Menunggu":</strong> Berkas masuk ke antrean verifikasi Admin Desa Bojongloa.
                  </li>
                  <li>
                    <strong className="text-stone-800">Pemeriksaan Petugas:</strong> Admin memeriksa keaslian data NIK/KK dan kelengkapan lampiran.
                  </li>
                  <li>
                    <strong className="text-stone-800">Tindakan Admin:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      <li><span className="text-emerald-700 font-semibold">Diterima:</span> Diberikan Nomor Registrasi Surat Resmi dan terbit surat keterangan ber-Kop Desa.</li>
                      <li><span className="text-red-700 font-semibold">Ditolak:</span> Admin wajib mengisi <span className="underline">Catatan Penolakan</span> agar warga mengetahui alasan dan perbaikan yang diperlukan.</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-stone-800">Monitoring Kades:</strong> Kepala Desa dapat meninjau dashboard statistik dan mengunduh laporan kependudukan bulanan/tahunan secara eksekutif.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            Tutup Pratinjau Skema
          </button>
        </div>
      </div>
    </div>
  );
};
