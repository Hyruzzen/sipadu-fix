# Panduan Memindahkan Domain dari Railway ke Vercel

Panduan langkah demi langkah memindahkan domain kustom (custom domain) yang sebelumnya terhubung ke **Railway** agar beralih ke **Vercel**.

---

## Ringkasan Alur Pemindahan
```
[1. Hapus di Railway] ➔ [2. Tambah di Vercel] ➔ [3. Ubah DNS di Registrar] ➔ [4. Verifikasi & SSL]
```

---

## Langkah 1: Lepaskan (Hapus) Domain dari Railway
Langkah ini penting agar tidak terjadi konflik sertifikat SSL dan routing.

1. Buka dashboard [Railway.app](https://railway.app) dan login ke akun Anda.
2. Buka **Project** dan klik **Service** tempat domain lama Anda terpasang.
3. Klik tab **Settings** pada service tersebut.
4. Gulir ke bawah ke bagian **Networking** / **Custom Domains**.
5. Klik ikon **titik tiga (...)** atau tombol **Delete / Remove** di sebelah domain Anda.
6. Konfirmasi penghapusan domain dari Railway.

---

## Langkah 2: Tambahkan Domain ke Proyek Vercel

1. Buka dashboard [Vercel.com](https://vercel.com) dan login.
2. Pilih proyek aplikasi Arsip Desa Bojongloa Anda.
3. Masuk ke tab **Settings** (di menu atas) ➔ pilih menu **Domains** (di sidebar kiri).
4. Masukkan nama domain Anda pada kolom input:
   - Contoh domain utama: `desabojongloa.id` (Vercel akan merekomendasikan menambahkan redirect `www.desabojongloa.id`).
   - Atau contoh subdomain: `arsip.desabojongloa.id`.
5. Klik tombol **Add**.
6. Vercel akan menampilkan instruksi DNS Record yang harus dipasang (berupa **A Record** atau **CNAME**).

---

## Langkah 3: Perbarui DNS Records di Penyedia Domain (Registrar)
Buka tempat di mana Anda membeli domain (misalnya **DomaiNesia**, **Niagahoster**, **Cloudflare**, atau **Namecheap**):

1. Login ke panel penyedia domain Anda (contoh: *Client Area DomaiNesia*).
2. Masuk ke menu **Domain** ➔ **DNS Management** (Kelola DNS).
3. **Hapus Record Lama Railway**:
   - Cari CNAME record lama yang mengarah ke Railway (biasanya berupa `xxxx.up.railway.app`) dan **Hapus (Delete)** record tersebut.
4. **Tambahkan Record Baru Vercel**:

### A. Jika Menggunakan Domain Utama (Apex Domain / misal: `desabojongloa.id`):
| Tipe Record | Name / Host | Target / Nilai (Value) | TTL |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (atau kosong) | `76.76.21.21` | Auto / 3600 |
| **CNAME** | `www` | `cname.vercel-dns.com.` | Auto / 3600 |

### B. Jika Menggunakan Subdomain (misal: `arsip.desabojongloa.id`):
| Tipe Record | Name / Host | Target / Nilai (Value) | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `arsip` | `cname.vercel-dns.com.` | Auto / 3600 |

5. Klik **Simpan** / **Save Changes**.

---

## Langkah 4: Verifikasi & Penerbitan SSL di Vercel

1. Kembali ke tab **Settings ➔ Domains** di Vercel.
2. Vercel akan otomatis mendeteksi perubahan DNS (atau klik tombol **Refresh**).
3. Setelah DNS terdeteksi (biasanya 5–15 menit):
   - Status akan berubah menjadi **Valid Configuration** dengan ikon centang hijau.
   - Sertifikat SSL (HTTPS) gratis dari Let's Encrypt akan otomatis dipasang oleh Vercel.
4. Coba akses domain Anda di peramban web (browser).

---

## Langkah 5: Sinkronisasi ke Firebase & Google Cloud

Pastikan domain baru Anda diizinkan untuk sistem otentikasi dan API:

1. **Firebase Authentication Authorized Domains**:
   - Buka [Firebase Console](https://console.firebase.google.com).
   - Masuk ke proyek Anda ➔ **Authentication** ➔ tab **Settings** ➔ **Authorized domains**.
   - Klik **Add domain** dan tambahkan domain baru Anda (misal: `desabojongloa.id`).
2. **Google Cloud API Key Restrictions (Jika ada)**:
   - Buka [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
   - Pada API Key yang digunakan, pastikan Website Restriction mengizinkan:
     - `https://desabojongloa.id/*`
     - `https://*.desabojongloa.id/*`

---

## Troubleshooting (Kendala yang Sering Terjadi)
- **Error: *"Cannot add desabojongloa.my.id since it's already in use by one of your projects"***:
  - **Penyebab**: Domain tersebut pernah Anda pasang di proyek Vercel Anda yang lain (misalnya proyek lama, repositori uji coba, atau deployment sebelumnya). Di Vercel, 1 domain hanya boleh menempel ke 1 proyek aktif.
  - **Solusi**:
    1. Buka [Dashboard Vercel](https://vercel.com/dashboard).
    2. Masuk ke menu **Settings** akun/tim (atau langsung buka daftar semua proyek).
    3. Cari proyek lama yang menampung domain `desabojongloa.my.id`.
    4. Buka proyek tersebut ➔ **Settings** ➔ **Domains** ➔ klik tombol titik tiga (`...`) atau **Delete / Remove** pada domain `desabojongloa.my.id`.
    5. Setelah terhapus dari proyek lama, kembali ke proyek baru Anda ➔ **Settings** ➔ **Domains** ➔ ketik `desabojongloa.my.id` lagi dan klik **Add**. Domain akan berhasil ditambahkan tanpa error.
- **Status "Invalid Configuration" di Vercel**: Propagasi DNS di internet membutuhkan waktu hingga 10–30 menit (maksimal 24 jam tergantung ISP). Silakan bersabar dan klik *Refresh* berkala.
- **Masih Mengarah ke Halaman Railway**: Bersihkan cache browser Anda (*Clear browser cache*) atau gunakan mode *Incognito/Private Browsing*, atau lakukan *flush DNS* di komputer (`ipconfig /flushdns` di Windows).
