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
  const { currentUser, logout, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!currentUser && location.pathname === '/landing') return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-[#FFFFFF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark (Single element, no descriptor chips) */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center text-white">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg tracking-tight text-[#111827] whitespace-nowrap">
                  TrackTitans
                </span>
                <span className="text-[11px] font-mono text-[#6B7280] hidden sm:inline">
                  SIH26265
                </span>
              </div>
            </Link>

            {/* Zone 2: Navigation Links (Clean single-line text links) */}
            {currentUser && (
              <nav className="hidden md:flex items-center gap-1 pl-6 border-l border-[#E5E7EB]">
                {currentUser.role === 'institution' && (
                  <>
                    <Link
                      to="/institution"
                      className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                        isActive('/institution')
                          ? 'bg-[#F7F8FA] text-[#111827] font-semibold border border-[#E5E7EB]'
                          : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      Institution Dashboard
                    </Link>
                    <Link
                      to="/upload-fdr"
                      className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                        isActive('/upload-fdr')
                          ? 'bg-[#F7F8FA] text-[#111827] font-semibold border border-[#E5E7EB]'
                          : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-[#64748B]" />
                      Register FDR
                    </Link>
                  </>
                )}

                {currentUser.role === 'bank' && (
                  <Link
                    to="/bank"
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                      isActive('/bank')
                        ? 'bg-[#F7F8FA] text-[#111827] font-semibold border border-[#E5E7EB]'
                        : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <Landmark className="w-3.5 h-3.5 text-[#64748B]" />
                    Bank Verification Queue
                  </Link>
                )}

                {currentUser.role === 'aicte_admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                      isActive('/admin')
                        ? 'bg-[#F7F8FA] text-[#111827] font-semibold border border-[#E5E7EB]'
                        : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#64748B]" />
                    AICTE Executive Dashboard
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Zone 3: Demo Switcher + Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Demo Role Switcher Segmented Control */}
            <div className="hidden lg:flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-lg border border-[#E5E7EB]">
              <span className="text-[11px] font-medium text-[#6B7280] px-1.5">
                Role:
              </span>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoRole('institution');
                  navigate('/institution');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentUser?.role === 'institution'
                    ? 'bg-[#FFFFFF] text-[#111827] shadow-xs border border-[#E5E7EB]'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Institution
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoRole('bank');
                  navigate('/bank');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentUser?.role === 'bank'
                    ? 'bg-[#FFFFFF] text-[#111827] shadow-xs border border-[#E5E7EB]'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Bank
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoRole('aicte_admin');
                  navigate('/admin');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  currentUser?.role === 'aicte_admin'
                    ? 'bg-[#FFFFFF] text-[#111827] shadow-xs border border-[#E5E7EB]'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                AICTE Admin
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-[#111827] max-w-[160px] truncate">
                    {currentUser.full_name || currentUser.email}
                  </div>
                  <div className="flex items-center justify-end mt-0.5">
                    <RoleBadge role={currentUser.role} size="sm" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="p-2 rounded-lg bg-[#F7F8FA] hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB] transition-colors"
                  title="Open Nodemailer Email Notification Outbox"
                >
                  <Mail className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-[#F7F8FA] hover:bg-[#FEF2F2] text-[#4B5563] hover:text-[#B91C1C] border border-[#E5E7EB] transition-colors"
                  title="Sign out of TrackTitans"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#111827] hover:bg-[#F7F8FA] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white transition-colors"
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
