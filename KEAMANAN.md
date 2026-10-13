# Panduan Keamanan Repositori Publik (GitHub Public Repo Security)

Dokumen ini menjelaskan arsitektur keamanan sistem **Arsip Desa Bojongloa** dan memberikan jaminan serta langkah-langkah memastikan repositori tetap aman 100% meskipun diatur sebagai **Public Repository** di GitHub.

---

## 1. Ringkasan Perlindungan Keamanan

| Komponen | Status Keamanan | Penjelasan |
| :--- | :---: | :--- |
| **File Rahasia (.env)** | **Aman** | `.gitignore` telah dikonfigurasi untuk mengecualikan semua file `.env`, `.env.local`, `.env.*.local`. Hanya `.env.example` dengan nilai *placeholder* yang masuk ke Git. |
| **Kunci Privat & Service Account** | **Aman** | File sensitif seperti `serviceAccountKey.json`, `firebase-adminsdk*.json`, `*.key`, `*.pem` otomatis diabaikan oleh `.gitignore`. |
| **Firebase Client Configuration** | **Aman** | Dalam aplikasi web modern berbasis Firebase, konfigurasi web (API Key, Project ID, App ID) merupakan pengenal publik sisi klien (*client-side identifier*). Keamanan data **tidak bergantung pada kerahasiaan API Key**, melainkan pada aturan keamanan server (**Firestore Security Rules**). |
| **Aturan Keamanan Basis Data (Firestore Rules)** | **Aman & Terkunci** | Database menerapkan aturan ketat (*least privilege* & *role-based access control*). Pengguna publik tidak dapat membaca atau menulis data tanpa hak otorisasi yang sah. |
| **Pencegahan Alert Secret Scanner** | **Aman** | File `.env.example` telah dibersihkan dari kunci asli sehingga tidak memicu sistem otomatis *GitHub Secret Scanning* / *GitGuardian*. |

---

## 2. Arsitektur Keamanan Firestore Rules (`firestore.rules`)

Aturan keamanan server telah diuji dan dideploy langsung ke Firebase Firestore:

1. **Prinsip Default Deny**:
   - Seluruh dokumen dan subkoleksi ditolak secara default (`allow read, write: if false;`).
   - Hanya permintaan terotentikasi yang memenuhi kriteria peran yang diizinkan.

2. **Privasi Data Penduduk (`/residents`)**:
   - Master arsip kependudukan (NIK, nama, tanggal lahir, alamat) **hanya dapat dibaca oleh Admin Desa dan Kepala Desa** (`allow read: if isSignedIn() && (isAdmin() || isKades());`).
   - Warga biasa atau pihak luar tidak dapat mengunduh daftar penduduk desa.
   - Penambahan, pengubahan, dan penghapusan data penduduk hanya dapat dilakukan oleh Admin.

3. **Integritas Pengajuan Surat (`/submissions`)**:
   - Warga hanya dapat melihat dan mengajukan permohonan atas nama akun mereka sendiri (`resource.data.userId == request.auth.uid`).
   - Warga dilarang memanipulasi status pengajuan menjadi `disetujui` atau menerbitkan nomor surat palsu (`incoming().status == 'menunggu'`).
   - Hanya Admin Desa yang berhak memproses, menyetujui, menerbitkan nomor surat, atau menolak permohonan.

4. **Kontrol Profil Akun (`/users`)**:
   - Pendaftaran mandiri dikunci hanya dengan peran `role: 'warga'`.
   - Pengguna dilarang mengubah perannya sendiri menjadi `admin` atau `kades` (*escalation prevention*).

---

## 3. Langkah Tambahan: Pembatasan API Key di Google Cloud Console (Sangat Dianjurkan)

Meskipun Firebase Web API Key aman untuk repositori publik, sebagai praktik terbaik *DevOps & Security Production*, Anda dapat membatasi penggunaan API Key agar hanya bisa diakses dari domain web Anda:

1. Buka [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials).
2. Pilih proyek Firebase Anda.
3. Klik nama API Key (misal: `Browser key` atau key yang digunakan Firebase).
4. Di bagian **Application restrictions**:
   - Pilih **Websites** (HTTP referrers).
   - Masukkan domain aplikasi Anda:
     - `https://arsipdesabojongloa.id/*` (Domain DomaiNesia)
     - `https://*.bojongloa.desa.id/*`
     - `https://*.vercel.app/*`
     - `http://localhost:*/*` (untuk pengujian lokal)
5. Di bagian **API restrictions**:
   - Pilih **Restrict key**.
   - Centang hanya layanan yang digunakan:
     - *Cloud Firestore API*
     - *Identity Toolkit API* (Firebase Auth)
     - *Firebase Storage API*
6. Klik **Save**.

Dengan pembatasan ini, siapa pun yang menyalin API key dari website Anda **tidak akan dapat menggunakannya dari domain atau aplikasi lain**.

---

## 4. Checklist Sebelum Melakukan `git push` ke GitHub Public:

- [x] Pastikan tidak ada file `.env` atau `.env.local` yang ter-track (`git status` bersih).
- [x] Periksa `.env.example` hanya berisi placeholder dummy (sudah diverifikasi).
- [x] File `.gitignore` sudah mencakup semua file kredensial dan cache.
- [x] `firestore.rules` sudah aktif dan terdeploy di Firebase project.
- [x] Form pendaftaran dan login terlindungi dengan validasi NIK 16 digit dan kata sandi.

Dengan konfigurasi ini, repositori Anda **100% aman** untuk dipublikasikan secara umum di GitHub.
