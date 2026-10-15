import React from 'react';
import { KadesDashboard } from '../../components/kades/KadesDashboard';
import { useNavigation } from '../../context/NavigationContext';

export const KadesDashboardPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="py-2">
      <KadesDashboard onNavigateToLaporan={() => navigateTo('laporan')} />
    </div>
  );
};

export default KadesDashboardPage;
