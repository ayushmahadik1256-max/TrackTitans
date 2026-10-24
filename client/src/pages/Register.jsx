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

      if (role === 'institution') navigate('/institution');
      else if (role === 'bank') navigate('/bank');
      else navigate('/admin');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-xl w-full space-y-6 bg-white border border-[#E5E7EB] p-8 rounded-2xl shadow-xs">
        <div className="text-left">
          <div className="w-10 h-10 rounded-lg bg-[#1F2937] flex items-center justify-center text-white mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">
            Register TrackTitans Account
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Select your organization role to register an institutional FDR vault
          </p>
        </div>

        <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#F7F8FA] p-1 rounded-lg border border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => setRole('institution')}
            className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              role === 'institution'
                ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Institution</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('bank')}
            className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              role === 'bank'
                ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Bank Partner</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('aicte_admin')}
            className={`py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              role === 'aicte_admin'
                ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#64748B]" />
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
            className="w-full mt-4 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium text-xs py-2.5 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Registering Profile...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#6B7280]">
          Already registered?{' '}
          <Link to="/login" className="text-[#111827] hover:underline font-medium">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
