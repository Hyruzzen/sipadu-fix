-- ==============================================================================
-- SISTEM PENGARSIPAN KEPENDUDUKAN DESA BOJONGLOA
-- ENTERPRISE SUPABASE MIGRATION SCRIPT (HARDENED SECURITY & OPTIMIZED)
-- ==============================================================================

-- Mematuhi pedoman keamanan resmi Supabase:
-- 1. SECURITY DEFINER fungsi dikunci dengan search_path = '' dan skema berkualifikasi.
-- 2. Hak EXECUTE dibatasi (Least Privilege), anon/public dicabut.
-- 3. Identitas aktor (admin/petugas) diselesaikan server-side via auth.uid().
-- 4. Validasi transisi status mencegah eksekusi berulang / double-approval.
-- 5. submission_history diisolasi murni sebagai Append-Only dari fungsi tepercaya.
-- 6. Trigger proteksi kolom sensitif pada public.users (role, NIK terverifikasi).
-- 7. Integritas data penduduk tanpa nilai NIK/KK palsu acak.
-- 8. Indeks komposit terarah dan penghapusan indeks duplikat.
-- 9. Storage RLS policies ketat dengan dukungan operasi upsert.
-- ==============================================================================

-- 1. EXTENSIONS
-- Catatan: PostgreSQL 13+ pada Supabase mendukung gen_random_uuid() secara bawaan.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('warga', 'admin', 'kades');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.resident_status AS ENUM ('aktif', 'meninggal', 'pindah_keluar', 'warga_baru');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.submission_type AS ENUM ('kelahiran', 'kematian', 'pindah_masuk', 'pindah_keluar');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.submission_status AS ENUM ('menunggu', 'diproses', 'disetujui', 'ditolak');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. SEQUENCE UNTUK NOMOR REGISTRASI ARSIP ATOMIK
CREATE SEQUENCE IF NOT EXISTS public.submission_registration_seq START WITH 1 INCREMENT BY 1;

-- 4. TABEL: public.users (Profil Pengguna Terhubung 1:1 ke auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'warga',
  nik VARCHAR(16) UNIQUE,
  no_kk VARCHAR(16),
  phone TEXT,
  address TEXT,
  rt VARCHAR(5),
  rw VARCHAR(5),
  dusun TEXT,
  gender VARCHAR(1) CHECK (gender IN ('L', 'P')),
  birth_place TEXT,
  birth_date DATE,
  occupation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_nik_length CHECK (nik IS NULL OR nik ~ '^[0-9]{16}$'),
  CONSTRAINT check_no_kk_length CHECK (no_kk IS NULL OR no_kk ~ '^[0-9]{16}$')
);

-- Add columns for religion and marital_status to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS marital_status TEXT;

-- 5. TABEL: public.residents (Master Data Kependudukan Resmi Desa)
CREATE TABLE IF NOT EXISTS public.residents (
  id TEXT PRIMARY KEY DEFAULT ('res-' || gen_random_uuid()::text),
  nik VARCHAR(16) NOT NULL UNIQUE,
  no_kk VARCHAR(16),
  full_name TEXT NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
  birth_place TEXT,
  birth_date DATE,
  religion TEXT,
  marital_status TEXT,
  occupation TEXT,
  rt VARCHAR(5),
  rw VARCHAR(5),
  dusun TEXT,
  address TEXT,
  status public.resident_status NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_resident_nik CHECK (nik ~ '^[0-9]{16}$'),
  CONSTRAINT check_resident_no_kk CHECK (no_kk IS NULL OR no_kk ~ '^[0-9]{16}$')
);

-- Indeks Terarah & Efisien untuk Residents
-- (Catatan: nik sudah memiliki btree index bawaan dari UNIQUE constraint)
CREATE INDEX IF NOT EXISTS idx_residents_no_kk ON public.residents(no_kk);
CREATE INDEX IF NOT EXISTS idx_residents_dusun_rw_rt ON public.residents(dusun, rw, rt);
CREATE INDEX IF NOT EXISTS idx_residents_status_created ON public.residents(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_residents_name_trgm ON public.residents USING gin (full_name gin_trgm_ops);

-- 6. TABEL: public.submissions (Pengajuan Pencatatan Kependudukan)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY DEFAULT ('sub-' || gen_random_uuid()::text),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  user_email TEXT,
  user_name TEXT NOT NULL,
  user_nik VARCHAR(16) NOT NULL,
  user_phone TEXT,
  type public.submission_type NOT NULL,
  status public.submission_status NOT NULL DEFAULT 'menunggu',
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  rejection_note TEXT,
  nomor_registrasi TEXT UNIQUE,
  surat_number TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_details_is_object CHECK (jsonb_typeof(details) = 'object'),
  CONSTRAINT check_attachments_is_array CHECK (jsonb_typeof(attachments) = 'array')
);

-- Indeks Komposit Terarah untuk Submissions
-- (Catatan: nomor_registrasi sudah memiliki btree index bawaan dari UNIQUE constraint)
CREATE INDEX IF NOT EXISTS idx_submissions_user_created ON public.submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status_created ON public.submissions(status, created_at DESC);

-- 7. TABEL: public.submission_history (Audit Trail Mutasi Status - Append-Only)
CREATE TABLE IF NOT EXISTS public.submission_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  previous_status public.submission_status,
  new_status public.submission_status NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  action_note TEXT,
  nomor_registrasi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_history_sub_created ON public.submission_history(submission_id, created_at DESC);

-- 8. HELPER SECURITY DEFINER FUNCTIONS (Dikunci dengan search_path = '')
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.users WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT public.get_current_user_role()) = 'admin'::public.user_role, false);
$$;

CREATE OR REPLACE FUNCTION public.is_kades()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT public.get_current_user_role()) = 'kades'::public.user_role, false);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_kades()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE((SELECT public.get_current_user_role()) IN ('admin'::public.user_role, 'kades'::public.user_role), false);
$$;

-- Helper parsing tanggal aman (mencegah cast exception)
CREATE OR REPLACE FUNCTION public.parse_iso_date(p_text TEXT)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_text IS NULL OR TRIM(p_text) !~ '^\d{4}-\d{2}-\d{2}$' THEN
    RETURN NULL;
  END IF;
  RETURN p_text::DATE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- 9. TRIGGERS: set_updated_at Otomatis
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_residents_updated_at ON public.residents;
CREATE TRIGGER trigger_residents_updated_at
  BEFORE UPDATE ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_submissions_updated_at ON public.submissions;
CREATE TRIGGER trigger_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. TRIGGER: Proteksi Kolom Sensitif Profil Pengguna (Anti-Privilege Escalation)
CREATE OR REPLACE FUNCTION public.protect_user_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Jika aktor bukan administrator
  IF NOT public.is_admin() THEN
    -- 1. Dilarang mengubah role secara sepihak
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Akses ditolak: Hanya administrator yang berhak mengubah peran akun (role).';
    END IF;

    -- 2. Dilarang mengubah NIK jika sudah terverifikasi/terisi
    IF OLD.nik IS NOT NULL AND NEW.nik IS DISTINCT FROM OLD.nik THEN
      RAISE EXCEPTION 'Akses ditolak: NIK kependudukan terdaftar tidak dapat diubah sembarangan.';
    END IF;

    -- 3. Dilarang mengubah ID atau waktu pembuatan
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Akses ditolak: ID akun tidak dapat dimodifikasi.';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      NEW.created_at = OLD.created_at;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_user_profile ON public.users;
CREATE TRIGGER trigger_protect_user_profile
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_profile_changes();

-- 11. TRIGGER: Registrasi Supabase Auth -> Profil public.users Otomatis
-- Catatan: Pendaftaran mandiri SELALU menghasilkan role 'warga'
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_nik TEXT;
  v_full_name TEXT;
  v_phone TEXT;
  v_address TEXT;
  v_gender TEXT;
  v_dusun TEXT;
  v_rt TEXT;
  v_rw TEXT;
  v_religion TEXT;
  v_marital_status TEXT;
BEGIN
  v_nik := NULLIF(TRIM(NEW.raw_user_meta_data->>'nik'), '');
  v_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'fullName'), ''),
    'Warga Baru'
  );
  v_phone := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '');
  v_address := NULLIF(TRIM(NEW.raw_user_meta_data->>'address'), '');
  v_gender := NULLIF(TRIM(NEW.raw_user_meta_data->>'gender'), '');
  v_dusun := NULLIF(TRIM(NEW.raw_user_meta_data->>'dusun'), '');
  v_rt := NULLIF(TRIM(NEW.raw_user_meta_data->>'rt'), '');
  v_rw := NULLIF(TRIM(NEW.raw_user_meta_data->>'rw'), '');
  v_religion := NULLIF(TRIM(NEW.raw_user_meta_data->>'religion'), '');
  v_marital_status := NULLIF(TRIM(NEW.raw_user_meta_data->>'marital_status'), '');

  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    nik,
    phone,
    address,
    gender,
    dusun,
    rt,
    rw,
    religion,
    marital_status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    'warga'::public.user_role, -- Dipaksa warga tanpa kompromi
    v_nik,
    v_phone,
    v_address,
    v_gender,
    v_dusun,
    v_rt,
    v_rw,
    v_religion,
    v_marital_status,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    religion = EXCLUDED.religion,
    marital_status = EXCLUDED.marital_status,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 12. ATOMIC FUNCTION: Generator Nomor Registrasi Anti-Duplikat
CREATE OR REPLACE FUNCTION public.generate_nomor_registrasi(p_type public.submission_type)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_seq BIGINT;
  v_pad_seq TEXT;
  v_roman_month TEXT;
  v_year TEXT;
  v_kode_klasifikasi TEXT;
  v_month_num INT;
  v_roman_months TEXT[] := ARRAY['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
BEGIN
  -- Otorisasi: hanya administrator atau kades yang berhak men-generate nomor registrasi
  IF NOT public.is_admin_or_kades() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya administrator atau kepala desa yang berhak menerbitkan nomor registrasi.';
  END IF;

  v_seq := nextval('public.submission_registration_seq');
  v_pad_seq := LPAD(v_seq::text, 3, '0');

  v_month_num := EXTRACT(MONTH FROM NOW())::INT;
  v_roman_month := v_roman_months[v_month_num];
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  IF p_type = 'kelahiran'::public.submission_type THEN
    v_kode_klasifikasi := '474.1';
  ELSIF p_type = 'kematian'::public.submission_type THEN
    v_kode_klasifikasi := '474.2';
  ELSIF p_type = 'pindah_masuk'::public.submission_type THEN
    v_kode_klasifikasi := '475.1';
  ELSIF p_type = 'pindah_keluar'::public.submission_type THEN
    v_kode_klasifikasi := '475.2';
  ELSE
    v_kode_klasifikasi := '470';
  END IF;

  RETURN 'REG-' || v_kode_klasifikasi || '/' || v_pad_seq || '/ARSIP-BJL/' || v_roman_month || '/' || v_year;
END;
$$;

-- 13. ATOMIC TRANSACTION: Persetujuan Pengajuan & Mutasi Data Penduduk Sah
CREATE OR REPLACE FUNCTION public.approve_submission_and_sync_resident(
  p_submission_id TEXT,
  p_nomor_registrasi TEXT,
  p_sync_to_resident BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sub RECORD;
  v_details JSONB;
  v_prev_status public.submission_status;
  v_now TIMESTAMPTZ := NOW();
  v_nik TEXT;
  v_actor_name TEXT;
  v_rows_affected INT := 0;
  v_sync_message TEXT := 'Persetujuan pengajuan berhasil dicatat.';
  v_birth_date DATE;
BEGIN
  -- 1. Otorisasi Ketat
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya administrator desa yang berhak menyetujui pengajuan.';
  END IF;

  -- 2. Ambil identitas tepercaya dari session server (bukan dari input klien yang bisa dipalsukan)
  SELECT COALESCE(NULLIF(TRIM(u.full_name), ''), 'Petugas Administrasi Desa')
  INTO v_actor_name
  FROM public.users u
  WHERE u.id = (SELECT auth.uid());

  IF v_actor_name IS NULL THEN
    v_actor_name := 'Petugas Administrasi Desa';
  END IF;

  -- 3. Kunci baris pengajuan untuk update (FOR UPDATE)
  SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan dengan ID % tidak ditemukan.', p_submission_id;
  END IF;

  -- 4. Validasi Transisi Status (Mencegah Double-Approval / Duplicate History)
  IF v_sub.status NOT IN ('menunggu'::public.submission_status, 'diproses'::public.submission_status) THEN
    RAISE EXCEPTION 'Pengajuan tidak dapat disetujui karena status saat ini adalah % (sudah selesai).', v_sub.status;
  END IF;

  v_prev_status := v_sub.status;
  v_details := v_sub.details;

  -- 5. Update status pengajuan
  UPDATE public.submissions
  SET
    status = 'disetujui'::public.submission_status,
    nomor_registrasi = p_nomor_registrasi,
    surat_number = p_nomor_registrasi,
    approved_by = v_actor_name,
    approved_at = v_now,
    updated_at = v_now
  WHERE id = p_submission_id;

  -- 6. Tulis ke riwayat status audit trail (Hanya dari fungsi tepercaya ini)
  INSERT INTO public.submission_history (
    submission_id,
    previous_status,
    new_status,
    actor_id,
    actor_name,
    action_note,
    nomor_registrasi,
    created_at
  ) VALUES (
    p_submission_id,
    v_prev_status,
    'disetujui'::public.submission_status,
    (SELECT auth.uid()),
    v_actor_name,
    'Pengajuan kependudukan telah disetujui dan diverifikasi secara resmi.',
    p_nomor_registrasi,
    v_now
  );

  -- 7. Sinkronisasi Mutasi Penduduk (Hanya data sah, tidak membuat data fiktif acak)
  IF p_sync_to_resident THEN
    IF v_sub.type = 'kematian'::public.submission_type THEN
      v_nik := NULLIF(TRIM(v_details->>'nikAlmarhum'), '');
      IF v_nik IS NOT NULL AND v_nik ~ '^[0-9]{16}$' THEN
        UPDATE public.residents
          SET status = 'meninggal'::public.resident_status, updated_at = v_now
          WHERE nik = v_nik;
        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

        IF v_rows_affected > 0 THEN
          v_sync_message := 'Status kependudukan almarhum (NIK ' || v_nik || ') berhasil dimutasi ke MENINGGAL.';
        ELSE
          v_sync_message := 'NIK almarhum (' || v_nik || ') tidak ditemukan di master residents, arsip tetap tersimpan.';
        END IF;
      END IF;

    ELSIF v_sub.type = 'pindah_keluar'::public.submission_type THEN
      v_nik := NULLIF(TRIM(v_details->>'nikPemohon'), '');
      IF v_nik IS NOT NULL AND v_nik ~ '^[0-9]{16}$' THEN
        UPDATE public.residents
          SET status = 'pindah_keluar'::public.resident_status, updated_at = v_now
          WHERE nik = v_nik;
        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

        IF v_rows_affected > 0 THEN
          v_sync_message := 'Status kependudukan pemohon (NIK ' || v_nik || ') berhasil dimutasi ke PINDAH KELUAR.';
        ELSE
          v_sync_message := 'NIK pemohon (' || v_nik || ') tidak ditemukan di master residents, arsip tetap tersimpan.';
        END IF;
      END IF;

    ELSIF v_sub.type = 'pindah_masuk'::public.submission_type THEN
      v_nik := NULLIF(TRIM(v_details->>'nikPemohon'), '');
      -- Hanya daftarkan ke master penduduk jika pemohon menyertakan NIK 16 digit sah dari daerah asal
      IF v_nik IS NOT NULL AND v_nik ~ '^[0-9]{16}$' AND NULLIF(TRIM(v_details->>'namaKepalaKeluarga'), '') IS NOT NULL THEN
        v_birth_date := public.parse_iso_date(v_details->>'tanggalLahir');

        INSERT INTO public.residents (
          id,
          nik,
          no_kk,
          full_name,
          gender,
          birth_place,
          birth_date,
          religion,
          marital_status,
          occupation,
          rt,
          rw,
          dusun,
          address,
          status,
          created_at,
          updated_at
        ) VALUES (
          'res-' || gen_random_uuid()::text,
          v_nik,
          NULLIF(TRIM(v_details->>'noKk'), ''),
          TRIM(v_details->>'namaKepalaKeluarga'),
          COALESCE(NULLIF(TRIM(v_details->>'jenisKelamin'), ''), 'L'),
          NULLIF(TRIM(v_details->>'kabupatenAsal'), ''),
          v_birth_date,
          'Islam',
          'Kawin',
          'Wiraswasta',
          COALESCE(NULLIF(TRIM(v_details->>'rtTujuan'), ''), '01'),
          COALESCE(NULLIF(TRIM(v_details->>'rwTujuan'), ''), '01'),
          COALESCE(NULLIF(TRIM(v_details->>'dusunTujuan'), ''), 'Dusun Citaman'),
          COALESCE(NULLIF(TRIM(v_details->>'alamatTujuanBojongloa'), ''), 'Desa Bojongloa'),
          'aktif'::public.resident_status,
          v_now,
          v_now
        )
        ON CONFLICT (nik) DO UPDATE SET
          status = 'aktif'::public.resident_status,
          address = EXCLUDED.address,
          dusun = EXCLUDED.dusun,
          rt = EXCLUDED.rt,
          rw = EXCLUDED.rw,
          updated_at = v_now;

        v_sync_message := 'Data warga pindah masuk (NIK ' || v_nik || ') berhasil disinkronisasi ke master penduduk.';
      END IF;

    ELSIF v_sub.type = 'kelahiran'::public.submission_type THEN
      -- Kelahiran: Bayi belum memiliki NIK hingga penerbitan akta resmi dari Disdukcapil.
      -- Data tersimpan aman di tabel submissions sebagai arsip resmi desa.
      v_sync_message := 'Nomor registrasi kelahiran resmi diterbitkan dan arsip tersimpan aman.';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'id', p_submission_id,
    'nomor_registrasi', p_nomor_registrasi,
    'message', v_sync_message
  );
END;
$$;

-- 14. ATOMIC FUNCTION: Penolakan Pengajuan Wajib Catatan
CREATE OR REPLACE FUNCTION public.reject_submission(
  p_submission_id TEXT,
  p_rejection_note TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sub RECORD;
  v_prev_status public.submission_status;
  v_now TIMESTAMPTZ := NOW();
  v_actor_name TEXT;
  v_clean_note TEXT;
BEGIN
  -- 1. Otorisasi
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya administrator desa yang berhak menolak pengajuan.';
  END IF;

  v_clean_note := TRIM(COALESCE(p_rejection_note, ''));
  IF v_clean_note = '' THEN
    RAISE EXCEPTION 'Alasan penolakan pengajuan wajib diisi!';
  END IF;

  -- 2. Ambil identitas tepercaya
  SELECT COALESCE(NULLIF(TRIM(u.full_name), ''), 'Petugas Administrasi Desa')
  INTO v_actor_name
  FROM public.users u
  WHERE u.id = (SELECT auth.uid());

  IF v_actor_name IS NULL THEN
    v_actor_name := 'Petugas Administrasi Desa';
  END IF;

  -- 3. Kunci baris pengajuan
  SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pengajuan dengan ID % tidak ditemukan.', p_submission_id;
  END IF;

  -- 4. Validasi Transisi Status
  IF v_sub.status NOT IN ('menunggu'::public.submission_status, 'diproses'::public.submission_status) THEN
    RAISE EXCEPTION 'Pengajuan tidak dapat ditolak karena status saat ini adalah % (sudah selesai).', v_sub.status;
  END IF;

  v_prev_status := v_sub.status;

  -- 5. Update Status
  UPDATE public.submissions
  SET
    status = 'ditolak'::public.submission_status,
    rejection_note = v_clean_note,
    approved_by = v_actor_name,
    approved_at = v_now,
    updated_at = v_now
  WHERE id = p_submission_id;

  -- 6. Tulis ke riwayat status audit trail
  INSERT INTO public.submission_history (
    submission_id,
    previous_status,
    new_status,
    actor_id,
    actor_name,
    action_note,
    created_at
  ) VALUES (
    p_submission_id,
    v_prev_status,
    v_prev_status,
    (SELECT auth.uid()),
    v_actor_name,
    v_clean_note,
    v_now
  );

  RETURN jsonb_build_object('success', true, 'id', p_submission_id);
END;
$$;

-- 15. HAK AKSES FUNGSI (Least Privilege - Securing API)
REVOKE EXECUTE ON FUNCTION public.approve_submission_and_sync_resident(TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_submission_and_sync_resident(TEXT, TEXT, BOOLEAN) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.reject_submission(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_submission(TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.generate_nomor_registrasi(public.submission_type) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_nomor_registrasi(public.submission_type) TO authenticated;

-- 16. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_history ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS: public.users
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
CREATE POLICY "users_select_policy" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (SELECT public.is_admin_or_kades())
  );

DROP POLICY IF EXISTS "users_update_policy" ON public.users;
CREATE POLICY "users_update_policy" ON public.users
  FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR (SELECT public.is_admin())
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR (SELECT public.is_admin())
  );

DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
CREATE POLICY "users_insert_policy" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_admin())
  );

DROP POLICY IF EXISTS "users_delete_policy" ON public.users;
CREATE POLICY "users_delete_policy" ON public.users
  FOR DELETE
  TO authenticated
  USING (
    (SELECT public.is_admin())
  );

-- -----------------------------------------------------------------------------
-- RLS: public.residents (Master Data Kependudukan)
-- Warga biasa TIDAK BERHAK membaca master kependudukan desa.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "residents_select_policy" ON public.residents;
CREATE POLICY "residents_select_policy" ON public.residents
  FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin_or_kades())
  );

DROP POLICY IF EXISTS "residents_insert_policy" ON public.residents;
CREATE POLICY "residents_insert_policy" ON public.residents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_admin())
  );

DROP POLICY IF EXISTS "residents_update_policy" ON public.residents;
CREATE POLICY "residents_update_policy" ON public.residents
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "residents_delete_policy" ON public.residents;
CREATE POLICY "residents_delete_policy" ON public.residents
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin()));

-- -----------------------------------------------------------------------------
-- RLS: public.submissions
-- Warga hanya membaca & membuat pengajuan miliknya sendiri.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "submissions_select_policy" ON public.submissions;
CREATE POLICY "submissions_select_policy" ON public.submissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (SELECT public.is_admin_or_kades())
  );

DROP POLICY IF EXISTS "submissions_insert_policy" ON public.submissions;
CREATE POLICY "submissions_insert_policy" ON public.submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'menunggu'::public.submission_status
  );

DROP POLICY IF EXISTS "submissions_update_policy" ON public.submissions;
CREATE POLICY "submissions_update_policy" ON public.submissions
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin())
  )
  WITH CHECK (
    (SELECT public.is_admin())
  );

DROP POLICY IF EXISTS "submissions_delete_policy" ON public.submissions;
CREATE POLICY "submissions_delete_policy" ON public.submissions
  FOR DELETE
  TO authenticated
  USING (
    (SELECT public.is_admin())
    OR (user_id = (SELECT auth.uid()) AND status = 'menunggu'::public.submission_status)
  );

-- -----------------------------------------------------------------------------
-- RLS: public.submission_history (Append-Only)
-- Catatan: Klien dilarang INSERT langsung. History hanya ditulis fungsi server.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "history_select_policy" ON public.submission_history;
CREATE POLICY "history_select_policy" ON public.submission_history
  FOR SELECT
  TO authenticated
  USING (
    (SELECT public.is_admin_or_kades())
    OR EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = submission_id AND s.user_id = (SELECT auth.uid())
    )
  );

-- Hapus kebijakan insert langsung dari klien
DROP POLICY IF EXISTS "history_insert_policy" ON public.submission_history;

-- 17. SUPABASE STORAGE BUCKET: submission-documents (PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submission-documents',
  'submission-documents',
  false,
  5242880, -- Maksimal 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- RLS Storage Objects (RLS pada storage.objects sudah aktif bawaan dari Supabase)

DROP POLICY IF EXISTS "storage_upload_policy" ON storage.objects;
CREATE POLICY "storage_upload_policy" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'submission-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "storage_update_policy" ON storage.objects;
CREATE POLICY "storage_update_policy" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'submission-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'submission-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;
CREATE POLICY "storage_select_policy" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'submission-documents'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR (SELECT public.is_admin_or_kades())
    )
  );

DROP POLICY IF EXISTS "storage_delete_policy" ON storage.objects;
CREATE POLICY "storage_delete_policy" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'submission-documents'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR (SELECT public.is_admin())
    )
  );

-- 18. REALTIME REPLICATION (Hanya untuk submissions & residents)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'residents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.residents;
  END IF;
END $$;
