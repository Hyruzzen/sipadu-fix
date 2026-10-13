import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as fbSignOut,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { ArchiveService } from '../services/archiveService';
import { DESA_INFO } from '../data/mockData';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  loginWithNik: (nik: string, password?: string) => Promise<UserProfile>;
  register: (userData: {
    fullName: string;
    nik: string;
    gender: 'L' | 'P';
    email: string;
    phone: string;
    password?: string;
    dusun: string;
    rt: string;
    rw: string;
    address: string;
  }) => Promise<UserProfile>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Official account directory by NIK and Email
const OFFICIAL_ACCOUNTS: Record<string, UserProfile> = {
  // Warga Demo: Asep Saepudin
  '3204121503920001': {
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
  },
  // Admin Demo: Kasi Pelayanan Desa
  '3204121208840001': {
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
  // Kades Demo: H. Maman Suryaman
  '3204121405710001': {
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
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local/session storage for logged-in user
    const storedUser = localStorage.getItem('desa_current_user') || sessionStorage.getItem('desa_current_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile(parsed);
        setRole(parsed.role);
      } catch {
        setProfile(null);
        setRole(null);
      }
    }

    // Seed initial collections lazily in background only after initial paint
    const timer = setTimeout(async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch {
        // ignore offline / auth error
      }
      ArchiveService.seedInitialDataIfNeeded();
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && !user.isAnonymous) {
        const isUserAdmin = user.email === 'ajamjamaludin45@gmail.com' || user.email?.toLowerCase().includes('admin');
        const isUserKades = user.email?.toLowerCase().includes('kades');

        let userRole: UserRole = 'warga';
        if (isUserAdmin) userRole = 'admin';
        else if (isUserKades) userRole = 'kades';

        try {
          const existingProfile = await ArchiveService.getUserProfile(user.uid);
          if (existingProfile) {
            setProfile(existingProfile);
            setRole(existingProfile.role);
            sessionStorage.setItem('desa_current_user', JSON.stringify(existingProfile));
          } else {
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || 'user@bojongloa.desa.id',
              fullName: user.displayName || 'Warga Desa Bojongloa',
              role: userRole,
              nik: '320412' + Math.floor(1000000000 + Math.random() * 9000000000),
              noKk: '320412' + Math.floor(1000000000 + Math.random() * 9000000000),
              phone: user.phoneNumber || '0812' + Math.floor(10000000 + Math.random() * 90000000),
              address: 'Desa Bojongloa RT 01/RW 01',
              rt: '01',
              rw: '01',
              dusun: 'Dusun Bojongloa Pusat',
              gender: 'L',
              birthPlace: 'Bandung',
              birthDate: '1990-01-01',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await ArchiveService.saveUserProfile(newProfile);
            setProfile(newProfile);
            setRole(newProfile.role);
            sessionStorage.setItem('desa_current_user', JSON.stringify(newProfile));
          }
        } catch {
          // ignore
        }
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  // Login strictly via NIK and Password
  const loginWithNik = async (nikOrIdentifier: string, passwordInput?: string): Promise<UserProfile> => {
    const cleanNik = nikOrIdentifier.trim();
    const cleanPassword = (passwordInput || '').trim();

    if (!cleanNik) {
      throw new Error('Nomor Induk Kependudukan (NIK) wajib diisi.');
    }
    if (!cleanPassword) {
      throw new Error('Kata sandi wajib diisi.');
    }

    // Check local registered cache first (from localStorage and sessionStorage)
    let localRegisteredList: UserProfile[] = [];
    try {
      const stored = localStorage.getItem('desa_registered_users') || sessionStorage.getItem('desa_registered_users');
      if (stored) localRegisteredList = JSON.parse(stored);
    } catch {
      // ignore
    }

    // 1. Check locally registered users by NIK (including any accounts created or updated via Manajemen Akun)
    const locallyRegistered = localRegisteredList.find((u) => u.nik === cleanNik);
    if (locallyRegistered) {
      if (locallyRegistered.password && cleanPassword !== locallyRegistered.password) {
        throw new Error('Kata sandi salah. Silakan periksa kembali kata sandi akun Anda.');
      }
      setProfile(locallyRegistered);
      setRole(locallyRegistered.role);
      localStorage.setItem('desa_current_user', JSON.stringify(locallyRegistered));
      sessionStorage.setItem('desa_current_user', JSON.stringify(locallyRegistered));
      // Ensure Firebase Auth session exists so Firestore writes are authorized
      if (!auth.currentUser) signInAnonymously(auth).catch(() => {});
      return locallyRegistered;
    }

    // 2. Search database users from Firestore or archiveService
    try {
      const allUsers = await ArchiveService.getAllUsers();
      const foundUser = allUsers.find(
        (u) => (u.nik && u.nik === cleanNik) || u.email.toLowerCase() === cleanNik.toLowerCase()
      );

      if (foundUser) {
        if (foundUser.password && cleanPassword !== foundUser.password) {
          throw new Error('Kata sandi salah. Silakan periksa kembali kata sandi akun Anda.');
        }
        setProfile(foundUser);
        setRole(foundUser.role);
        localStorage.setItem('desa_current_user', JSON.stringify(foundUser));
        sessionStorage.setItem('desa_current_user', JSON.stringify(foundUser));
        // Ensure Firebase Auth session exists so Firestore writes are authorized
        if (!auth.currentUser) signInAnonymously(auth).catch(() => {});
        return foundUser;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Kata sandi salah')) {
        throw err;
      }
    }

    // 3. Fallback check official accounts by NIK
    if (OFFICIAL_ACCOUNTS[cleanNik]) {
      const acc = OFFICIAL_ACCOUNTS[cleanNik];
      if (acc.password && cleanPassword !== acc.password) {
        throw new Error('Kata sandi salah. Silakan periksa kembali kata sandi akun Anda.');
      }
      setProfile(acc);
      setRole(acc.role);
      localStorage.setItem('desa_current_user', JSON.stringify(acc));
      sessionStorage.setItem('desa_current_user', JSON.stringify(acc));
      // Ensure Firebase Auth session exists so Firestore writes are authorized
      if (!auth.currentUser) signInAnonymously(auth).catch(() => {});
      return acc;
    }

    // 4. Search Master Residents if citizen already in population database
    try {
      const allResidents = await ArchiveService.getResidents();
      const residentMatch = allResidents.find((r) => r.nik === cleanNik);
      if (residentMatch) {
        const citizenUser: UserProfile = {
          id: 'user-' + residentMatch.id,
          email: `${residentMatch.nik}@desa-bojongloa.id`,
          fullName: residentMatch.fullName,
          role: 'warga',
          nik: residentMatch.nik,
          gender: residentMatch.gender,
          birthPlace: residentMatch.birthPlace,
          birthDate: residentMatch.birthDate,
          occupation: residentMatch.occupation,
          dusun: residentMatch.dusun,
          rt: residentMatch.rt,
          rw: residentMatch.rw,
          address: residentMatch.address,
          password: cleanPassword, // adopt supplied password
          createdAt: residentMatch.createdAt,
          updatedAt: new Date().toISOString()
        };
        try {
          await ArchiveService.saveUserProfile(citizenUser);
        } catch {
          // continue with local profile
        }
        setProfile(citizenUser);
        setRole('warga');
        sessionStorage.setItem('desa_current_user', JSON.stringify(citizenUser));
        return citizenUser;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Kata sandi salah')) {
        throw err;
      }
      // Firestore query error caught, proceed to fallback error message below
    }

    // If 16 digit NIK is entered but not yet registered:
    throw new Error('Nomor NIK belum terdaftar di sistem. Silakan klik tab "Daftar Warga Baru" untuk mendaftar akun.');
  };

  const register = async (userData: {
    fullName: string;
    nik: string;
    gender: 'L' | 'P';
    email: string;
    phone: string;
    password?: string;
    dusun: string;
    rt: string;
    rw: string;
    address: string;
  }): Promise<UserProfile> => {
    const now = new Date().toISOString();
    const newCitizenProfile: UserProfile = {
      id: 'warga-' + userData.nik,
      fullName: userData.fullName,
      nik: userData.nik,
      gender: userData.gender, // Gender stored (L or P)
      email: userData.email,
      phone: userData.phone,
      password: userData.password || 'password123', // Password saved
      dusun: userData.dusun,
      rt: userData.rt,
      rw: userData.rw,
      address: userData.address,
      role: 'warga', // Registered citizens are strictly 'warga'
      createdAt: now,
      updatedAt: now
    };

    // Cache immediately in local storage & session storage for persistent offline/fast access
    try {
      const stored = localStorage.getItem('desa_registered_users') || sessionStorage.getItem('desa_registered_users');
      const list: UserProfile[] = stored ? JSON.parse(stored) : [];
      // avoid duplicates
      const filtered = list.filter((u) => u.nik !== newCitizenProfile.nik);
      filtered.push(newCitizenProfile);
      localStorage.setItem('desa_registered_users', JSON.stringify(filtered));
      sessionStorage.setItem('desa_registered_users', JSON.stringify(filtered));
    } catch {
      // ignore
    }

    setProfile(newCitizenProfile);
    setRole('warga');
    localStorage.setItem('desa_current_user', JSON.stringify(newCitizenProfile));
    sessionStorage.setItem('desa_current_user', JSON.stringify(newCitizenProfile));

    // Save to Firestore in background with timeout safety so user registration never hangs
    Promise.race([
      ArchiveService.saveUserProfile(newCitizenProfile),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500))
    ]).catch((err) => {
      console.warn('Background sync to Firestore skipped or timed out:', err);
    });

    return newCitizenProfile;
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    const newProf: UserProfile = {
      ...profile,
      ...updated,
      updatedAt: new Date().toISOString()
    };
    setProfile(newProf);
    if (newProf.role) {
      setRole(newProf.role);
    }
    sessionStorage.setItem('desa_current_user', JSON.stringify(newProf));
    try {
      await ArchiveService.saveUserProfile(newProf);
    } catch (err) {
      console.warn('Could not persist profile to server:', err);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // Ignore
    }
    localStorage.removeItem('desa_current_user');
    sessionStorage.removeItem('desa_current_user');
    setFirebaseUser(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        role,
        loading,
        loginWithNik,
        register,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
