import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { FileUpload } from '../components/FileUpload.jsx';
import { ErrorToast } from '../components/ErrorToast.jsx';
import { createFdr } from '../services/fdrService.js';
import {
  Upload,
  ArrowLeft,
  IndianRupee,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export function UploadFDR() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [fdrNumber, setFdrNumber] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [fdrFile, setFdrFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fdrFile) {
      setErrorMessage('Please upload the digital copy (PDF or Image) of the physical Fixed Deposit Receipt (FDR) certificate.');
      return;
    }

    if (new Date(maturityDate) <= new Date(issueDate)) {
      setErrorMessage('Maturity date must be chronologically after the issue date.');
      return;
    }

    if (parseFloat(depositAmount) <= 0) {
      setErrorMessage('Deposit amount must be a positive number.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('fdr_number', fdrNumber.trim());
      formData.append('deposit_amount', depositAmount);
      formData.append('issue_date', issueDate);
      formData.append('maturity_date', maturityDate);
      formData.append('bank_name', bankName);
      formData.append('branch_name', branchName);
      formData.append('ifsc_code', ifscCode.toUpperCase());
      formData.append('remarks', remarks);
      formData.append('fdr_document', fdrFile);

      const created = await createFdr(formData, currentUser);

      setSuccessMessage(`FDR ${fdrNumber} successfully registered and queued for bank verification.`);
      setTimeout(() => {
        navigate(`/fdrs/${created.id}`);
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to upload FDR record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 bg-white">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/institution"
          className="p-2 rounded-lg bg-white hover:bg-[#F7F8FA] text-[#4B5563] border border-[#E5E7EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            Register Institutional FDR
          </h1>
          <p className="text-xs text-[#6B7280]">
            Submit bank-issued fixed deposit details and upload digital certificate copy (PDF or Image)
          </p>
        </div>
      </div>

      <ErrorToast message={errorMessage} onDismiss={() => setErrorMessage(null)} />

      {successMessage && (
        <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-4 text-xs text-[#15803D] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Step 1: FDR Document Drag & Drop Upload */}
        <div>
          <label className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-2">
            1. Digital Copy of Physical FDR Certificate (PDF or Image)
          </label>
          <FileUpload file={fdrFile} onFileChange={setFdrFile} />
        </div>

        {/* Step 2: Deposit Financial Details */}
        <div className="pt-4 border-t border-[#F3F4F6] space-y-4">
          <label className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
            2. Fixed Deposit Metadata
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                FDR Certificate Number
              </label>
              <input
                type="text"
                required
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                placeholder="SBI-DEL-FDR-2024-99123"
                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] font-mono focus:outline-none focus:border-[#1F2937]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Deposit Amount (INR)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  min="1000"
                  step="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="3500000"
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-8 pr-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] font-mono tabular-nums focus:outline-none focus:border-[#1F2937]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Maturity Date
              </label>
              <input
                type="date"
                required
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Bank Partner & Branch Details */}
        <div className="pt-4 border-t border-[#F3F4F6] space-y-4">
          <label className="block text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
            3. Issuing Commercial Bank
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Bank Name
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#1F2937]"
              >
                <option value="State Bank of India">State Bank of India</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Union Bank of India">Union Bank of India</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111827] mb-1">
                Branch Location
              </label>
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Parliament St, New Delhi"
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
                className="w-full rounded-lg bg-white border border-[#E5E7EB] px-3 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] font-mono focus:outline-none focus:border-[#1F2937]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111827] mb-1">
              Purpose / Institutional Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Mandatory security deposit for AICTE approval of new technical programs"
              className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
            />
          </div>
        </div>

        {/* Security Declaration */}
        <div className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 text-xs text-[#4B5563] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
          <p>
            By uploading this receipt, you certify that this FDR has been executed in joint favor of the institution and the Member Secretary, AICTE, with a mandatory lien clause noted in the bank ledger. Both PDF and certified image scans are accepted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/institution"
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span>Uploading & Encrypting...</span>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Submit FDR for Bank Verification</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadFDR;
