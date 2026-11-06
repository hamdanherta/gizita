import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../common/Skeleton';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl font-bold mb-4">
          403
        </div>
        <h2 className="text-xl font-bold text-slate-800">Akses Tidak Diizinkan</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Akun Anda dengan peran <span className="font-semibold text-slate-700">'{role}'</span> tidak memiliki hak akses untuk membuka halaman ini.
        </p>
        <a
          href="/dashboard"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Kembali ke Dashboard
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;

