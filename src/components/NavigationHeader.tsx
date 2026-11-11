import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldCheck, Sparkles, Bot } from 'lucide-react';
import { isOwnerLoggedIn, lockOwnerMode, OWNER_NAME } from '../utils/ownerAuth';
import { OwnerAuthModal } from './OwnerAuthModal';

interface NavigationHeaderProps {
  onOpenAllCodeModal: () => void;
  onOpenVivaTrainer: () => void;
  onStartWalkthrough: () => void;
  onOpenChatbot: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  onOpenAllCodeModal,
  onOpenVivaTrainer,
  onStartWalkthrough,
  onOpenChatbot,
}) => {
  const [isOwner, setIsOwner] = useState<boolean>(isOwnerLoggedIn());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsOwner(isOwnerLoggedIn());
    };
    window.addEventListener('gps_owner_auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('gps_owner_auth_change', handleAuthChange);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[60] bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md shadow-md">
        <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#"
          className="text-lg font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="text-sky-400">GPS</span>
          <span>Mathematics Exhibition</span>
        </a>

        {/* Zone 2: Concise Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#celestial-model" className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0">
            3D Orbit Model
          </a>
          <button
            onClick={onOpenAllCodeModal}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Code Suite (9 Files)
          </button>
          <button
            onClick={onOpenVivaTrainer}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Viva Practice
          </button>
          <button
            onClick={onOpenChatbot}
            className="hover:text-sky-300 transition-colors whitespace-nowrap shrink-0 text-left flex items-center gap-1.5 text-sky-400 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Ask AI</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Owner Mode Access */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Owner Mode Status/Unlock */}
          {isOwner ? (
            <button
              onClick={() => lockOwnerMode()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-lg shadow-sm hover:bg-amber-900/40 transition-colors"
              title="Owner Mode Active (Krishna Chaurasia) - Click to lock"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Owner Mode: Krishna</span>
              <span className="text-[10px] text-slate-400 font-normal underline ml-0.5">Lock</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
              title="Code editing restricted to project author Krishna Chaurasia"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Author Edit</span>
            </button>
          )}

          <button
            onClick={onStartWalkthrough}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            Exhibition Tour
          </button>
        </div>
      </div>
    </header>

    <OwnerAuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      onSuccess={() => setIsOwner(true)}
    />
  </>
);
};
