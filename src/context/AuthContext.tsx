import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, supabaseServiceRole } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  loginWithNik: (nikOrIdentifier: string, password: string) => Promise<UserProfile>;
  register: (userData: {
    fullName: string;
    nik: string;
    gender: 'L' | 'P';
    email: string;
    phone?: string;
    password: string;
    dusun: string;
    rt: string;
    rw: string;
    address: string;
    religion?: string;
    maritalStatus?: string;
  }) => Promise<UserProfile>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Map a row from the `users` table to the UserProfile TypeScript type.
 */
export const mapDbUserToProfile = (row: any): UserProfile => ({
  id: row.id,
  email: row.email || '',
  fullName: row.full_name || '',
  role: (row.role as UserRole) || 'warga',
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
  religion: row.religion || undefined,
  maritalStatus: row.marital_status || undefined,
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString()
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  let isMounted = false;

  /** Fetch a fresh profile from the `users` table by auth user ID. */
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Gagal memuat profil pengguna dari Supabase:', error.message);
        return null;
      }
      return data ? mapDbUserToProfile(data) : null;
    } catch (err) {
      console.warn('Error saat mengambil profil:', err);
      return null;
    }
  };

  // Initialize auth session and profile on app mount
  useEffect(() => {
    isMounted = true;

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session?.user) {
        setSupabaseUser(session.user);
        const fetched = await fetchProfile(session.user.id);
        if (isMounted) {
          setProfile(fetched ?? null);
          setRole(fetched?.role ?? null);
          setLoading(false);
        }
      } else {
        setSupabaseUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    };

    initialize();

    // Subscribe to auth state changes (login, logout, token refresh)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setSupabaseUser(session.user);
        const fetched = await fetchProfile(session.user.id);
        if (isMounted) {
          setProfile(fetched ?? null);
          setRole(fetched?.role ?? null);
          setLoading(false);
        }
      } else {
        setSupabaseUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Log in with NIK or email and password.
   * Auth is handled entirely by Supabase Auth; we then fetch the public profile.
   */
  const loginWithNik = async (nikOrIdentifier: string, password: string): Promise<UserProfile> => {
    const identifier = nikOrIdentifier.trim();
    const passwordTrim = password.trim();

    if (!identifier) {
      throw new Error('Nomor Induk Kependudukan (NIK) atau Email wajib diisi.');
    }
    if (!passwordTrim) {
      throw new Error('Kata sandi wajib diisi.');
    }

    let email = identifier;
    // Check if identifier looks like an email (simple heuristic: contains '@' and a dot after '@')
    const isEmail = identifier.includes('@') && identifier.split('@')[1].includes('.');
    if (!isEmail) {
      // Treat as NIK: look up email from the users table
      const { data, error } = await (supabaseServiceRole ?? supabase)
        .from('users')
        .select('email')
        .eq('nik', identifier)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          throw new Error('NIK tidak ditemukan');
        } else {
          throw error;
        }
      }
      if (!data || !data.email) {
        throw new Error('Email tidak ditemukan untuk NIK ini');
      }
      email = data.email;
    }

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: passwordTrim
    });

    if (signInError) {
      const errMsg = signInError.message.toLowerCase();
      if (errMsg.includes('email not confirmed')) {
        throw new Error('Email akun belum terkonfirmasi. Silakan verifikasi email Anda melalui link yang dikirim oleh Supabase.');
      }
      if (errMsg.includes('invalid login credentials')) {
        throw new Error('NIK/Email atau kata sandi tidak cocok. Pastikan akun sudah terdaftar dan kata sandi benar.');
      }
      throw new Error(`Gagal masuk: ${signInError.message}`);
    }

    if (!authData.user) {
      throw new Error('Autentikasi gagal: tidak ada data pengguna yang dikembalikan.');
    }

    // Load profile from the public `users` table
    const userProfile = await fetchProfile(authData.user.id);
    if (!userProfile) {
      // Fallback: create a minimal profile while waiting for trigger/db sync
      const fallback: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || email,
        fullName: authData.user.user_metadata?.full_name || '',
        role: 'warga',
        nik: isEmail ? undefined : identifier,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // Optionally set the fallback in state so UI shows something immediately
      setProfile(fallback);
      setRole('warga');
      return fallback;
    }

    return userProfile;
  };

  /**
   * Register a new resident.
   * Steps:
   *   1. Validate NIK (16 digits), password (min 6 chars), and email (required, contains '@').
   *   2. Create auth account with email = `${inputEmail}`.
   *   3. Wait briefly for the `on_auth_user_created` trigger to create a row in `users`.
   *   4. Fetch that user profile.
   *   5. Upsert a row into `residents` with the submitted biodata.
   *   6. Return the user profile (from `users`).
   */
  const register = async (userData: {
    fullName: string;
    nik: string;
    gender: 'L' | 'P';
    email: string;
    phone?: string;
    password: string;
    dusun: string;
    rt: string;
    rw: string;
    address: string;
    religion?: string;
    maritalStatus?: string;
  }): Promise<UserProfile> => {
    const { fullName, nik, gender, email, phone, password, dusun, rt, rw, address, religion, maritalStatus } = userData;

    const cleanNik = nik.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // ---- Validation ----
    if (cleanNik.length !== 16 || !/^\d{16}$/.test(cleanNik)) {
      throw new Error('Nomor NIK harus tepat 16 digit angka sesuai KTP.');
    }
    if (cleanPassword.length < 6) {
      throw new Error('Kata sandi minimal 6 karakter.');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Email harus diisi dan berformat valid (contoh: nama@domain.com).');
    }

    // ---- Check if NIK already exists in residents table ----
    const { data: existingResident, error: residentCheckError } = await supabase
      .from('residents')
      .select('nik')
      .eq('nik', cleanNik)
      .single();

    if (residentCheckError && residentCheckError.code !== 'PGRST116') {
      // PGRST116 means no rows returned (not an error we care about)
      console.warn('Error checking NIK uniqueness:', residentCheckError);
    }
    if (existingResident) {
      throw new Error('NIK ini sudah terdaftar di sistem. Silakan langsung masuk menggunakan kata sandi Anda.');
    }

    // ---- Step 2: Create auth account with INPUT EMAIL ----
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail, // <-- use email from form
      password: cleanPassword,
      options: {
        data: {
          nik: cleanNik,
          fullName: fullName.trim(),
          phone: phone?.trim() ?? '',
          address: address?.trim() ?? '',
          gender,
          dusun,
          rt,
          rw,
          religion: religion ?? undefined,
          maritalStatus: maritalStatus ?? undefined
        }
      }
    });

    if (signUpError) {
      const errMsg = signUpError.message.toLowerCase();
      if (errMsg.includes('already registered')) {
        throw new Error('Email yang Anda masukkan sudah terdaftar. Silakan langsung masuk menggunakan email dan kata sandi Anda.');
      }
      throw new Error(`Gagal mendaftar: ${signUpError.message}`);
    }

    if (!authData.user) {
      throw new Error('Pendaftaran selesai, namun akun pengguna belum dapat diinisialisasi.');
    }

    const uid = authData.user.id;

    // ---- Step 3: Wait briefly for trigger to populate `users` table ----
    await new Promise(res => setTimeout(res, 500));

    // ---- Step 4: Fetch the user profile from `users` ----
    let userProfile = await fetchProfile(uid);
    if (!userProfile) {
      // Fallback minimal profile (should rarely happen)
      userProfile = {
        id: uid,
        email: authData.user.email || cleanEmail,
        fullName: fullName.trim(),
        role: 'warga',
        nik: cleanNik,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // Set temporary state so UI doesn't show empty
      setProfile(userProfile);
      setRole('warga');
    }

    // ---- Step 5: Upsert biodata into `residents` table (create if not exists, update if exists) ----
    try {
      await supabase.from('residents').upsert([
        {
          nik: cleanNik,
          full_name: fullName.trim(),
          gender,
          phone: phone?.trim() ?? null,
          address: address?.trim() ?? null,
          dusun,
          rt: rt ?? '01',
          rw: rw ?? '01',
          // Fields we may not have during registration – leave as NULL
          birth_place: null,
          birth_date: null,
          occupation: null,
          // Note: email column not inserted here; add column to residents table if needed
          status: 'aktif',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'nik' });
    } catch (residentError) {
      // If upserting into residents fails, we still have an auth account and a user profile.
      // Log the error but do not fail the registration – the resident row can be added later.
      console.warn('Gagal menyimpan atau memperbarui biodata ke tabel residents:', residentError);
    }

    // Ensure we have the latest profile (in case the trigger updated something)
    userProfile = await fetchProfile(uid) ?? userProfile;
    if (isMounted) {
      setProfile(userProfile);
      setRole(userProfile.role);
    }
    return userProfile;
  };

  /**
   * Update the logged‑in user's profile (fields allowed by the UI).
   */
  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;

    const dbPayload: Record<string, any> = {};
    if (updated.fullName !== undefined) dbPayload.full_name = updated.fullName;
    if (updated.phone !== undefined) dbPayload.phone = updated.phone;
    if (updated.address !== undefined) dbPayload.address = updated.address;
    if (updated.rt !== undefined) dbPayload.rt = updated.rt;
    if (updated.rw !== undefined) dbPayload.rw = updated.rw;
    if (updated.dusun !== undefined) dbPayload.dusun = updated.dusun;
    if (updated.gender !== undefined) dbPayload.gender = updated.gender;
    if (updated.birthPlace !== undefined) dbPayload.birth_place = updated.birthPlace;
    if (updated.birthDate !== undefined) dbPayload.birth_date = updated.birthDate;
    if (updated.occupation !== undefined) dbPayload.occupation = updated.occupation;
    if (updated.noKk !== undefined) dbPayload.no_kk = updated.noKk;
    if (updated.religion !== undefined) dbPayload.religion = updated.religion;
    if (updated.maritalStatus !== undefined) dbPayload.maritalStatus = updated.maritalStatus;

    const { error } = await supabase
      .from('users')
      .update(dbPayload)
      .eq('id', profile.id);

    if (error) {
      throw new Error(`Gagal memperbarui profil: ${error.message}`);
    }

    // Refresh profile from DB
    const refreshed = await fetchProfile(profile.id);
    if (refreshed) {
      setProfile(refreshed);
    }
  };

  /** Log out the user and clear auth/session state. */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Notice saat logout:', err);
    }
    setSupabaseUser(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        supabaseUser,
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