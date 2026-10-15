import React from 'react';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { useNavigation } from '../../context/NavigationContext';

export const AdminDashboardPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="py-2">
      <AdminDashboard
        onNavigateToPengajuan={() => navigateTo('persetujuan')}
        onNavigateToPenduduk={() => navigateTo('penduduk')}
        onNavigateToLaporan={() => navigateTo('laporan')}
      />
    </div>
  );
};

export default AdminDashboardPage;
