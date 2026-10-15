import React from 'react';
import { KabupatenBandungLogo } from '../KabupatenBandungLogo';
import { DESA_INFO } from '../../data/mockData';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, Mail } from 'lucide-react';

export const AppFooter: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { profile } = useAuth();

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16 pt-12 pb-8 border-t border-stone-800 print:hidden text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <KabupatenBandungLogo className="w-10 h-11 shrink-0" />
              <div>
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  PEMERINTAH DESA BOJONGLOA
                </h3>
                <p className="text-[11px] text-stone-400">
                  Kecamatan Rancaekek, Kabupaten Bandung, Provinsi Jawa Barat
                </p>
              </div>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed max-w-md">
              Sistem Informasi Pencatatan Kependudukan Resmi dan Administrasi Warga Desa Bojongloa.
              Mewujudkan tata kelola kependudukan desa yang transparan, akuntabel, dan terpercaya.
            </p>
            <div className="flex items-center gap-4 text-emerald-400 font-medium pt-1">
              <span>Portal Resmi Kependudukan</span>
              <span>•</span>
              <span>Kode Wilayah Desa: {DESA_INFO.kodeWilayah}</span>
            </div>
          </div>

          {/* Kontak Resmi */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
              Kontak & Pelayanan
            </h4>
            <div className="space-y-2 text-stone-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{DESA_INFO.kantorDesa}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{DESA_INFO.telepon}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{DESA_INFO.email}</span>
              </div>
            </div>
          </div>

          {/* Tautan Cepat */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
              Akses Mandiri
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button
                  onClick={() => navigateTo('landing')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Portal Berita Desa
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo(profile ? 'pengajuan' : 'login')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pencatatan Penduduk
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('login')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Masuk Akun Warga / Staf
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <div>
            Hak Cipta © {new Date().getFullYear()} Pemerintah Desa Bojongloa. Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-3">
            <span>Sistem Kependudukan Desa Bojongloa</span>
            <span>•</span>
            <span>Kec. Rancaekek, Kab. Bandung</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
