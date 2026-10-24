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
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/?divert=true');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Tripartite Escrow Vault */}
        <div className="lg:col-span-6 space-y-4 hidden lg:block">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Multi-Party Escrow Consensus</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-time Sovereign Custody Engine
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Cryptographically unified ledger between Technical Institutions, Scheduled Commercial Banks, and AICTE National Regulatory Authority.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 soft-card">
            <EscrowVaultVisual3D
              title="Tripartite Escrow Architecture"
              subtitle="Drag to rotate consensus rings • College · Bank · AICTE"
              height="300px"
              interactive={true}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Institutions</span>
              <span className="text-sm font-bold text-slate-900">End-to-End Vault</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">Bank Branch</span>
              <span className="text-sm font-bold text-slate-900">Lien Verification</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 block">AICTE HQ</span>
              <span className="text-sm font-bold text-slate-900">Release Sanctions</span>
            </div>
          </div>
        </div>

        {/* Right Column: Standard Authentication Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-8 sm:p-10 rounded-2xl soft-card space-y-6">
          <div className="text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white mb-3 shadow-xs">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to TrackTitans
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your registered credentials to access your dashboard
            </p>
          </div>

          <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu.in or bank.co.in"
                  className="soft-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="soft-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl soft-button-primary hover-lift font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Don't have an institutional or banking account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
