-- ==============================================================================
-- SKEMA TABEL SUPABASE UNTUK SISTEM PENGARSIPAN KEPENDUDUKAN DESA BOJONGLOA
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Tabel users (Profil Pengguna: Admin, Kades, Staf, Warga)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT,
  "fullName" TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'warga',
  nik TEXT,
  "noKk" TEXT,
  phone TEXT,
  address TEXT,
  rt TEXT,
  rw TEXT,
  dusun TEXT,
  gender TEXT,
  "birthPlace" TEXT,
  "birthDate" TEXT,
  occupation TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel residents (Master Data Kependudukan Desa Bojongloa)
CREATE TABLE IF NOT EXISTS public.residents (
  id TEXT PRIMARY KEY,
  nik TEXT NOT NULL UNIQUE,
  "noKk" TEXT,
  "fullName" TEXT NOT NULL,
  gender TEXT NOT NULL,
  "birthPlace" TEXT,
  "birthDate" TEXT,
  religion TEXT,
  "maritalStatus" TEXT,
  occupation TEXT,
  rt TEXT,
  rw TEXT,
  dusun TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'aktif',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel submissions (Pencatatan & Arsip Kependudukan)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "userEmail" TEXT,
  "userName" TEXT NOT NULL,
  "userNik" TEXT NOT NULL,
  "userPhone" TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu',
  title TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  attachments TEXT DEFAULT '[]',
  "rejectionNote" TEXT,
  "nomorRegistrasi" TEXT,
  "suratNumber" TEXT,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Aktifkan Row Level Security (RLS) dan Izinkan Read/Write Publik untuk Aplikasi Desa
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policy untuk users
CREATE POLICY "Public access to users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Policy untuk residents
CREATE POLICY "Public access to residents" ON public.residents
  FOR ALL USING (true) WITH CHECK (true);

-- Policy untuk submissions
CREATE POLICY "Public access to submissions" ON public.submissions
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Aktifkan Realtime Replication untuk submissions & residents
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.residents;
