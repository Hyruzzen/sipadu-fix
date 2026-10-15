import { supabase } from '../lib/supabase';
import {
  Resident,
  Submission,
  SubmissionStatus,
  SubmissionType,
  UserProfile,
  UserRole,
  AttachmentFile
} from '../types';

const SUBMISSIONS_TABLE = 'submissions';
const RESIDENTS_TABLE = 'residents';
const USERS_TABLE = 'users';
const STORAGE_BUCKET = 'submission-documents';

export const FORBIDDEN_DETAIL_KEYS = [
  'anakKe', 'kelahiranKe', 'anak_ke',
  'beratBayiKg', 'beratBayi', 'berat', 'beratBadan', 'berat_bayi_kg',
  'panjangBayiCm', 'panjangBayi', 'panjang', 'panjangBadan', 'panjang_bayi_cm',
  'penolongKelahiran', 'penolongLahir', 'penolong', 'penolong_kelahiran'
];

export const sanitizeDetails = (detailsStr: string | object): string => {
  if (!detailsStr) return '{}';
  try {
    const obj = typeof detailsStr === 'string' ? JSON.parse(detailsStr) : { ...detailsStr };
    if (typeof obj !== 'object' || obj === null) return '{}';
    for (const key of FORBIDDEN_DETAIL_KEYS) {
      if (key in obj) {
        delete (obj as any)[key];
      }
    }
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
};

// ==============================================================================
// MAPPER FUNCTIONS: DATABASE (snake_case) <-> TYPESCRIPT (camelCase)
// ==============================================================================
export const mapDbSubmission = (row: any): Submission => {
  let detailsStr = '{}';
  if (typeof row.details === 'object' && row.details !== null) {
    detailsStr = JSON.stringify(row.details);
  } else if (typeof row.details === 'string') {
    detailsStr = row.details;
  }

  let attachmentsStr = '[]';
  if (Array.isArray(row.attachments)) {
    attachmentsStr = JSON.stringify(row.attachments);
  } else if (typeof row.attachments === 'string') {
    attachmentsStr = row.attachments;
  }

  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email || '',
    userName: row.user_name || '',
    userNik: row.user_nik || '',
    userPhone: row.user_phone || undefined,
    type: row.type as SubmissionType,
    status: row.status as SubmissionStatus,
    title: row.title || '',
    details: sanitizeDetails(detailsStr),
    attachments: attachmentsStr,
    rejectionNote: row.rejection_note || undefined,
    nomorRegistrasi: row.nomor_registrasi || row.surat_number || undefined,
    suratNumber: row.nomor_registrasi || row.surat_number || undefined,
    approvedBy: row.approved_by || undefined,
    approvedAt: row.approved_at || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
};

export const mapSubmissionToDb = (sub: Partial<Submission>): Record<string, any> => {
  const payload: Record<string, any> = {};
  if (sub.id !== undefined) payload.id = sub.id;
  if (sub.userId !== undefined) payload.user_id = sub.userId;
  if (sub.userEmail !== undefined) payload.user_email = sub.userEmail;
  if (sub.userName !== undefined) payload.user_name = sub.userName;
  if (sub.userNik !== undefined) payload.user_nik = sub.userNik;
  if (sub.userPhone !== undefined) payload.user_phone = sub.userPhone;
  if (sub.type !== undefined) payload.type = sub.type;
  if (sub.status !== undefined) payload.status = sub.status;
  if (sub.title !== undefined) payload.title = sub.title;
  if (sub.rejectionNote !== undefined) payload.rejection_note = sub.rejectionNote;
  if (sub.nomorRegistrasi !== undefined) {
    payload.nomor_registrasi = sub.nomorRegistrasi;
    payload.surat_number = sub.nomorRegistrasi;
  }
  if (sub.approvedBy !== undefined) payload.approved_by = sub.approvedBy;
  if (sub.approvedAt !== undefined) payload.approved_at = sub.approvedAt;

  if (sub.details !== undefined) {
    try {
      payload.details = typeof sub.details === 'string' ? JSON.parse(sub.details) : sub.details;
    } catch {
      payload.details = {};
    }
  }

  if (sub.attachments !== undefined) {
    try {
      payload.attachments = typeof sub.attachments === 'string' ? JSON.parse(sub.attachments) : sub.attachments;
    } catch {
      payload.attachments = [];
    }
  }

  return payload;
};

export const mapDbResident = (row: any): Resident => ({
  id: row.id,
  nik: row.nik,
  noKk: row.no_kk || '',
  fullName: row.full_name,
  gender: row.gender,
  birthPlace: row.birth_place || '',
  birthDate: row.birth_date || '',
  religion: row.religion || 'Islam',
  maritalStatus: row.marital_status || 'Belum Kawin',
  occupation: row.occupation || '',
  rt: row.rt || '01',
  rw: row.rw || '01',
  dusun: row.dusun || 'Dusun Citaman',
  address: row.address || '',
  status: row.status || 'aktif',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString()
});

export const mapResidentToDb = (res: Resident): Record<string, any> => ({
  id: res.id,
  nik: res.nik,
  no_kk: res.noKk || null,
  full_name: res.fullName,
  gender: res.gender,
  birth_place: res.birthPlace || null,
  birth_date: res.birthDate ? res.birthDate : null,
  religion: res.religion || 'Islam',
  marital_status: res.maritalStatus || 'Belum Kawin',
  occupation: res.occupation || null,
  rt: res.rt || '01',
  rw: res.rw || '01',
  dusun: res.dusun || 'Dusun Citaman',
  address: res.address || '',
  status: res.status || 'aktif'
});

export const mapDbUserProfile = (row: any): UserProfile => ({
  id: row.id,
  email: row.email || '',
  fullName: row.full_name || '',
  role: row.role || 'warga',
  nik: row.nik || undefined,
  noKk: row.no_kk || undefined,
  phone: row.phone || undefined,
  address: row.address || undefined,
  rt: row.rt || undefined,
  rw: row.rw || undefined,
  dusun: row.dusun || undefined,
  gender: row.gender || undefined,
  birthPlace: row.birth_place || undefined,
  birthDate: row.birth_date || undefined,
  occupation: row.occupation || undefined,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString()
});

// ==============================================================================
// ARCHIVE SERVICE IMPLEMENTATION
// ==============================================================================
export const ArchiveService = {
  // Inisialisasi awal (tidak menaruh akun demo berbahaya ke database publik)
  async seedInitialDataIfNeeded(): Promise<void> {
    // Sesuai standar keamanan, data seeder akun resmi dibuat melalui Supabase Auth
    // atau migration SQL, bukan ditanam hardcoded di browser.
  },

  // ----------------------------------------------------------------------------
  // 1. SUPABASE STORAGE (UNGGAH DOKUMEN LAMPIRAN & SIGNED URL)
  // ----------------------------------------------------------------------------
  async uploadAttachment(
    file: File,
    userId: string,
    submissionId: string
  ): Promise<AttachmentFile> {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectPath = `${userId}/${submissionId}/${Date.now()}_${cleanFileName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Gagal mengunggah lampiran "${file.name}": ${error.message}`);
    }

    // Buat signed URL sementara (1 jam) untuk pratinjau langsung
    const signedUrl = await this.getAttachmentSignedUrl(objectPath);

    return {
      name: file.name,
      type: file.type || 'Dokumen Persyaratan',
      size: file.size,
      storagePath: objectPath,
      url: signedUrl
    };
  },

  async getAttachmentSignedUrl(storagePath: string): Promise<string> {
    if (!storagePath || storagePath.startsWith('http') || storagePath.startsWith('blob:')) {
      return storagePath;
    }

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, 3600); // 1 jam masa berlaku

      if (error || !data?.signedUrl) {
        console.warn('Gagal membuat signed URL untuk path:', storagePath, error);
        return '#';
      }

      return data.signedUrl;
    } catch {
      return '#';
    }
  },

  // ----------------------------------------------------------------------------
  // 2. OPERASI PENGAJUAN (SUBMISSIONS)
  // ----------------------------------------------------------------------------
  async getSubmissions(userId?: string, role?: string): Promise<Submission[]> {
    try {
      let query = supabase
        .from(SUBMISSIONS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (role === 'warga' && userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error mengambil pengajuan dari Supabase:', error.message);
        throw new Error(`Gagal memuat data pengajuan: ${error.message}`);
      }

      return (data || []).map(mapDbSubmission);
    } catch (err: any) {
      console.error('getSubmissions error:', err);
      throw err;
    }
  },

  listenSubmissions(
    userId: string | undefined,
    role: string | undefined,
    callback: (subs: Submission[]) => void
  ): () => void {
    const fetchAndEmit = async () => {
      try {
        const items = await this.getSubmissions(userId, role);
        callback(items);
      } catch {
        callback([]);
      }
    };

    fetchAndEmit();

    const channelName = `realtime:submissions_${userId || 'all'}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: SUBMISSIONS_TABLE },
        () => {
          fetchAndEmit();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async createSubmission(
    submissionData: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Submission> {
    const newId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const payload = mapSubmissionToDb({
      ...submissionData,
      id: newId,
      status: 'menunggu'
    });

    const { data, error } = await supabase
      .from(SUBMISSIONS_TABLE)
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Gagal menyimpan pengajuan ke database: ${error.message}`);
    }

    return mapDbSubmission(data);
  },

  async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus,
    adminName: string,
    rejectionNote?: string,
    nomorRegistrasi?: string,
    syncToMasterResident: boolean = true
  ): Promise<void> {
    // 1. Jika Disetujui: Eksekusi transaksi atomik Supabase Database RPC
    if (status === 'disetujui') {
      const regNumber =
        nomorRegistrasi ||
        (await this.generateNomorRegistrasi('kelahiran')); // fallback

      const { error } = await supabase.rpc('approve_submission_and_sync_resident', {
        p_submission_id: submissionId,
        p_nomor_registrasi: regNumber,
        p_sync_to_resident: syncToMasterResident
      });

      if (error) {
        // Fallback update standar jika RPC belum di-deploy
        console.warn('RPC approve_submission notice, executing direct update:', error.message);
        const { error: directErr } = await supabase
          .from(SUBMISSIONS_TABLE)
          .update({
            status: 'disetujui',
            nomor_registrasi: regNumber,
            surat_number: regNumber,
            approved_by: adminName,
            approved_at: new Date().toISOString()
          })
          .eq('id', submissionId);

        if (directErr) {
          throw new Error(`Gagal menyetujui pengajuan: ${directErr.message}`);
        }
      }
      return;
    }

    // 2. Jika Ditolak: Panggil fungsi reject_submission yang mencatat alasan wajib
    if (status === 'ditolak') {
      const note = rejectionNote || 'Berkas persyaratan belum lengkap.';
      const { error } = await supabase.rpc('reject_submission', {
        p_submission_id: submissionId,
        p_rejection_note: note
      });

      if (error) {
        console.warn('RPC reject_submission notice, executing direct update:', error.message);
        const { error: directErr } = await supabase
          .from(SUBMISSIONS_TABLE)
          .update({
            status: 'ditolak',
            rejection_note: note,
            approved_by: adminName,
            approved_at: new Date().toISOString()
          })
          .eq('id', submissionId);

        if (directErr) {
          throw new Error(`Gagal menolak pengajuan: ${directErr.message}`);
        }
      }
      return;
    }

    // 3. Jika status 'diproses'
    const { error } = await supabase
      .from(SUBMISSIONS_TABLE)
      .update({
        status: status,
        approved_by: adminName
      })
      .eq('id', submissionId);

    if (error) {
      throw new Error(`Gagal memperbarui status pengajuan: ${error.message}`);
    }
  },

  async deleteSubmission(submissionId: string): Promise<void> {
    const { error } = await supabase
      .from(SUBMISSIONS_TABLE)
      .delete()
      .eq('id', submissionId);

    if (error) {
      throw new Error(`Gagal menghapus pengajuan: ${error.message}`);
    }
  },

  // ----------------------------------------------------------------------------
  // 3. OPERASI MASTER DATA PENDUDUK (RESIDENTS)
  // ----------------------------------------------------------------------------
  async getResidents(): Promise<Resident[]> {
    try {
      const { data, error } = await supabase
        .from(RESIDENTS_TABLE)
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error mengambil data penduduk:', error.message);
        throw new Error(`Gagal memuat master data penduduk: ${error.message}`);
      }

      return (data || []).map(mapDbResident);
    } catch (err: any) {
      console.error('getResidents error:', err);
      throw err;
    }
  },

  listenResidents(callback: (residents: Resident[]) => void): () => void {
    const fetchAndEmit = async () => {
      try {
        const items = await this.getResidents();
        callback(items);
      } catch {
        callback([]);
      }
    };

    fetchAndEmit();

    const channelName = `realtime:residents_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: RESIDENTS_TABLE },
        () => {
          fetchAndEmit();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async saveResident(resident: Resident): Promise<void> {
    const payload = mapResidentToDb(resident);
    const { error } = await supabase.from(RESIDENTS_TABLE).upsert(payload);

    if (error) {
      throw new Error(`Gagal menyimpan data penduduk (${resident.fullName}): ${error.message}`);
    }
  },

  async saveResidentsBatch(newResidents: Resident[]): Promise<void> {
    if (!newResidents || newResidents.length === 0) return;

    const BATCH_SIZE = 100;
    for (let i = 0; i < newResidents.length; i += BATCH_SIZE) {
      const chunk = newResidents.slice(i, i + BATCH_SIZE).map(mapResidentToDb);
      const { error } = await supabase.from(RESIDENTS_TABLE).upsert(chunk);

      if (error) {
        throw new Error(`Gagal mengimpor batch penduduk: ${error.message}`);
      }
    }
  },

  async deleteResident(residentId: string): Promise<void> {
    const { error } = await supabase
      .from(RESIDENTS_TABLE)
      .delete()
      .eq('id', residentId);

    if (error) {
      throw new Error(`Gagal menghapus data penduduk: ${error.message}`);
    }
  },

  async clearAllData(): Promise<void> {
    const { error: err1 } = await supabase.from(SUBMISSIONS_TABLE).delete().neq('id', '');
    const { error: err2 } = await supabase.from(RESIDENTS_TABLE).delete().neq('id', '');

    if (err1 || err2) {
      throw new Error(`Gagal mengosongkan data: ${err1?.message || err2?.message}`);
    }
  },

  // ----------------------------------------------------------------------------
  // 4. OPERASI PENGGUNA & AKUN (USERS)
  // ----------------------------------------------------------------------------
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from(USERS_TABLE)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return mapDbUserProfile(data);
    } catch {
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const payload: Record<string, any> = {
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      role: profile.role,
      nik: profile.nik || null,
      no_kk: profile.noKk || null,
      phone: profile.phone || null,
      address: profile.address || null,
      rt: profile.rt || null,
      rw: profile.rw || null,
      dusun: profile.dusun || null,
      gender: profile.gender || null,
      birth_place: profile.birthPlace || null,
      birth_date: profile.birthDate || null,
      occupation: profile.occupation || null
    };

    const { error } = await supabase.from(USERS_TABLE).upsert(payload);
    if (error) {
      throw new Error(`Gagal menyimpan profil pengguna: ${error.message}`);
    }
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const { error } = await supabase
      .from(USERS_TABLE)
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw new Error(`Gagal memperbarui peran akun: ${error.message}`);
    }
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from(USERS_TABLE).delete().eq('id', userId);
    if (error) {
      throw new Error(`Gagal menghapus user: ${error.message}`);
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from(USERS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error mengambil data user:', error.message);
        throw new Error(`Gagal memuat akun pengguna: ${error.message}`);
      }

      return (data || []).map(mapDbUserProfile);
    } catch (err: any) {
      console.error('getAllUsers error:', err);
      throw err;
    }
  },

  // ----------------------------------------------------------------------------
  // 5. PENOMORAN REGISTRASI ARSIP ATOMIK
  // ----------------------------------------------------------------------------
  async generateNomorRegistrasi(type: SubmissionType, sequenceFallback?: number): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_nomor_registrasi', {
        p_type: type
      });

      if (!error && data) {
        return data as string;
      }
    } catch (err) {
      console.warn('RPC generate_nomor_registrasi notice (fallback):', err);
    }

    // Fallback format penomoran jika RPC belum di-deploy
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonth = romanMonths[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const padSeq = String(sequenceFallback || Math.floor(Math.random() * 900 + 100)).padStart(3, '0');

    let kodeKlasifikasi = '470';
    if (type === 'kelahiran') kodeKlasifikasi = '474.1';
    else if (type === 'kematian') kodeKlasifikasi = '474.2';
    else if (type === 'pindah_masuk') kodeKlasifikasi = '475.1';
    else if (type === 'pindah_keluar') kodeKlasifikasi = '475.2';

    return `REG-${kodeKlasifikasi}/${padSeq}/ARSIP-BJL/${currentMonth}/${currentYear}`;
  },

  generateSuratNumber(type: SubmissionType, sequenceFallback?: number): Promise<string> {
    return this.generateNomorRegistrasi(type, sequenceFallback);
  }
};
