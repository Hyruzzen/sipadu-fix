export interface VillageArticle {
  id: string;
  title: string;
  slug: string;
  category: 'Berita Desa' | 'Berita Lokal' | 'Pemerintahan' | 'Kependudukan' | 'Pemberdayaan';
  date: string;
  author: string;
  readTime: string;
  summary: string;
  content: string[];
  imageUrl: string;
  sourceUrl?: string;
  featured?: boolean;
}

export const VILLAGE_ARTICLES: VillageArticle[] = [
  {
    id: 'art-1',
    title: 'Musyawarah Desa (Musdes) Rembuk Stunting Desa Bojongloa Bersama Camat Rancaekek',
    slug: 'musyawarah-desa-rembuk-stunting-desa-bojongloa',
    category: 'Berita Desa',
    date: '14 Juli 2026',
    author: 'Admin Desa Bojongloa',
    readTime: '3 menit baca',
    featured: true,
    sourceUrl: 'https://bojongloa.desa.id/artikel/2026/7/14/musyawarah-desa-rembuk-stunting-desa-bojongloa-1',
    summary: 'Pemerintah Desa Bojongloa menggelar Musyawarah Desa mengenai Rembuk Stunting di Aula Desa Bojongloa dihadiri oleh Camat Rancaekek Bapak Gugum Gumilar S.Sos., M.Si. beserta jajaran kader posyandu.',
    content: [
      'Bertempat di Kantor Desa Bojongloa, Kecamatan Rancaekek, Kabupaten Bandung, telah dilaksanakan kegiatan Musyawarah Desa (Musdes) mengenai Rembuk Stunting.',
      'Kegiatan strategis ini dihadiri langsung oleh Bapak Gugum Gumilar S.Sos., M.Si. selaku Camat Kecamatan Rancaekek, Kepala Desa Bojongloa H. Ayeng, jajaran Pemerintah Desa Bojongloa, Badan Permusyawaratan Desa (BPD), serta para kader kesehatan dan Posyandu di seluruh rukun warga Desa Bojongloa.',
      'Musdes Rembuk Stunting ini bertujuan merumuskan langkah konvergensi pencegahan dan percepatan penurunan stunting di tingkat desa, mencakup pemetaan sasaran ibu hamil, balita berisiko, serta penyaluran Pemberian Makanan Tambahan (PMT) bersumber dari Dana Desa.',
      'Melalui musyawarah ini, seluruh unsur kelembagaan desa berkomitmen memastikan tumbuh kembang anak-anak di Desa Bojongloa optimal dan bebas dari stunting.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'art-2',
    title: 'Terawih Keliling Bersama Bupati dan Wakil Bupati Bandung di Masjid Besar Rancaekek Desa Bojongloa',
    slug: 'terawih-keliling-bersama-bupati-dan-wakil-bupati-bandung-di-desa-bojongloa',
    category: 'Berita Lokal',
    date: '23 Februari 2026',
    author: 'Admin Desa Bojongloa',
    readTime: '3 menit baca',
    sourceUrl: 'https://bojongloa.desa.id/artikel/2026/02/23/terawih-keliling-bersama-bupati-dan-wakil-bupati-bandung-di-desa-bojongloa',
    summary: 'Kegiatan Terawih Keliling Safari Ramadhan Pemerintah Kabupaten Bandung bersama Bupati dan Wakil Bupati Bandung bertempat di Masjid Besar Rancaekek, Jl. Raya Rancaekek-Majalaya No. 45 Desa Bojongloa.',
    content: [
      'Bertempat di Masjid Besar Rancaekek, Jl. Raya Rancaekek-Majalaya No. 45, Desa Bojongloa, Kecamatan Rancaekek, Kabupaten Bandung diselenggarakan kegiatan Terawih Keliling bersama Bupati dan Wakil Bupati Bandung.',
      'Kegiatan ini merupakan salah satu agenda resmi rangkaian Safari Ramadhan Pemerintah Kabupaten Bandung dalam rangka mempererat tali silaturahmi antara pimpinan daerah dengan masyarakat dan alim ulama di wilayah Rancaekek.',
      'Pemerintah Desa Bojongloa bersama pengurus DKM Masjid Besar Rancaekek menyambut antusias kehadiran jajaran Forkopimda Kabupaten Bandung serta memfasilitasi jamaah warga desa yang memadati area ibadah dengan tertib dan khidmat.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'art-3',
    title: 'Musdes BUMDes di Awal Tahun 2026: Penguatan Tata Kelola Usaha dan Ekonomi Desa Bojongloa',
    slug: 'musdes-bumdes-di-awal-tahun-2026',
    category: 'Berita Lokal',
    date: '19 Februari 2026',
    author: 'Admin Desa Bojongloa',
    readTime: '3 menit baca',
    sourceUrl: 'https://bojongloa.desa.id/artikel/2026/02/19/musdes-bumdes-di-awal-tahun-2026',
    summary: 'Bertempat di Aula Desa Bojongloa diadakan Musyawarah BUMDes yang dihadiri Kepala Desa, Sekretaris Desa, Ketua BPD, Ketua BUMDes, dan tokoh masyarakat perwakilan seluruh RW.',
    content: [
      'Bertempat di Aula Kantor Desa Bojongloa, Kecamatan Rancaekek, Kabupaten Bandung, telah diselenggarakan Musyawarah Desa (Musdes) Badan Usaha Milik Desa (BUMDes) Bojongloa.',
      'Musyawarah ini dihadiri oleh Ketua BUMDes Desa Bojongloa, Kepala Desa Bojongloa H. Ayeng, Sekretaris Desa Bojongloa Endin Aminudin, S.Ag., Ketua BPD Desa Bojongloa Dadang Hidayat, serta para undangan perwakilan lembaga kemasyarakatan desa dan perwakilan dari setiap RW di Desa Bojongloa.',
      'Agenda utama musdes meliputi evaluasi laporan pertanggungjawaban unit usaha BUMDes, pemetaan potensi unit usaha baru berbasis potensi wilayah, dan penguatan kemitraan ekonomi warga demi peningkatan Pendapatan Asli Desa (PADes).'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'art-4',
    title: 'Layanan Adminduk Mobile di Desa Bojongloa: Perekaman KTP, KIA, Akta Kelahiran dan Kematian',
    slug: 'pelayanan-mobile-kependudukan-di-desa-bojongloa',
    category: 'Kependudukan',
    date: '22 Januari 2024',
    author: 'Admin Desa Bojongloa',
    readTime: '3 menit baca',
    sourceUrl: 'https://bojongloa.desa.id/artikel/2024/01/22/pelayanan-mobile-kependudukan-di-desa-bojongloa',
    summary: 'Pelayanan jemput bola dokumen administrasi kependudukan di Aula Kantor Desa Bojongloa guna mempermudah pengurusan identitas warga secara gratis dan terintegrasi.',
    content: [
      'Bertempat di Aula Kantor Desa Bojongloa, Kecamatan Rancaekek telah dilaksanakan Pelayanan Adminduk Mobile bekerjasama dengan Disdukcapil Kabupaten Bandung.',
      'Pelayanan langsung ini mencakup Perekaman KTP Elektronik bagi pemula, pencetakan Kartu Identitas Anak (KIA), penerbitan Akta Kelahiran, serta Akta Kematian bagi warga masyarakat Desa Bojongloa.',
      'Kehadiran loket mobile di kantor desa mendapat antusiasme tinggi karena sangat memudahkan warga mengurus dokumen resmi tanpa harus bepergian jauh ke kantor dinas kependudukan di Soreang.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'art-5',
    title: 'Pelatihan Kader Posyandu Desa Bojongloa Tingkatkan Kapasitas Layanan Kesehatan Balita & Lansia',
    slug: 'pelatihan-kader-posyandu-desa-bojongloa',
    category: 'Pemberdayaan',
    date: '05 Agustus 2025',
    author: 'Admin Desa Bojongloa',
    readTime: '3 menit baca',
    sourceUrl: 'https://bojongloa.desa.id/artikel/2025/08/05/pelatihan-kader-posyandu-desa-bojongloa',
    summary: 'Pemerintah Desa Bojongloa menyelenggarakan bimbingan teknis peningkatan kapasitas kader posyandu se-Desa Bojongloa dalam deteksi dini gizi buruk dan pencatatan antropometri.',
    content: [
      'Pemerintah Desa Bojongloa Kecamatan Rancaekek Kabupaten Bandung menyelenggarakan pelatihan dan peningkatan kapasitas bagi kader posyandu dari seluruh RW di wilayah Desa Bojongloa.',
      'Pelatihan difokuskan pada standarisasi pengukuran antropometri balita (panjang badan, tinggi badan, berat badan), pencatatan buku KIA terpadu, dan teknik komunikasi konseling gizi bagi orang tua.',
      'Dengan pembekalan berkelanjutan ini, akurasi data pemantauan tumbuh kembang anak di 6 posyandu Desa Bojongloa semakin valid dan terintegrasi dengan puskesmas pembina.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=75'
  },
  {
    id: 'art-6',
    title: 'Sosialisasi Perencanaan Tata Wilayah Desa dalam Rangka Penataan Kawasan Desa Bojongloa',
    slug: 'sosialisasi-perencanaan-tata-wilayah-desa-dalam-rangka-penataan-desa',
    category: 'Pemerintahan',
    date: '21 November 2024',
    author: 'Admin Desa Bojongloa',
    readTime: '4 menit baca',
    sourceUrl: 'https://bojongloa.desa.id/artikel/2024/11/21/sosialisasi-perencanaan-tata-wilayah-desa-dalam-rangka-penataan-desa',
    summary: 'Sosialisasi penataan ruang dan tata wilayah desa oleh Tim Pemkab Bandung untuk mengoptimalkan potensi lahan permukiman, pertanian, dan sarana publik di Desa Bojongloa.',
    content: [
      'Pemerintah Desa Bojongloa menggelar kegiatan Sosialisasi Perencanaan Tata Wilayah Desa dalam rangka penataan desa di wilayah Kabupaten Bandung.',
      'Pertemuan ini membahas zonasi wilayah perumahan warga, perlindungan lahan persawahan produktif, serta pemetaan fasilitas umum seperti drainase, jalan desa, dan area ruang terbuka publik.',
      'Hasil penataan ruang ini dijadikan rujukan dalam penyusunan Rencana Kerja Pemerintah Desa (RKPDes) dan dokumen penataan batas administratif rukun warga di Desa Bojongloa.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=75'
  }
];

export const DESA_APARATUR = [
  {
    nama: 'H. AYENG',
    jabatan: 'Kepala Desa Bojongloa',
    nip: 'Kepala Desa Terpilih',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=75'
  },
  {
    nama: 'ENDIN AMINUDIN, S.Ag.',
    jabatan: 'Sekretaris Desa',
    nip: 'Sekdes Pemdes Bojongloa',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=75'
  },
  {
    nama: 'ASEP KURNIAWAN, S.A.P.',
    jabatan: 'Kasi Pelayanan (Admin SIAK)',
    nip: 'Kasi Pelayanan Masyarakat',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=75'
  },
  {
    nama: 'NENG SITI MARYAM, S.E.',
    jabatan: 'Kaur Keuangan',
    nip: 'Kaur Pengelolaan APBDes',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=75'
  },
  {
    nama: 'AGUS SUHENDAR',
    jabatan: 'Kasi Pemerintahan & Trantib',
    nip: 'Kasi Tata Pemerintahan',
    foto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=75'
  },
  {
    nama: 'DADANG HIDAYAT',
    jabatan: 'Ketua BPD Bojongloa',
    nip: 'Badan Permusyawaratan Desa',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=75'
  }
];

export const DESA_PENGUMUMAN = [
  {
    id: 'ann-1',
    badge: 'Penting',
    title: 'Pelayanan Adminduk Mobile Terpadu di Aula Kantor Desa Bojongloa',
    date: 'Layanan Rutin Jemput Bola',
    desc: 'Perekaman KTP Elektronik, Pembuatan Kartu Identitas Anak (KIA), Akta Kelahiran, dan Akta Kematian langsung di Kantor Desa Bojongloa tanpa perlu ke kantor Disdukcapil Soreang.'
  },
  {
    id: 'ann-2',
    badge: 'Kesehatan',
    title: 'Konvergensi Rembuk Stunting & Layanan Posyandu Terpadu',
    date: 'Agenda Rutin Bulanan',
    desc: 'Pemantauan tumbuh kembang balita, imunisasi dasar lengkap, serta penyaluran Pemberian Makanan Tambahan (PMT) bergizi tinggi di seluruh posyandu RW se-Desa Bojongloa.'
  },
  {
    id: 'ann-3',
    badge: 'Layanan Digital',
    title: 'Layanan Surat Keterangan Kependudukan Mandiri Online',
    date: 'Setiap Hari Kerja (24 Jam Pengajuan)',
    desc: 'Warga Desa Bojongloa dapat mengajukan surat keterangan kelahiran, kematian, pindah datang, dan pindah keluar secara online dengan verifikasi resmi desa.'
  }
];
