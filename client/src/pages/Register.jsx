import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ErrorToast } from '../components/ErrorToast.jsx';
import {
  Shield,
  Building2,
  Landmark,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
} from 'lucide-react';

export function Register() {
  const [role, setRole] = useState('institution');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Institution fields
  const [institutionName, setInstitutionName] = useState('');
  const [aicteAppId, setAicteAppId] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');

  // Bank fields
  const [bankName, setBankName] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const profileData = {
        full_name: fullName,
        phone,
        institution_name: role === 'institution' ? institutionName : null,
        aicte_application_id: role === 'institution' ? aicteAppId : null,
        address: role === 'institution' ? address : null,
        state: role === 'institution' ? state : null,
        bank_name: role === 'bank' ? bankName : null,
        branch_name: role === 'bank' ? branchName : null,
        ifsc_code: role === 'bank' ? ifscCode : null,
      };

      await register(email, password, role, profileData);
      navigate('/?divert=true');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="max-w-xl w-full space-y-6 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
        <div className="text-left">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white mb-3 shadow-xs">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Register TrackTitans Account
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Select your organization role to register an institutional FDR vault
          </p>
        </div>

        <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole('institution')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              role === 'institution'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Institution</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('bank')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              role === 'bank'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>Bank Partner</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('aicte_admin')}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              role === 'aicte_admin'
                ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>AICTE Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Full Name / Officer In-Charge
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Prof. Sunita Deshmukh"
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91-9876543210"
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="officer@domain.edu.in"
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
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
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>
            </div>
          </div>

          {/* Institution Specific Fields */}
          {role === 'institution' && (
            <div className="pt-2 border-t border-[#F3F4F6] space-y-3">
              <h4 className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                Technical Institution Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Delhi Institute of Engineering"
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    AICTE Permanent / Application ID
                  </label>
                  <input
                    type="text"
                    required
                    value={aicteAppId}
                    onChange={(e) => setAicteAppId(e.target.value)}
                    placeholder="AICTE-1-9321482910"
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    State / UT
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Delhi"
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Campus Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Sector 12, Dwarka"
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Specific Fields */}
          {role === 'bank' && (
            <div className="pt-2 border-t border-[#F3F4F6] space-y-3">
              <h4 className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                Bank Branch Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="State Bank of India"
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Parliament Street Branch"
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#111827] mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="SBIN0000691"
                    className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937] font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {loading ? (
              <span>Registering Profile...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
