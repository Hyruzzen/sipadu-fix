import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { Resident, Submission, SubmissionStatus, SubmissionType, UserProfile } from '../types';
import { INITIAL_RESIDENTS, INITIAL_SUBMISSIONS, DESA_INFO } from '../data/mockData';

const SUBMISSIONS_COLLECTION = 'submissions';
const RESIDENTS_COLLECTION = 'residents';
const USERS_COLLECTION = 'users';
const ADMINS_COLLECTION = 'admins';

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
        // Clean out any lingering seeder submissions
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
        // Clean out any lingering seeder residents
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
    // Initialize with default official users
    localStorage.setItem('desa_users_initialized', 'true');
    localStorage.setItem('desa_registered_users', JSON.stringify(DEFAULT_OFFICIAL_USERS));
    return [...DEFAULT_OFFICIAL_USERS];
  } catch {
    return [...DEFAULT_OFFICIAL_USERS];
  }
};

// In-memory sync fallback for offline/demo reliability
let localSubmissions: Submission[] = getStoredSubmissions();
let localResidents: Resident[] = getStoredResidents();

export const ArchiveService = {
  // Seed default official user accounts to Firestore if not already present
  async seedInitialDataIfNeeded(): Promise<void> {
    try {
      // --- 1. Seed users collection ---
      const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
      const existingUserIds = new Set(usersSnap.docs.map(d => d.id));

      const usersBatch = writeBatch(db);
      let hasNewUsers = false;
      for (const user of DEFAULT_OFFICIAL_USERS) {
        if (!existingUserIds.has(user.id)) {
          usersBatch.set(doc(db, USERS_COLLECTION, user.id), user);
          hasNewUsers = true;
        }
      }
      if (hasNewUsers) await usersBatch.commit();

      // Also ensure they are in localStorage
      const localUsers = getStoredUsers();
      const localIds = new Set(localUsers.map(u => u.id));
      const mergedUsers = [...localUsers];
      for (const user of DEFAULT_OFFICIAL_USERS) {
        if (!localIds.has(user.id)) mergedUsers.push(user);
      }
      localStorage.setItem('desa_registered_users', JSON.stringify(mergedUsers));

      // --- 2. Seed admins collection (RBAC lookup table) ---
      const adminsSnap = await getDocs(collection(db, ADMINS_COLLECTION));
      const existingAdminIds = new Set(adminsSnap.docs.map(d => d.id));

      const adminsBatch = writeBatch(db);
      let hasNewAdmins = false;
      for (const user of DEFAULT_OFFICIAL_USERS) {
        if ((user.role === 'admin' || user.role === 'kades') && !existingAdminIds.has(user.id)) {
          adminsBatch.set(doc(db, ADMINS_COLLECTION, user.id), {
            userId: user.id,
            email: user.email,
            role: user.role
          });
          hasNewAdmins = true;
        }
      }
      if (hasNewAdmins) await adminsBatch.commit();

      // --- 3. Sync any local submissions not yet in Firestore ---
      const subsSnap = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
      const existingSubIds = new Set(subsSnap.docs.map(d => d.id));
      const localSubs = getStoredSubmissions();
      const newSubs = localSubs.filter(s => !existingSubIds.has(s.id));
      if (newSubs.length > 0) {
        const CHUNK = 450;
        for (let i = 0; i < newSubs.length; i += CHUNK) {
          const b = writeBatch(db);
          newSubs.slice(i, i + CHUNK).forEach(s => b.set(doc(db, SUBMISSIONS_COLLECTION, s.id), s));
          await b.commit();
        }
      }

      // --- 4. Sync any local residents not yet in Firestore ---
      const resSnap = await getDocs(collection(db, RESIDENTS_COLLECTION));
      const existingResIds = new Set(resSnap.docs.map(d => d.id));
      const localRes = getStoredResidents();
      const newRes = localRes.filter(r => !existingResIds.has(r.id));
      if (newRes.length > 0) {
        const CHUNK = 450;
        for (let i = 0; i < newRes.length; i += CHUNK) {
          const b = writeBatch(db);
          newRes.slice(i, i + CHUNK).forEach(r => b.set(doc(db, RESIDENTS_COLLECTION, r.id), r));
          await b.commit();
        }
      }
    } catch {
      // Firestore not available - local storage will still have the official users
    }
  },

  // 1. Submissions Operations
  async getSubmissions(userId?: string, role?: string): Promise<Submission[]> {
    try {
      const snap = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
      const firestoreItems = !snap.empty ? snap.docs.map(d => sanitizeSubmission({ id: d.id, ...d.data() } as Submission)) : [];
      const currentLocal = getStoredSubmissions();
      const map = new Map<string, Submission>();
      currentLocal.forEach(s => map.set(s.id, s));
      firestoreItems.forEach(s => map.set(s.id, s));

      let all = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (role === 'warga') {
        if (!userId) return [];
        all = all.filter(s => s.userId === userId);
      }
      return all;
    } catch (err) {
      console.warn('Error fetching Firestore submissions, using local cache:', err);
      const currentLocal = getStoredSubmissions();
      if (role === 'warga') {
        if (!userId) return [];
        return currentLocal.filter(s => s.userId === userId);
      }
      return currentLocal;
    }
  },

  listenSubmissions(
    userId: string | undefined,
    role: string | undefined,
    callback: (subs: Submission[]) => void
  ): () => void {
    const emitCombined = (firestoreItems: Submission[]) => {
      const currentLocal = getStoredSubmissions();
      const map = new Map<string, Submission>();
      currentLocal.forEach(s => map.set(s.id, s));
      firestoreItems.forEach(s => map.set(s.id, sanitizeSubmission(s)));

      let all = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (role === 'warga') {
        if (!userId) {
          callback([]);
          return;
        }
        all = all.filter(s => s.userId === userId);
      }
      callback(all);
    };

    // Immediately emit current data so user sees their new or existing records without waiting
    emitCombined([]);

    try {
      const colRef = collection(db, SUBMISSIONS_COLLECTION);
      return onSnapshot(
        colRef,
        (snap) => {
          const items = snap.docs.map(d => sanitizeSubmission({ id: d.id, ...d.data() } as Submission));
          emitCombined(items);
        },
        (error) => {
          console.warn('Firestore listen note:', error);
          emitCombined([]);
        }
      );
    } catch {
      emitCombined([]);
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

    // 1. Immediately store in local cache & storage so it is 100% recorded
    localSubmissions = [newSubmission, ...localSubmissions.filter(s => s.id !== newId)];
    saveStoredSubmissions(localSubmissions);

    // 2. Persist to Firestore database
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
      }
      await setDoc(doc(db, SUBMISSIONS_COLLECTION, newId), newSubmission);
    } catch (err) {
      console.warn('Firestore write notice (handled):', err);
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
      if (!auth.currentUser) {
        await signInAnonymously(auth).catch(() => {});
      }
      // Use setDoc with merge: true so it succeeds even if document was created locally or offline
      await setDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId), updates, { merge: true });
    } catch (err) {
      console.warn('Firestore update notice (fallback to local):', err);
    }

    // sync local & storage
    localSubmissions = localSubmissions.map(s => s.id === submissionId ? { ...s, ...updates } : s);
    saveStoredSubmissions(localSubmissions);
  },

  async deleteSubmission(submissionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, submissionId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${SUBMISSIONS_COLLECTION}/${submissionId}`);
    }
    localSubmissions = localSubmissions.filter(s => s.id !== submissionId);
    saveStoredSubmissions(localSubmissions);
  },

  // 2. Residents Operations (Master Kependudukan)
  async getResidents(): Promise<Resident[]> {
    try {
      const snap = await getDocs(collection(db, RESIDENTS_COLLECTION));
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident));
        localResidents = items;
        saveStoredResidents(items);
        return items;
      }
      return getStoredResidents();
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, RESIDENTS_COLLECTION);
      return getStoredResidents();
    }
  },

  listenResidents(callback: (residents: Resident[]) => void): () => void {
    try {
      const colRef = collection(db, RESIDENTS_COLLECTION);
      return onSnapshot(
        colRef,
        (snap) => {
          if (!snap.empty) {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resident));
            localResidents = items;
            saveStoredResidents(items);
            callback(items);
          } else {
            callback(getStoredResidents());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, RESIDENTS_COLLECTION);
          callback(getStoredResidents());
        }
      );
    } catch {
      callback(getStoredResidents());
      return () => {};
    }
  },

  async saveResident(resident: Resident): Promise<void> {
    try {
      await setDoc(doc(db, RESIDENTS_COLLECTION, resident.id), resident);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${RESIDENTS_COLLECTION}/${resident.id}`);
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

    // 1. Immediately merge with local in-memory cache and localStorage
    const map = new Map<string, Resident>();
    localResidents.forEach((r) => map.set(r.id, r));
    newResidents.forEach((r) => map.set(r.id, r));
    localResidents = Array.from(map.values());
    saveStoredResidents(localResidents);

    // 2. Persist to Firestore in batches of 450
    try {
      const BATCH_SIZE = 450;
      for (let i = 0; i < newResidents.length; i += BATCH_SIZE) {
        const chunk = newResidents.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((resident) => {
          const docRef = doc(db, RESIDENTS_COLLECTION, resident.id);
          batch.set(docRef, resident);
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore batch write notice (fallback to local):', err);
    }
  },

  async deleteResident(residentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, RESIDENTS_COLLECTION, residentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${RESIDENTS_COLLECTION}/${residentId}`);
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
      const snapRes = await getDocs(collection(db, RESIDENTS_COLLECTION));
      for (const d of snapRes.docs) {
        await deleteDoc(d.ref);
      }
      const snapSub = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
      for (const d of snapSub.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      // ignore
    }
  },

  // 3. User Profile Operations
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, USERS_COLLECTION, userId));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${USERS_COLLECTION}/${userId}`);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, USERS_COLLECTION, profile.id), profile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${USERS_COLLECTION}/${profile.id}`);
    }
    // Sync local storage registered users list
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
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
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
      const snap = await getDocs(collection(db, USERS_COLLECTION));
      const firestoreUsers = snap.docs.map(d => d.data() as UserProfile);
      const map = new Map<string, UserProfile>();
      localUsers.forEach(u => map.set(u.id, u));
      firestoreUsers.forEach(u => map.set(u.id, u));
      return Array.from(map.values());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, USERS_COLLECTION);
      return localUsers;
    }
  },

  // Helper to generate Official Registration Number: REG-474.X / NoUrut / ARSIP-BJL / BulanRomawi / Tahun
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

  // Backward compatibility alias
  generateSuratNumber(type: SubmissionType, sequence: number = 1): string {
    return this.generateNomorRegistrasi(type, sequence);
  }
};
