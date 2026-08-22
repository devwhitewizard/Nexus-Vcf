import React, { useState, useEffect } from 'react';
import { checkAdminStatus } from '../lib/api';
import { AdminLogin } from '../components/AdminLogin';
import { AdminDashboard } from '../components/AdminDashboard';
import { Loader2 } from 'lucide-react';

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const verifySession = async () => {
    const isAuth = await checkAdminStatus();
    setIsAuthenticated(isAuth);
  };

  useEffect(() => {
    verifySession();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-cmd-dark flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
        <span className="text-sm font-semibold tracking-wide text-gray-300">Verifying Admin Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cmd-dark text-slate-100 flex flex-col">
      <main className="flex-1">
        {isAuthenticated ? (
          <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
        ) : (
          <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
        )}
      </main>
    </div>
  );
};
