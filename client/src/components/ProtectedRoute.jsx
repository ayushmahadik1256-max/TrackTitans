import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loader } from './Loader.jsx';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader message="Authenticating credentials..." />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-2xl bg-white border border-rose-200 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-6">
          Your current authenticated profile has role <span className="font-semibold text-blue-700 font-mono">[{currentUser.role}]</span>, but this section requires one of <span className="font-mono text-purple-700">[{allowedRoles.join(', ')}]</span>.
        </p>
        <button
          onClick={() => {
            if (currentUser.role === 'institution') window.location.href = '/institution';
            else if (currentUser.role === 'bank') window.location.href = '/bank';
            else if (currentUser.role === 'aicte_admin') window.location.href = '/admin';
            else window.location.href = '/';
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Go to Your Authorized Dashboard
        </button>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
