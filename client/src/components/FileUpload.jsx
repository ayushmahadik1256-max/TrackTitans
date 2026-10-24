import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Hash,
} from 'lucide-react';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

export function FileUpload({
  file,
  onFileChange,
  error,
  maxSizeBytes = 10 * 1024 * 1024, // 10 MB
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [checksum, setChecksum] = useState(null);
  const [calculatingHash, setCalculatingHash] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setChecksum(null);
      return;
    }

    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }

    if (window.crypto && window.crypto.subtle) {
      setCalculatingHash(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
          setChecksum(hashHex);
        } catch (err) {
          console.warn('Could not compute SHA-256:', err);
        } finally {
          setCalculatingHash(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const validateAndSet = (selectedFile) => {
    setLocalError(null);
    if (!selectedFile) return;

    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const isMimeValid = ALLOWED_MIME_TYPES.includes(selectedFile.type.toLowerCase()) ||
      ALLOWED_EXTENSIONS.includes(fileExtension);

    if (!isMimeValid) {
      setLocalError(
        'Invalid format. Only PDF documents (.pdf) and Image files (.jpg, .jpeg, .png, .webp) are accepted.'
      );
      return;
    }

    if (selectedFile.size > maxSizeBytes) {
      setLocalError(
        `File size (${formatFileSize(selectedFile.size)}) exceeds the 10 MB limit. Please compress the file.`
      );
      return;
    }

    onFileChange(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isPdf = file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
  const isImage = file && (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name));

  return (
    <div className="w-full space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            validateAndSet(e.target.files[0]);
          }
        }}
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#1F2937] bg-[#F7F8FA]'
              : localError || error
              ? 'border-[#FECACA] bg-[#FEF2F2]'
              : 'border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#9CA3AF] hover:bg-[#F7F8FA]'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] text-[#4B5563] flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-[#1F2937]" />
            </div>

            <h4 className="font-semibold text-[#111827] text-sm mb-1">
              Drag & Drop Digital Copy of Physical FDR Certificate
            </h4>
            <p className="text-xs text-[#6B7280] max-w-md mb-3">
              Upload clear scanned copy or high-resolution photo of the FDR with joint AICTE lien clause.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-2 text-[11px] text-[#4B5563]">
              <span className="px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E5E7EB] font-mono">
                PDF (.pdf)
              </span>
              <span className="px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E5E7EB] font-mono">
                Images (.jpg, .jpeg, .png, .webp)
              </span>
              <span className="px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E5E7EB] font-mono">
                Max 10 MB
              </span>
            </div>

            <span className="text-xs text-[#1F2937] font-medium hover:underline">
              Or click to browse from device
            </span>
          </div>
        </div>
      ) : (
        <div className="border border-[#E5E7EB] rounded-xl bg-[#FFFFFF] p-4 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {isImage && previewUrl ? (
                <div
                  onClick={() => setShowPreviewModal(true)}
                  className="w-12 h-12 rounded-lg overflow-hidden border border-[#E5E7EB] bg-[#F7F8FA] shrink-0 cursor-pointer"
                  title="Click to preview"
                >
                  <img
                    src={previewUrl}
                    alt="FDR Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-[#1F2937] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-[#111827] truncate max-w-[280px]">
                    {file.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-[#F7F8FA] border border-[#E5E7EB] text-[#4B5563]">
                    {isPdf ? 'PDF' : 'Image'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                  <span className="font-mono tabular-nums">{formatFileSize(file.size)}</span>
                  <span>·</span>
                  <span className="text-[#15803D] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                  </span>
                  <span>·</span>
                  <span>Ready for S3 Vault</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isImage && previewUrl && (
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors"
                  title="View preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onFileChange(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors"
                title="Remove attached certificate"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Checksum and Integrity Bar */}
          <div className="rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#4B5563]">
              <Hash className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="font-medium text-[#111827]">SHA-256 Digest:</span>
              <span className="font-mono text-[11px] text-[#4B5563] truncate max-w-[220px] sm:max-w-xs tabular-nums">
                {calculatingHash ? 'Calculating hash...' : checksum || 'Computed on upload'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-[#1F2937] hover:underline font-medium self-end sm:self-auto"
            >
              Replace
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {(localError || error) && (
        <div className="rounded-lg bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs text-[#B91C1C] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
          <span>{localError || error}</span>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative max-w-3xl w-full bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#64748B]" />
                  Certificate Preview: {file.name}
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Verify bank stamp, deposit sum, and joint AICTE lien clause
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="FDR Certificate"
                className="max-h-[60vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-xs font-medium text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
