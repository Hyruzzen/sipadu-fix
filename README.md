# Sistem Informasi Pengarsipan Kependudukan Desa Bojongloa

Aplikasi pengarsipan kependudukan dan pelayanan surat keterangan mandiri untuk **Pemerintah Desa Bojongloa, Kecamatan Rancaekek, Kabupaten Bandung**.

## Teknologi yang Digunakan
- **Frontend**: React 19 + TypeScript + Vite 6
- **UI & Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Autentikasi**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Deployment**: Vercel (Hobby Free Plan) / Firebase Hosting

---

## Panduan Deploy ke Vercel (Gratis 100%)

### Cara 1: Deploy Lewat GitHub (Sangat Direkomendasikan)
1. **Push Source Code ke GitHub**:
   - Buat repository baru di [GitHub](https://github.com/new) (misal: `arsip-desa-bojongloa`).
   - Push seluruh kode ke repository tersebut:
     ```bash
     git add .
     git commit -m "feat: inisialisasi arsip desa bojongloa"
     git branch -M main
     git remote add origin https://github.com/USERNAME/arsip-desa-bojongloa.git
     git push -u origin main
     ```

2. **Hubungkan ke Vercel**:
   - Buka [vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
   - Klik tombol **"Add New..."** -> **"Project"**.
   - Pilih repository `arsip-desa-bojongloa` yang baru dibuat dan klik **"Import"**.

3. **Pengaturan Build & Output**:
   - **Framework Preset**: Vite (terdeteksi otomatis berkat `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - File konfigurasi `vercel.json` sudah disediakan untuk memastikan routing SPA (*Single Page Application*) berjalan mulus tanpa error 404 saat *refresh* halaman.

4. **Environment Variables (Opsional)**:
   - Aplikasi sudah otomatis menggunakan konfigurasi bawaan `firebase-applet-config.json`.
   - Jika ingin mengatur ulang variabel di Vercel Dashboard, Anda dapat menambahkan variabel dari `.env.example`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_FIRESTORE_DATABASE_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`

5. **Deploy**:
   - Klik tombol **"Deploy"**.
   - Tunggu sekitar 1 menit hingga proses build selesai.
   - Website Anda langsung aktif dengan domain bawaan Vercel atau dapat langsung dihubungkan dengan domain resmi dari **DomaiNesia**!

---

## Menghubungkan Domain dari DomaiNesia

Jika Anda telah membeli domain di **DomaiNesia** (misal: `arsipdesabojongloa.id` atau `arsip.bojongloa.desa.id`), Anda dapat menghubungkannya dengan mudah:
- **Panduan Lengkap**: Buka dokumen khusus [**PANDUAN_DOMAINESIA.md**](./PANDUAN_DOMAINESIA.md).
- **DNS Record DomaiNesia**:
  - Untuk Domain Utama (`@`): Buat **A Record** mengarah ke `76.76.21.21`
  - Untuk Subdomain atau `www`: Buat **CNAME Record** mengarah ke `cname.vercel-dns.com.`
- File `.htaccess` untuk hosting langsung di cPanel DomaiNesia juga telah disediakan di folder `public/`.

---

### Cara 2: Deploy Menggunakan Vercel CLI
Jika Anda memiliki Node.js di komputer:
```bash
# 1. Install Vercel CLI global
npm install -g vercel

# 2. Jalankan perintah deploy
vercel

# 3. Ikuti instruksi di terminal (pilih default untuk semua pertanyaan)
# 4. Untuk deploy ke production:
vercel --prod
```

---

## Keamanan Repositori Publik (GitHub Public Repo)

Proyek ini telah dikonfigurasi agar **aman 100% dipublikasikan ke GitHub secara Public**:
- **Tidak ada file rahasia yang terunggah**: File `.gitignore` telah dikonfigurasi secara ketat untuk mengecualikan semua file `.env*`, kunci privat (*.pem, *.key), kredensial service account, dan log.
- **Pembersihan Template Environment**: File `.env.example` hanya memuat placeholder aman (*dummy values*) sehingga tidak memicu notifikasi peringatan *GitHub Secret Scanning*.
- **Keamanan Server Firestore (`firestore.rules`)**: Basis data dilindungi oleh aturan otorisasi berbasis peran (RBAC). Data kependudukan pribadi (*PII*) hanya dapat diakses oleh Admin dan Kades. Warga dilarang memanipulasi status pengajuan atau menaikkan hak akses secara mandiri.
- **Panduan Selengkapnya**: Silakan baca dokumen panduan lengkap di [`KEAMANAN.md`](./KEAMANAN.md).

---

## Akun Pengguna Terdaftar (3 Role & Kata Sandi)

Untuk pengujian aplikasi, tersedia 3 akun resmi dengan peran berbeda yang dapat langsung digunakan pada form login:

| No | Peran / Jabatan | Nama Pengguna | NIK (Nomor KTP) | Kata Sandi | Hak Akses Utama |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Warga** | **Asep Saepudin** | `3204121503920001` | `password123` | Pengajuan surat mandiri, upload berkas, pantau status, cetak surat mandiri, profil KTP digital. |
| 2 | **Admin Desa** | **Asep Kurniawan, S.A.P.**<br>*(Kasi Pelayanan)* | `3204121208840001` | `password123` | Verifikasi & approval surat, penomoran otomatis `474.X/...`, master data kependudukan, cetak laporan bulanan/tahunan. |
| 3 | **Kepala Desa** | **H. Maman Suryaman, S.Sos.**<br>*(Kepala Desa Bojongloa)* | `3204121405710001` | `password123` | Dashboard eksekutif kependudukan, pengawasan antrean layanan, monitoring & cetak laporan resmi desa. |

> **Tips:** Pada modal login, terdapat tombol jalan pintas *(Pilih &rarr;)* untuk mengisi NIK dan Kata Sandi secara otomatis dengan satu kali klik.

---

## Fitur Berdasarkan Peran (3 Role)
1. **Warga**:
   - Pengajuan Surat (Kelahiran, Kematian, Pindah Masuk, Pindah Keluar).
   - Unggah lampiran berkas persyaratan (KTP, KK, Surat Pengantar RT/RW).
   - Riwayat pengajuan *real-time* (Catatan penolakan jika ditolak, unduh & cetak surat jika disetujui).
   - Profil identitas digital penduduk & pengaturan notifikasi.
2. **Admin Desa**:
   - Dashboard analitik & antrean verifikasi mendesak.
   - Verifikasi pengajuan (Setujui -> terbit nomor surat resmi otomatis; Tolak -> wajib isi catatan penolakan).
   - Master data kependudukan Bojongloa (tambah, ubah, hapus, filter, ekspor CSV).
   - Laporan Mutasi Kependudukan Bulanan & Tahunan (siap cetak resmi).
   - Manajemen akun & otorisasi role sistem.
3. **Kepala Desa (Kades)**:
   - Dashboard eksekutif laju pertumbuhan demografi & efektivitas layanan arsip.
   - Akses penuh Laporan Kependudukan Bulanan & Tahunan (read-only monitoring).
