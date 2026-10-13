export type UserRole = 'warga' | 'admin' | 'kades';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nik?: string;
  noKk?: string;
  phone?: string;
  address?: string;
  rt?: string;
  rw?: string;
  dusun?: string;
  gender?: 'L' | 'P';
  birthPlace?: string;
  birthDate?: string;
  occupation?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionType = 'kelahiran' | 'kematian' | 'pindah_masuk' | 'pindah_keluar';

export type SubmissionStatus = 'menunggu' | 'diproses' | 'disetujui' | 'ditolak';

export interface AttachmentFile {
  name: string;
  type: string;
  url: string;
  size?: number;
}

export interface KelahiranDetails {
  namaBayi: string;
  jenisKelaminBayi: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  jamLahir: string;
  namaAyah: string;
  nikAyah: string;
  namaIbu: string;
  nikIbu: string;
}

export interface KematianDetails {
  namaAlmarhum: string;
  nikAlmarhum: string;
  jenisKelamin: 'L' | 'P';
  umur: string;
  tanggalKematian: string;
  jamKematian: string;
  tempatKematian: string;
  sebabKematian: string;
  namaPelapor: string;
  hubunganPelapor: string;
}

export interface PindahMasukDetails {
  nikPemohon: string;
  namaKepalaKeluarga: string;
  alamatAsal: string;
  desaAsal: string;
  kecamatanAsal: string;
  kabupatenAsal: string;
  provinsiAsal?: string;
  alasanPindah: string;
  alamatTujuanBojongloa: string;
  rtTujuan: string;
  rwTujuan: string;
  dusunTujuan: string;
  jumlahPengikut: string;
}

export interface PindahKeluarDetails {
  nikPemohon: string;
  namaKepalaKeluarga: string;
  alamatAsalBojongloa: string;
  rtAsal: string;
  rwAsal: string;
  dusunAsal: string;
  alamatTujuan: string;
  desaTujuan: string;
  kecamatanTujuan: string;
  kabupatenTujuan: string;
  provinsiTujuan?: string;
  alasanPindah: string;
  jumlahPengikut: string;
  jenisKepindahan: string;
}

export type SubmissionDetailsUnion =
  | KelahiranDetails
  | KematianDetails
  | PindahMasukDetails
  | PindahKeluarDetails;

export interface Submission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userNik: string;
  userPhone?: string;
  type: SubmissionType;
  status: SubmissionStatus;
  title: string;
  details: string; // JSON string of details
  attachments: string; // JSON string of AttachmentFile[]
  rejectionNote?: string;
  nomorRegistrasi?: string; // Nomor Registrasi Pengarsipan Kependudukan
  suratNumber?: string; // Backward compatibility alias
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: string;
  nik: string;
  noKk: string;
  fullName: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  religion: string;
  maritalStatus: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  occupation: string;
  rt: string;
  rw: string;
  dusun: string;
  address: string;
  status: 'aktif' | 'meninggal' | 'pindah_keluar' | 'warga_baru';
  createdAt: string;
  updatedAt: string;
}
