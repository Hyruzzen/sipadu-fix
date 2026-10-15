import React from 'react';

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Memuat modul pelayanan...'
}) => (
  <div className="w-full py-20 flex flex-col items-center justify-center space-y-3">
    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
    <span className="text-xs font-semibold text-stone-500">{message}</span>
  </div>
);

export default LoadingFallback;
