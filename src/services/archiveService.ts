import { supabase } from '../lib/supabase';
import { Resident, Submission, SubmissionStatus, SubmissionType, UserProfile } from '../types';
import { DESA_INFO } from '../data/mockData';

const SUBMISSIONS_TABLE = 'submissions';
const RESIDENTS_TABLE = 'residents';
const USERS_TABLE = 'users';

export const FORBIDDEN_DETAIL_KEYS = [
  'anakKe', 'kelahiranKe', 'anak_ke',
  'beratBayiKg', 'beratBayi', 'berat', 'beratBadan', 'berat_bayi_kg',
  'panjangBayiCm', 'panjangBayi', 'panjang', 'panjangBadan', 'panjang_bayi_cm',
  'penolongKelahiran', 'penolongLahir', 'penolong', 'penolong_kelahiran'
];

export const sanitizeDetails = (detailsStr: string): string => {
  if (!detailsStr) return '{}';
  try {
    const obj = JSON.parse(detailsStr);
    if (typeof obj !== 'object' || obj === null) return detailsStr;
    let changed = false;
    for (const key of FORBIDDEN_DETAIL_KEYS) {
      if (key in obj) {
        delete obj[key];
        changed = true;
      }
    }
    return changed ? JSON.stringify(obj) : detailsStr;
  } catch {
    return detailsStr;
  }
};

export const sanitizeSubmission = (sub: Submission): Submission => {
  if (!sub || !sub.details) return sub;
  return {
    ...sub,
    details: sanitizeDetails(sub.details)
  };
};

const getStoredSubmissions = (): Submission[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('desa_all_submissions');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .filter((s: any) => !s.id?.startsWith('sub-00'))
          .map(sanitizeSubmission);
        saveStoredSubmissions(cleaned);
        return cleaned;
      }
    }
  } catch {
    // fallback
  }
  return [];
};

const saveStoredSubmissions = (subs: Submission[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('desa_all_submissions', JSON.stringify(subs));
  } catch {
    // ignore
  }
};

const getStoredResidents = (): Resident[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('desa_all_residents');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((r: any) => !r.id?.startsWith('res-') || r.id?.length > 8);
        saveStoredResidents(cleaned);
        return cleaned;
      }
    }
  } catch {
    // ignore
  }
  return [];
};

const saveStoredResidents = (res: Resident[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('desa_all_residents', JSON.stringify(res));
  } catch {
    // ignore
  }
};

export const DEFAULT_OFFICIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@desa-bojongloa.id',
    fullName: DESA_INFO.namaKasiPelayanan,
    role: 'admin',
    nik: '3204121208840001',
    phone: '081122334455',
    address: 'Kantor Desa Bojongloa, Rancaekek',
    rt: '01',
    rw: '01',
    dusun: 'Dusun Bojongloa Pusat',
    gender: 'L',
    birthPlace: 'Bandung',
    birthDate: '1984-08-12',
    occupation: 'Kasi Pelayanan Desa',
    password: 'password123',
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-kades-1',
    email: 'kades@desa-bojongloa.id',
    fullName: DESA_INFO.namaKades,
    role: 'kades',
    nik: '3204121405710001',
    phone: '081298765432',
    address: 'Jl. Raya Bojongloa No. 1, Rancaekek',
    rt: '01',
    rw: '01',
    dusun: 'Dusun Bojongloa Pusat',
    gender: 'L',
    birthPlace: 'Bandung',
    birthDate: '1971-05-14',
    occupation: 'Kepala Desa',
    password: 'password123',
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2025-01-01T08:00:00Z'
  },
  {
    id: 'user-warga-1',
    email: 'warga.asep@desa-bojongloa.id',
    fullName: 'Asep Saepudin',
    role: 'warga',
    nik: '3204121503920001',
    phone: '081234567890',
    address: 'Jl. Desa Bojongloa No. 14, RT 02/RW 03',
    rt: '02',
    rw: '03',
    dusun: 'Dusun Babakan',
    gender: 'L',
    birthPlace: 'Bandung',
    birthDate: '1992-03-15',
    occupation: 'Wiraswasta',
    password: 'password123',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z'
  }
];

const getStoredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return [...DEFAULT_OFFICIAL_USERS];
  try {
    const initialized = localStorage.getItem('desa_users_initialized');
    const raw = localStorage.getItem('desa_registered_users');
    if (initialized && raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    localStorage.setItem('desa_users_initialized', 'true');
    localStorage.setItem('desa_registered_users', JSON.stringify(DEFAULT_OFFICIAL_USERS));
    return [...DEFAULT_OFFICIAL_USERS];
  } catch {
    return [...DEFAULT_OFFICIAL_USERS];
  }
};

let localSubmissions: Submission[] = getStoredSubmissions();
let localResidents: Resident[] = getStoredResidents();

export const ArchiveService = {
  // Sync default accounts to Supabase if not present
  async seedInitialDataIfNeeded(): Promise<void> {
    try {
      // 1. Seed users
      const { data: remoteUsers } = await supabase.from(USERS_TABLE).select('id');
      const existingUserIds = new Set((remoteUsers || []).map((u: any) => u.id));

      for (const user of DEFAULT_OFFICIAL_USERS) {
        if (!existingUserIds.has(user.id)) {
          await supabase.from(USERS_TABLE).upsert(user);
        }
      }

      // Sync local storage
      const localUsers = getStoredUsers();
      const localIds = new Set(localUsers.map(u => u.id));
      const mergedUsers = [...localUsers];
      for (const user of DEFAULT_OFFICIAL_USERS) {
        if (!localIds.has(user.id)) mergedUsers.push(user);
      }
      localStorage.setItem('desa_registered_users', JSON.stringify(mergedUsers));
    } catch (err) {
      console.warn('Supabase seed initial notice (fallback local):', err);
    }
  },

  // 1. Submissions Operations
  async getSubmissions(userId?: string, role?: string): Promise<Submission[]> {
    try {
      let query = supabase.from(SUBMISSIONS_TABLE).select('*').order('createdAt', { ascending: false });
      if (role === 'warga' && userId) {
        query = query.eq('userId', userId);
      }
      const { data, error } = await query;

      if (!error && data) {
        const remoteItems = data.map((d: any) => sanitizeSubmission(d as Submission));
        const currentLocal = getStoredSubmissions();
        const map = new Map<string, Submission>();
        currentLocal.forEach(s => map.set(s.id, s));
        remoteItems.forEach(s => map.set(s.id, s));

        let all = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (role === 'warga') {
          if (!userId) return [];
          all = all.filter(s => s.userId === userId);
        }
        return all;
      }
    } catch (err) {
      console.warn('Error fetching Supabase submissions, using local cache:', err);
    }

    const currentLocal = getStoredSubmissions();
    if (role === 'warga') {
      if (!userId) return [];
      return currentLocal.filter(s => s.userId === userId);
    }
    return currentLocal;
  },

  listenSubmissions(
    userId: string | undefined,
    role: string | undefined,
    callback: (subs: Submission[]) => void
  ): () => void {
    const fetchAndEmit = async () => {
      const items = await this.getSubmissions(userId, role);
      callback(items);
    };

    fetchAndEmit();

    try {
      const channel = supabase
        .channel('public:submissions')
        .on('postgres_changes', { event: '*', schema: 'public', table: SUBMISSIONS_TABLE }, () => {
          fetchAndEmit();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },

  async createSubmission(submissionData: Omit<Submission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Submission> {
    const newId = 'sub-' + Date.now();
    const now = new Date().toISOString();
    const newSubmission: Submission = sanitizeSubmission({
      ...submissionData,
      details: sanitizeDetails(submissionData.details),
      id: newId,
      createdAt: now,
      updatedAt: now,
    });

    localSubmissions = [newSubmission, ...localSubmissions.filter(s => s.id !== newId)];
    saveStoredSubmissions(localSubmissions);

    try {
      await supabase.from(SUBMISSIONS_TABLE).upsert(newSubmission);
    } catch (err) {
      console.warn('Supabase submission write notice:', err);
    }

    return newSubmission;
  },

  async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus,
    adminName: string,
    rejectionNote?: string,
    nomorRegistrasi?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const updates: Partial<Submission> = {
      status,
      updatedAt: now,
      approvedBy: adminName,
      approvedAt: now,
      ...(rejectionNote ? { rejectionNote } : {}),
      ...(nomorRegistrasi ? { nomorRegistrasi, suratNumber: nomorRegistrasi } : {})
    };

    try {
      await supabase.from(SUBMISSIONS_TABLE).update(updates).eq('id', submissionId);
    } catch (err) {
      console.warn('Supabase submission update notice:', err);
    }

    localSubmissions = localSubmissions.map(s => s.id === submissionId ? { ...s, ...updates } : s);
    saveStoredSubmissions(localSubmissions);
  },

  async deleteSubmission(submissionId: string): Promise<void> {
    try {
      await supabase.from(SUBMISSIONS_TABLE).delete().eq('id', submissionId);
    } catch (err) {
      console.warn('Supabase submission delete notice:', err);
    }
    localSubmissions = localSubmissions.filter(s => s.id !== submissionId);
    saveStoredSubmissions(localSubmissions);
  },

  // 2. Residents Operations (Master Data Penduduk)
  async getResidents(): Promise<Resident[]> {
    try {
      const { data, error } = await supabase.from(RESIDENTS_TABLE).select('*').order('fullName', { ascending: true });
      if (!error && data && data.length > 0) {
        localResidents = data as Resident[];
        saveStoredResidents(localResidents);
        return localResidents;
      }
    } catch (err) {
      console.warn('Supabase getResidents notice:', err);
    }
    return getStoredResidents();
  },

  listenResidents(callback: (residents: Resident[]) => void): () => void {
    const fetchAndEmit = async () => {
      const list = await this.getResidents();
      callback(list);
    };

    fetchAndEmit();

    try {
      const channel = supabase
        .channel('public:residents')
        .on('postgres_changes', { event: '*', schema: 'public', table: RESIDENTS_TABLE }, () => {
          fetchAndEmit();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      return () => {};
    }
  },

  async saveResident(resident: Resident): Promise<void> {
    try {
      await supabase.from(RESIDENTS_TABLE).upsert(resident);
    } catch (err) {
      console.warn('Supabase saveResident notice:', err);
    }
    const idx = localResidents.findIndex(r => r.id === resident.id);
    if (idx >= 0) {
      localResidents[idx] = resident;
    } else {
      localResidents.push(resident);
    }
    saveStoredResidents(localResidents);
  },

  async saveResidentsBatch(newResidents: Resident[]): Promise<void> {
    if (!newResidents || newResidents.length === 0) return;

    const map = new Map<string, Resident>();
    localResidents.forEach((r) => map.set(r.id, r));
    newResidents.forEach((r) => map.set(r.id, r));
    localResidents = Array.from(map.values());
    saveStoredResidents(localResidents);

    try {
      const BATCH_SIZE = 100;
      for (let i = 0; i < newResidents.length; i += BATCH_SIZE) {
        const chunk = newResidents.slice(i, i + BATCH_SIZE);
        await supabase.from(RESIDENTS_TABLE).upsert(chunk);
      }
    } catch (err) {
      console.warn('Supabase saveResidentsBatch notice:', err);
    }
  },

  async deleteResident(residentId: string): Promise<void> {
    try {
      await supabase.from(RESIDENTS_TABLE).delete().eq('id', residentId);
    } catch (err) {
      console.warn('Supabase deleteResident notice:', err);
    }
    localResidents = localResidents.filter(r => r.id !== residentId);
    saveStoredResidents(localResidents);
  },

  async clearAllData(): Promise<void> {
    localSubmissions = [];
    localResidents = [];
    saveStoredSubmissions([]);
    saveStoredResidents([]);
    try {
      await supabase.from(RESIDENTS_TABLE).delete().neq('id', '');
      await supabase.from(SUBMISSIONS_TABLE).delete().neq('id', '');
    } catch {
      // ignore
    }
  },

  // 3. User Profile Operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from(USERS_TABLE).select('*').eq('id', userId).maybeSingle();
      if (!error && data) {
        return data as UserProfile;
      }
    } catch (err) {
      console.warn('Supabase getUserProfile notice:', err);
    }
    const local = getStoredUsers();
    return local.find(u => u.id === userId) || null;
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await supabase.from(USERS_TABLE).upsert(profile);
    } catch (err) {
      console.warn('Supabase saveUserProfile notice:', err);
    }

    try {
      const list = getStoredUsers();
      const idx = list.findIndex(u => u.id === profile.id || (profile.nik && u.nik === profile.nik));
      if (idx >= 0) {
        list[idx] = profile;
      } else {
        list.push(profile);
      }
      localStorage.setItem('desa_registered_users', JSON.stringify(list));
    } catch {
      // ignore
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await supabase.from(USERS_TABLE).delete().eq('id', userId);
    } catch (err) {
      console.warn('Supabase deleteUser notice:', err);
    }
    try {
      const list = getStoredUsers();
      const filtered = list.filter(u => u.id !== userId);
      localStorage.setItem('desa_registered_users', JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const localUsers = getStoredUsers();
    try {
      const { data, error } = await supabase.from(USERS_TABLE).select('*');
      if (!error && data && data.length > 0) {
        const remoteUsers = data as UserProfile[];
        const map = new Map<string, UserProfile>();
        localUsers.forEach(u => map.set(u.id, u));
        remoteUsers.forEach(u => map.set(u.id, u));
        return Array.from(map.values());
      }
    } catch (err) {
      console.warn('Supabase getAllUsers notice:', err);
    }
    return localUsers;
  },

  // Helper to generate Official Registration Number
  generateNomorRegistrasi(type: SubmissionType, sequence: number = 1): string {
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonth = romanMonths[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const padSeq = String(sequence).padStart(3, '0');

    let kodeKlasifikasi = '470';
    if (type === 'kelahiran') kodeKlasifikasi = '474.1';
    else if (type === 'kematian') kodeKlasifikasi = '474.2';
    else if (type === 'pindah_masuk') kodeKlasifikasi = '475.1';
    else if (type === 'pindah_keluar') kodeKlasifikasi = '475.2';

    return `REG-${kodeKlasifikasi}/${padSeq}/ARSIP-BJL/${currentMonth}/${currentYear}`;
  },

  generateSuratNumber(type: SubmissionType, sequence: number = 1): string {
    return this.generateNomorRegistrasi(type, sequence);
  }
};
