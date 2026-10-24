import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ErrorToast } from '../components/ErrorToast.jsx';
import { EscrowVaultVisual3D } from '../components/EscrowVaultVisual3D.jsx';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Building2,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { login, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    loginAsDemoRole(role);
    if (role === 'institution') navigate('/institution');
    else if (role === 'bank') navigate('/bank');
    else if (role === 'aicte_admin') navigate('/admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Tripartite Escrow Vault */}
        <div className="lg:col-span-6 space-y-4 hidden lg:block">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] mb-2">
              <Shield className="w-4 h-4 text-[#1F2937]" />
              <span>Smart India Hackathon SIH26265</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
              Institutional FDR & Security Deposit Lifecycle Platform
            </h1>
            <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
              Digitizing tri-party sovereign custody between Technical Institutions, Commercial Banks, and AICTE National Directorate.
            </p>
          </div>

          <EscrowVaultVisual3D
            title="Tripartite Escrow Custody Token"
            subtitle="Drag to inspect 3-party verification rings: College · Bank · AICTE"
            height="260px"
          />

          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-[#6B7280]">
            <div className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
              <span className="font-semibold text-[#111827] block">Institutions</span>
              Scanned FDR & Lien
            </div>
            <div className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
              <span className="font-semibold text-[#111827] block">Partner Banks</span>
              Ledger Verification
            </div>
            <div className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
              <span className="font-semibold text-[#111827] block">AICTE Admin</span>
              Release Oversight
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto space-y-6 bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-xs">
          <div className="text-left">
            <div className="w-10 h-10 rounded-lg bg-[#1F2937] flex items-center justify-center text-white mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#111827]">
              Sign in to TrackTitans
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Select your role or sign in with registered credentials
            </p>
          </div>

          <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {/* Demo Fast Login Buttons */}
          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-[#4B5563] block">
              Evaluator Quick Access:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('institution')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-50 border border-[#E5E7EB] text-xs font-medium text-[#111827] transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#64748B] mb-1" />
                <span>Institution</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('bank')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-50 border border-[#E5E7EB] text-xs font-medium text-[#111827] transition-colors"
              >
                <Landmark className="w-4 h-4 text-[#64748B] mb-1" />
                <span>Bank</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('aicte_admin')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-white hover:bg-gray-50 border border-[#E5E7EB] text-xs font-medium text-[#111827] transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#64748B] mb-1" />
                <span>AICTE Admin</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5E7EB] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#9CA3AF] uppercase tracking-wider shrink-0 font-medium">
              or enter credentials
            </span>
            <div className="border-t border-[#E5E7EB] w-full" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="registrar@delhitechnical.edu.in"
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium text-xs py-2.5 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-[#6B7280]">
            Need to register an institutional or bank account?{' '}
            <Link to="/register" className="text-[#111827] hover:underline font-medium">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
