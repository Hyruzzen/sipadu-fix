# Panduan Menghubungkan Domain dari DomaiNesia

Panduan lengkap untuk memasang domain resmi yang dibeli dari **DomaiNesia** (misalnya `arsipdesabojongloa.id`, `bojongloa.desa.id`, atau `arsip.bojongloa.desa.id`) ke aplikasi Arsip Desa Bojongloa.

Terdapat 2 opsi yang dapat Anda pilih sesuai dengan layanan yang Anda sewa di DomaiNesia:
1. **Opsi 1 (Direkomendasikan)**: Domain dari DomaiNesia dihubungkan ke hosting gratis Vercel (Gratis biaya server, performa kilat CDN global).
2. **Opsi 2**: Domain + Web Hosting cPanel langsung di DomaiNesia.

---

## Opsi 1: Menghubungkan Domain DomaiNesia ke Vercel (Terbaik & Cepat)

Pada opsi ini, Anda hanya perlu membeli **Domain** di DomaiNesia, sedangkan hosting aplikasinya tetap berjalan di Vercel secara gratis dengan SSL/HTTPS otomatis.

### Langkah 1: Tambahkan Domain di Dashboard Vercel
1. Buka dashboard proyek Anda di [Vercel](https://vercel.com).
2. Masuk ke menu **Settings** ➔ **Domains**.
3. Ketikkan nama domain yang Anda miliki dari DomaiNesia:
   - Contoh Domain Utama: `arsipdesabojongloa.id` (Vercel akan menyarankan menambahkan `www.arsipdesabojongloa.id` juga).
   - Atau Contoh Subdomain: `arsip.bojongloa.desa.id`
4. Klik tombol **Add**.
5. Vercel akan menampilkan tabel DNS Record yang perlu Anda pasang di DomaiNesia (A Record atau CNAME).

---

### Langkah 2: Atur DNS di DomaiNesia

1. Login ke **Client Area DomaiNesia** di [https://my.domainesia.com](https://my.domainesia.com).
2. Klik menu **Domains** di sebelah kiri ➔ Pilih nama domain Anda.
3. Klik tab **DNS Management** (atau *Kelola DNS*).
4. Tambahkan DNS Record sesuai petunjuk berikut:

#### A. Jika Menggunakan Domain Utama (misal: `arsipdesabojongloa.id`):
| Jenis Record | Host / Nama | Nilai / Tujuan (Target) | TTL |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (atau kosong) | `76.76.21.21` | `14400` / Auto |
| **CNAME** | `www` | `cname.vercel-dns.com.` | `14400` / Auto |

#### B. Jika Menggunakan Subdomain (misal: `arsip.bojongloa.desa.id`):
| Jenis Record | Host / Nama | Nilai / Tujuan (Target) | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `arsip` | `cname.vercel-dns.com.` | `14400` / Auto |

5. Klik tombol **Simpan DNS** / **Save Changes**.

---

### Langkah 3: Verifikasi di Vercel
1. Kembali ke tab **Settings ➔ Domains** di Vercel.
2. Tunggu proses propagasi DNS (biasanya 5 hingga 30 menit).
3. Status di Vercel akan berubah menjadi centang hijau **Valid Configuration** dan sertifikat SSL/HTTPS akan diterbitkan otomatis.
4. Website desa kini dapat diakses dengan domain resmi DomaiNesia Anda!

---

## Opsi 2: Upload Langsung ke Web Hosting / cPanel DomaiNesia

Jika Anda berlangganan paket Web Hosting / Cloud Hosting cPanel di DomaiNesia:

### Langkah 1: Lakukan Build Proyek
Jalankan perintah build di komputer atau terminal:
```bash
npm run build
```
Proses ini akan menghasilkan folder **`dist/`** yang berisi seluruh file HTML, CSS, JavaScript yang siap produksi, beserta file **`.htaccess`** yang sudah otomatis terpasang untuk routing SPA.

### Langkah 2: Upload ke File Manager cPanel DomaiNesia
1. Buka **cPanel** DomaiNesia Anda.
2. Buka menu **File Manager**.
3. Masuk ke folder **`public_html`** (atau folder subdomain Anda).
4. Upload seluruh isi yang ada di dalam folder `dist/` ke dalam folder `public_html`.
5. Pastikan file `.htaccess` ikut terunggah (aktifkan *"Show Hidden Files (dotfiles)"* di Settings cPanel jika tidak terlihat).

> **Catatan:** File `.htaccess` telah kami sertakan di folder `public/.htaccess` sehingga saat pengunjung me-refresh halaman (misal `/arsip` atau `/surat`), web server Apache/LiteSpeed DomaiNesia tidak akan mengalami error 404 Not Found.

---

## Langkah Tambahan: Perbarui Pengaturan Domain di Firebase & Google Cloud

Agar fitur Login dan Firestore berjalan lancar pada domain baru Anda:

1. **Firebase Authorized Domains**:
   - Buka [Firebase Console](https://console.firebase.google.com).
   - Masuk ke **Authentication** ➔ **Settings** ➔ tab **Authorized domains**.
   - Klik **Add domain** dan masukkan domain Anda (misal `arsipdesabojongloa.id` atau `arsip.bojongloa.desa.id`).

2. **Google Cloud Referrer Restriction**:
   - Buka [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
   - Pada API Key Anda, tambahkan domain baru ke dalam HTTP Referrer list:
     - `https://arsipdesabojongloa.id/*`
     - `https://*.arsipdesabojongloa.id/*`
