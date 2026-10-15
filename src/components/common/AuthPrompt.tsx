import React from 'react';
import { KabupatenBandungLogo } from '../KabupatenBandungLogo';
import { useNavigation } from '../../context/NavigationContext';

interface AuthPromptProps {
  title?: string;
  description?: string;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({
  title = 'Akses Layanan Arsip Kependudukan',
  description = 'Untuk menjaga keamanan data dan keabsahan berkas, akses portal arsip kependudukan Desa Bojongloa memerlukan autentikasi akun terdaftar.'
}) => {
  const { navigateTo } = useNavigation();

  return (
    <div className="max-w-xl mx-auto mt-6 mb-12 bg-white rounded-3xl border border-stone-200 p-8 shadow-xl text-center space-y-5 animate-in fade-in">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
        <KabupatenBandungLogo className="w-12 h-13" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-stone-900">{title}</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={() => navigateTo('login')}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          Masuk ke Akun Anda
        </button>
        <button
          onClick={() => navigateTo('register')}
          className="px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs cursor-pointer active:scale-95 transition-all"
        >
          Daftar Warga Baru
        </button>
      </div>
    </div>
  );
};

export default AuthPrompt;
