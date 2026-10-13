import React from 'react';
import { AdminLaporan } from '../admin/AdminLaporan';

export const KadesLaporan: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between print:hidden">
        <span>
          Akses Eksekutif Kepala Desa: Anda memiliki hak penuh untuk meninjau dan mencetak Laporan Mutasi Kependudukan Bulanan & Tahunan.
        </span>
        <span className="font-bold text-amber-800">Mode Monitoring Eksekutif</span>
      </div>
      <AdminLaporan />
    </div>
  );
};
