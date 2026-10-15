import React from 'react';
import { AuthView } from '../../components/auth/AuthView';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { role } = useAuth();

  const handleSuccess = () => {
    if (role === 'admin' || role === 'kades') {
      navigateTo('dashboard');
    } else {
      navigateTo('pengajuan');
    }
  };

  return (
    <div className="py-4">
      <AuthView
        initialMode="login"
        onSuccess={handleSuccess}
        onBackToLanding={() => navigateTo('landing')}
      />
    </div>
  );
};

export default LoginPage;
