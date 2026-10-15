import React from 'react';
import { AuthView } from '../../components/auth/AuthView';
import { useNavigation } from '../../context/NavigationContext';

export const RegisterPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="py-4">
      <AuthView
        initialMode="register"
        onSuccess={() => navigateTo('pengajuan')}
        onBackToLanding={() => navigateTo('landing')}
      />
    </div>
  );
};

export default RegisterPage;
