import React from 'react';
import { LandingPage as LandingComponent } from '../../components/landing/LandingPage';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { profile } = useAuth();

  const handleGoToService = (_type?: string) => {
    if (!profile) {
      navigateTo('login');
    } else {
      navigateTo('pengajuan');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    navigateTo(mode);
  };

  return (
    <LandingComponent
      onGoToService={handleGoToService}
      onOpenAuth={handleOpenAuth}
    />
  );
};

export default LandingPage;
