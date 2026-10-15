import React from 'react';
import { PengajuanForm } from '../../components/warga/PengajuanForm';
import { useNavigation } from '../../context/NavigationContext';

export const PengajuanPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="py-2">
      <PengajuanForm onSuccess={() => navigateTo('riwayat')} />
    </div>
  );
};

export default PengajuanPage;
