import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { ArchiveService } from '../../services/archiveService';
import { Resident } from '../../types';
import { DESA_INFO } from '../../data/mockData';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export const AdminDataPenduduk: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dusunFilter, setDusunFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Import Excel State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedResidents, setParsedResidents] = useState<Resident[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccessMessage, setImportSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>>({
    nik: '',
    noKk: '',
    fullName: '',
    gender: 'L',
    birthPlace: 'Bandung',
    birthDate: '1995-01-01',
    religion: 'Islam',
    maritalStatus: 'Kawin',
    occupation: 'Wiraswasta',
    dusun: DESA_INFO.daftarDusun[0],
    rt: '01',
    rw: '01',
    address: 'Desa Bojongloa',
    status: 'aktif'
  });

  useEffect(() => {
    const unsubscribe = ArchiveService.listenResidents((data) => {
      setResidents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredResidents = residents.filter((r) => {
    const matchesDusun = dusunFilter === 'all' || r.dusun === dusunFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nik.includes(searchQuery) ||
      r.noKk.includes(searchQuery) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDusun && matchesStatus && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingResident(null);
    setFormData({
      nik: '',
      noKk: '',
      fullName: '',
      gender: 'L',
      birthPlace: '',
      birthDate: '',
      religion: 'Islam',
      maritalStatus: 'Kawin',
      occupation: '',
      dusun: DESA_INFO.daftarDusun[0],
      rt: '01',
      rw: '01',
      address: '',
      status: 'aktif'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (res: Resident) => {
    setEditingResident(res);
    setFormData({
      nik: res.nik,
      noKk: res.noKk,
      fullName: res.fullName,
      gender: res.gender,
      birthPlace: res.birthPlace,
      birthDate: res.birthDate,
      religion: res.religion,
      maritalStatus: res.maritalStatus,
      occupation: res.occupation,
      dusun: res.dusun,
      rt: res.rt,
      rw: res.rw,
      address: res.address,
      status: res.status
    });
    setModalOpen(true);
  };

  const handleSaveResident = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();

    if (editingResident) {
      await ArchiveService.saveResident({
        ...editingResident,
        ...formData,
        updatedAt: now
      });
    } else {
      const newRes: Resident = {
        ...formData,
        id: 'res-' + Date.now(),
        createdAt: now,
        updatedAt: now
      };
      await ArchiveService.saveResident(newRes);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await ArchiveService.deleteResident(id);
    setDeleteConfirmId(null);
  };

  // Helper functions for parsing Excel columns
  const parseExcelDate = (val: any): string => {
    if (!val) return '1995-01-01';
    if (typeof val === 'number') {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    const parts = str.split(/[/.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return '1995-01-01';
  };

  const parseGender = (val: any): 'L' | 'P' => {
    if (!val) return 'L';
    const s = String(val).trim().toUpperCase();
    if (s.startsWith('P') || s.includes('PEREMPUAN') || s === 'WANITA' || s === 'W') {
      return 'P';
    }
    return 'L';
  };

  const parseStatus = (val: any): 'aktif' | 'meninggal' | 'pindah_keluar' | 'warga_baru' => {
    if (!val) return 'aktif';
    const s = String(val).trim().toLowerCase();
    if (s.includes('meninggal') || s.includes('mati')) return 'meninggal';
    if (s.includes('pindah')) return 'pindah_keluar';
    if (s.includes('baru')) return 'warga_baru';
    return 'aktif';
  };

  const parseMaritalStatus = (val: any): 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati' => {
    if (!val) return 'Kawin';
    const s = String(val).trim().toLowerCase();
    if (s.includes('belum')) return 'Belum Kawin';
    if (s.includes('hidup')) return 'Cerai Hidup';
    if (s.includes('mati')) return 'Cerai Mati';
    if (s.includes('cerai')) return 'Cerai Hidup';
    return 'Kawin';
  };

  // 1. Download official template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NIK': '3204121503920001',
        'No KK': '3204120101180001',
        'Nama Lengkap': 'Ahmad Fauzi',
        'Jenis Kelamin (L/P)': 'L',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir (YYYY-MM-DD)': '1990-05-15',
        'Agama': 'Islam',
        'Status Perkawinan': 'Kawin',
        'Pekerjaan': 'Wiraswasta',
        'Dusun': 'Dusun Babakan',
        'RT': '01',
        'RW': '02',
        'Alamat': 'Jl. Bojongloa RT 01 RW 02',
        'Status': 'aktif'
      },
      {
        'NIK': '3204125508940002',
        'No KK': '3204120101180001',
        'Nama Lengkap': 'Siti Maryam',
        'Jenis Kelamin (L/P)': 'P',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir (YYYY-MM-DD)': '1994-08-20',
        'Agama': 'Islam',
        'Status Perkawinan': 'Kawin',
        'Pekerjaan': 'Ibu Rumah Tangga',
        'Dusun': 'Dusun Babakan',
        'RT': '01',
        'RW': '02',
        'Alamat': 'Jl. Bojongloa RT 01 RW 02',
        'Status': 'aktif'
      },
      {
        'NIK': '3204121102200003',
        'No KK': '3204120101180001',
        'Nama Lengkap': 'Rizky Pratama',
        'Jenis Kelamin (L/P)': 'L',
        'Tempat Lahir': 'Bandung',
        'Tanggal Lahir (YYYY-MM-DD)': '2020-02-11',
        'Agama': 'Islam',
        'Status Perkawinan': 'Belum Kawin',
        'Pekerjaan': 'Belum/Tidak Bekerja',
        'Dusun': 'Dusun Babakan',
        'RT': '01',
        'RW': '02',
        'Alamat': 'Jl. Bojongloa RT 01 RW 02',
        'Status': 'aktif'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 19 },
      { wch: 19 },
      { wch: 24 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 12 },
      { wch: 18 },
      { wch: 20 },
      { wch: 18 },
      { wch: 6 },
      { wch: 6 },
      { wch: 28 },
      { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Penduduk');
    XLSX.writeFile(wb, 'Format_Import_Data_Penduduk_Desa_Bojongloa.xlsx');
  };

  // 2. Export database to Excel file
  const handleExportExcel = () => {
    const exportData = filteredResidents.map((r, index) => ({
      'No': index + 1,
      'NIK': r.nik,
      'No KK': r.noKk,
      'Nama Lengkap': r.fullName,
      'Jenis Kelamin': r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tempat Lahir': r.birthPlace,
      'Tanggal Lahir': r.birthDate,
      'Agama': r.religion,
      'Status Perkawinan': r.maritalStatus,
      'Pekerjaan': r.occupation,
      'Dusun': r.dusun,
      'RT': r.rt,
      'RW': r.rw,
      'Alamat': r.address,
      'Status': r.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Penduduk');
    XLSX.writeFile(wb, `Data_Penduduk_Desa_Bojongloa_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 3. Handle file parsing from input or drag drop
  const handleFileSelected = (file: File) => {
    setImportError('');
    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          setImportError('File Excel tidak memiliki baris data atau kosong.');
          return;
        }

        const now = new Date().toISOString();
        const mapped: Resident[] = [];

        json.forEach((row, idx) => {
          const rawNik = String(row['NIK'] || row['nik'] || row['Nomor Induk Kependudukan'] || '').trim();
          const rawName = String(row['Nama Lengkap'] || row['Nama'] || row['nama'] || row['fullName'] || '').trim();

          // Skip completely blank rows
          if (!rawNik && !rawName) return;

          const resident: Resident = {
            id: 'res-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
            nik: rawNik || ('320412' + Math.floor(1000000000 + Math.random() * 9000000000)),
            noKk: String(row['No KK'] || row['noKk'] || row['no_kk'] || row['Nomor KK'] || '3204120101180001').trim(),
            fullName: rawName || 'Warga Tanpa Nama',
            gender: parseGender(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['gender'] || row['jk']),
            birthPlace: String(row['Tempat Lahir'] || row['birthPlace'] || 'Bandung').trim(),
            birthDate: parseExcelDate(row['Tanggal Lahir (YYYY-MM-DD)'] || row['Tanggal Lahir'] || row['birthDate'] || row['tgl_lahir']),
            religion: String(row['Agama'] || row['religion'] || 'Islam').trim(),
            maritalStatus: parseMaritalStatus(row['Status Perkawinan'] || row['Status Kawin'] || row['maritalStatus']),
            occupation: String(row['Pekerjaan'] || row['occupation'] || 'Wiraswasta').trim(),
            dusun: String(row['Dusun'] || row['dusun'] || DESA_INFO.daftarDusun[0]).trim(),
            rt: String(row['RT'] || row['rt'] || '01').trim().padStart(2, '0'),
            rw: String(row['RW'] || row['rw'] || '01').trim().padStart(2, '0'),
            address: String(row['Alamat'] || row['address'] || 'Desa Bojongloa').trim(),
            status: parseStatus(row['Status'] || row['status']),
            createdAt: now,
            updatedAt: now
          };
          mapped.push(resident);
        });

        if (mapped.length === 0) {
          setImportError('Tidak ditemukan baris data penduduk yang valid di dalam file.');
          return;
        }

        setParsedResidents(mapped);
      } catch (err: any) {
        setImportError('Gagal membaca file: ' + (err.message || 'Format tidak didukung'));
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 4. Batch commit to database
  const handleConfirmImport = async () => {
    if (parsedResidents.length === 0) return;
    setIsImporting(true);
    setImportError('');
    try {
      await ArchiveService.saveResidentsBatch(parsedResidents);
      setImportSuccessMessage(`Berhasil mengimpor ${parsedResidents.length} data penduduk ke dalam database!`);
      setTimeout(() => {
        setImportModalOpen(false);
        setParsedResidents([]);
        setImportFileName('');
        setImportSuccessMessage('');
      }, 1500);
    } catch (err: any) {
      setImportError('Gagal menyimpan data: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Master Data Kependudukan Desa Bojongloa
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Database arsip resmi kependudukan desa. Total {residents.length} jiwa penduduk tercatat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors shadow-2xs"
            title="Unduh format template Excel untuk pengisian data warga"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Format Excel</span>
          </button>

          {/* Import Excel Button */}
          <button
            type="button"
            onClick={() => {
              setParsedResidents([]);
              setImportFileName('');
              setImportError('');
              setImportSuccessMessage('');
              setImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            title="Import data awal penduduk dari file Excel (.xlsx / .xls / .csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel</span>
          </button>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors shadow-2xs"
            title="Unduh seluruh data penduduk ke format Excel"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Ekspor Excel</span>
          </button>

          {/* Tambah Penduduk Manual */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Penduduk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Dusun */}
          <select
            value={dusunFilter}
            onChange={(e) => setDusunFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 focus:outline-hidden"
          >
            <option value="all">Semua Dusun</option>
            {DESA_INFO.daftarDusun.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="warga_baru">Warga Baru</option>
            <option value="pindah_keluar">Pindah Keluar</option>
            <option value="meninggal">Meninggal</option>
          </select>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari NIK, KK, atau Nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Memuat data master penduduk...</div>
        ) : filteredResidents.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-800">Belum ada data penduduk</p>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto mb-4">
              Semua data seeder telah dibersihkan. Anda dapat menambahkan data penduduk secara manual satu per satu atau mengimpor data massal sekaligus dari file Excel.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setParsedResidents([]);
                  setImportFileName('');
                  setImportError('');
                  setImportSuccessMessage('');
                  setImportModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-2xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Import dari Excel (Massal)</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Manual</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b">
                <tr>
                  <th className="p-3">NIK & No KK</th>
                  <th className="p-3">Nama Lengkap & JK</th>
                  <th className="p-3">TTL & Usia</th>
                  <th className="p-3">Alamat / Dusun</th>
                  <th className="p-3">Pekerjaan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredResidents.map((res) => {
                  const birthYear = parseInt(res.birthDate?.split('-')[0] || '1990');
                  const age = new Date().getFullYear() - birthYear;

                  const statusStyle =
                    res.status === 'aktif'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : res.status === 'meninggal'
                      ? 'bg-stone-100 text-stone-700 border-stone-300'
                      : res.status === 'pindah_keluar'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200';

                  return (
                    <tr key={res.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-stone-900">{res.nik}</div>
                        <div className="text-[11px] text-stone-400">KK: {res.noKk}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-stone-900 uppercase">{res.fullName}</div>
                        <span className="text-[11px] text-stone-500">
                          {res.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="p-3 text-stone-600">
                        <div>{res.birthPlace}, {res.birthDate}</div>
                        <div className="text-[11px] text-stone-400 font-semibold">{age} Tahun</div>
                      </td>
                      <td className="p-3 text-stone-700">
                        <div className="font-medium">{res.dusun}</div>
                        <div className="text-[11px] text-stone-400">RT {res.rt} / RW {res.rw}</div>
                      </td>
                      <td className="p-3 text-stone-600">
                        <div>{res.occupation}</div>
                        <div className="text-[11px] text-stone-400">{res.maritalStatus}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border capitalize ${statusStyle}`}>
                          {res.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(res)}
                            title="Edit Data Penduduk"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(res.id)}
                            title="Hapus Data Penduduk"
                            className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* MODAL: ADD / EDIT RESIDENT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                {editingResident ? 'Ubah Data Penduduk' : 'Tambah Data Penduduk Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700 text-xl font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleSaveResident} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor Induk Kependudukan (NIK) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nomor Kartu Keluarga (KK) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={formData.noKk}
                    onChange={(e) => setFormData({ ...formData, noKk: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Agama</label>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Perkawinan</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dusun</label>
                  <select
                    value={formData.dusun}
                    onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {DESA_INFO.daftarDusun.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">RT</label>
                    <input
                      type="text"
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">RW</label>
                    <input
                      type="text"
                      value={formData.rw}
                      onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Status Kependudukan</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="warga_baru">Warga Baru</option>
                    <option value="pindah_keluar">Pindah Keluar</option>
                    <option value="meninggal">Meninggal</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan Penduduk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-stone-200 space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">Hapus Rekaman Penduduk?</h3>
            <p className="text-xs text-stone-600">
              Apakah Anda yakin ingin menghapus data penduduk ini dari arsip master kependudukan desa? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Import Data Penduduk dari Excel</h3>
                  <p className="text-xs text-stone-500">
                    Masukkan data awal kependudukan massal (ratusan hingga ribuan warga).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Notifications */}
            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{importSuccessMessage}</span>
              </div>
            )}

            {/* File Dropzone / Selection */}
            {!parsedResidents.length ? (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileSelected(e.dataTransfer.files[0]);
                    }
                  }}
                  className="border-2 border-dashed border-stone-300 hover:border-emerald-500 bg-stone-50 hover:bg-emerald-50/40 rounded-2xl p-8 text-center cursor-pointer transition-colors space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-800">
                      Klik untuk Memilih File Excel atau Tarik File ke Sini
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Mendukung format: <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1.5 bg-white border border-stone-300 text-stone-700 rounded-lg text-xs font-semibold shadow-2xs">
                    Pilih File dari Komputer
                  </span>
                </div>

                {/* Template Download Help Box */}
                <div className="p-3.5 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                  <div className="text-stone-600">
                    <strong className="text-stone-800">Belum punya format tabel?</strong> Unduh template Excel resmi untuk mempermudah penyusunan data awal 1.000 warga.
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-lg font-bold text-xs shrink-0 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                    <span>Unduh Template</span>
                  </button>
                </div>
              </div>
            ) : (
              /* File Selected & Preview Mode */
              <div className="space-y-4">
                {/* File info and change button */}
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2 text-xs">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-800">{importFileName}</span>
                      <p className="text-[11px] text-stone-500">File berhasil dibaca dan diverifikasi</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedResidents([]);
                      setImportFileName('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-stone-600 hover:text-stone-900 font-semibold px-2.5 py-1 bg-white border rounded-lg hover:bg-stone-100"
                  >
                    Ganti File
                  </button>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Total Warga</span>
                    <strong className="text-lg font-extrabold text-emerald-950 font-mono">
                      {parsedResidents.length.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-[11px] font-semibold text-blue-700 uppercase block">Laki-laki</span>
                    <strong className="text-lg font-extrabold text-blue-950 font-mono">
                      {parsedResidents.filter((r) => r.gender === 'L').length.toLocaleString('id-ID')}
                    </strong>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="text-[11px] font-semibold text-purple-700 uppercase block">Perempuan</span>
                    <strong className="text-lg font-extrabold text-purple-950 font-mono">
                      {parsedResidents.filter((r) => r.gender === 'P').length.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                {/* Preview Table of First 5 rows */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
                    <span>Pratinjau 5 Data Pertama:</span>
                    <span className="text-[11px] text-stone-500 font-normal">
                      Menampilkan 5 dari {parsedResidents.length} data
                    </span>
                  </div>
                  <div className="border border-stone-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-2">No</th>
                          <th className="p-2">NIK</th>
                          <th className="p-2">Nama Lengkap</th>
                          <th className="p-2">JK</th>
                          <th className="p-2">Dusun</th>
                          <th className="p-2">RT/RW</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                        {parsedResidents.slice(0, 5).map((r, i) => (
                          <tr key={r.id} className="hover:bg-stone-50">
                            <td className="p-2 text-stone-400">{i + 1}</td>
                            <td className="p-2 font-bold text-stone-800">{r.nik}</td>
                            <td className="p-2 font-sans font-semibold text-stone-900">{r.fullName}</td>
                            <td className="p-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {r.gender}
                              </span>
                            </td>
                            <td className="p-2 font-sans text-stone-700">{r.dusun}</td>
                            <td className="p-2 text-stone-600">{r.rt}/{r.rw}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                disabled={isImporting}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Batal
              </button>

              {parsedResidents.length > 0 && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan {parsedResidents.length} Data...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Import Sekarang ({parsedResidents.length.toLocaleString('id-ID')} Warga)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
