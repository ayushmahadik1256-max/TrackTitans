import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { RoleBadge } from './RoleBadge.jsx';
import { SimulatedEmailCenterModal } from './SimulatedEmailCenterModal.jsx';
import {
  Shield,
  Upload,
  Landmark,
  LogOut,
  Building2,
  BarChart3,
  Mail,
  User,
} from 'lucide-react';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  if (location.pathname === '/' || location.pathname === '/landing') return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-8">
          {/* Zone 1: Brand & Logo */}
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    TrackTitans
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    AICTE SIH26265
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Three-Party Institutional FDR Escrow Registry
                </span>
              </div>
            </Link>

            {/* Zone 2: Role-based Navigation Tabs */}
            {currentUser && (
              <nav className="hidden md:flex items-center gap-1.5 ml-4">
                {currentUser.role === 'institution' && (
                  <>
                    <Link
                      to="/institution"
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/institution')
                          ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-slate-500" />
                      College Dashboard
                    </Link>
                    <Link
                      to="/upload-fdr"
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive('/upload-fdr')
                          ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      Register FDR
                    </Link>
                  </>
                )}

                {currentUser.role === 'bank' && (
                  <Link
                    to="/bank"
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive('/bank')
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-slate-500" />
                    Branch Verification Queue
                  </Link>
                )}

                {currentUser.role === 'aicte_admin' && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive('/admin')
                        ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    AICTE Executive Dashboard
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Zone 3: User Profile & Actions */}
          <div className="flex items-center gap-3.5 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-slate-900 max-w-[170px] truncate">
                    {currentUser.full_name || currentUser.email}
                  </div>
                  <div className="flex items-center justify-end mt-0.5">
                    <RoleBadge role={currentUser.role} size="sm" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Open Nodemailer Email Notification Outbox"
                >
                  <Mail className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Sign out of TrackTitans"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Email Notification Center Modal */}
      <SimulatedEmailCenterModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </header>
  );
}

export default Navbar;
