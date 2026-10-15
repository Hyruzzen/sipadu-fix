import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRoute =
  | 'landing'
  | 'login'
  | 'register'
  | 'pengajuan'
  | 'riwayat'
  | 'persetujuan'
  | 'penduduk'
  | 'laporan'
  | 'akun'
  | 'dashboard'
  | 'profil'
  | 'pengaturan';

interface NavigationContextType {
  currentRoute: AppRoute;
  params: Record<string, any>;
  navigateTo: (route: AppRoute, newParams?: Record<string, any>) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const parseHashToRoute = (hash: string): { route: AppRoute; params: Record<string, any> } => {
  const cleanHash = hash.replace(/^#\/?/, '').trim();
  if (!cleanHash || cleanHash === 'beranda') {
    return { route: 'landing', params: {} };
  }

  const [routePart, queryPart] = cleanHash.split('?');
  const validRoutes: AppRoute[] = [
    'landing',
    'login',
    'register',
    'pengajuan',
    'riwayat',
    'persetujuan',
    'penduduk',
    'laporan',
    'akun',
    'dashboard',
    'profil',
    'pengaturan'
  ];

  const matchedRoute = validRoutes.find((r) => r === routePart.toLowerCase());
  const params: Record<string, any> = {};

  if (queryPart) {
    const urlParams = new URLSearchParams(queryPart);
    urlParams.forEach((val, key) => {
      params[key] = val;
    });
  }

  return {
    route: matchedRoute || 'landing',
    params
  };
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      return parseHashToRoute(window.location.hash).route;
    }
    return 'landing';
  });

  const [params, setParams] = useState<Record<string, any>>(() => {
    if (typeof window !== 'undefined') {
      return parseHashToRoute(window.location.hash).params;
    }
    return {};
  });

  // Listen to browser navigation (hashchange, back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHashToRoute(window.location.hash);
      setCurrentRoute(parsed.route);
      setParams(parsed.params);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: AppRoute, newParams: Record<string, any> = {}) => {
    setCurrentRoute(route);
    setParams(newParams);

    // Build URL hash
    let hashStr = `#/${route}`;
    const keys = Object.keys(newParams);
    if (keys.length > 0) {
      const q = new URLSearchParams();
      keys.forEach((k) => q.set(k, String(newParams[k])));
      hashStr += `?${q.toString()}`;
    }

    if (window.location.hash !== hashStr) {
      window.location.hash = hashStr;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('landing');
    }
  };

  return (
    <NavigationContext.Provider value={{ currentRoute, params, navigateTo, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
};
