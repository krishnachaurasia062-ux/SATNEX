import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Lock, Unlock, X, Key, UserCheck, AlertCircle } from 'lucide-react';
import { OWNER_NAME, verifyOwnerCredentials } from '../utils/ownerAuth';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [credentialInput, setCredentialInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = verifyOwnerCredentials(credentialInput);
    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        setSuccessMsg(null);
        setCredentialInput('');
        onSuccess?.();
        onClose();
      }, 700);
    } else {
      setErrorMsg(result.message);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 top-[65px] sm:top-[70px] z-[100] flex items-start justify-center p-3 sm:p-4 pt-3 sm:pt-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-2 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                Owner Access Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Code editing restricted to author ({OWNER_NAME})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          <div className="p-2.5 sm:p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Project Author: {OWNER_NAME}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Enter passkey to unlock editing mode for all 9 Python files during exhibition.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Enter Author Passkey:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={credentialInput}
                onChange={(e) => {
                  setCredentialInput(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter Author Passkey"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium font-mono">Access Denied</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{successMsg}</span>
            </div>
          )}

          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Verify & Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
