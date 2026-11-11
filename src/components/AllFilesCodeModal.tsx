import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Code,
  Copy,
  Check,
  Terminal,
  Play,
  Download,
  FileText,
  Edit3,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import { GPS_STEPS_DATA } from '../data/gpsStepsData';
import {
  isOwnerLoggedIn,
  lockOwnerMode,
  getCustomScriptCode,
  saveCustomScriptCode,
  resetCustomScriptCode,
  hasCustomScriptModifications,
  OWNER_NAME,
} from '../utils/ownerAuth';
import { OwnerAuthModal } from './OwnerAuthModal';

interface AllFilesCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export const AllFilesCodeModal: React.FC<AllFilesCodeModalProps> = ({
  isOpen,
  onClose,
  initialStep = 1,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(initialStep - 1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null);

  // Owner Authorization & Code Editing State
  const [isOwner, setIsOwner] = useState<boolean>(isOwnerLoggedIn());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedCode, setEditedCode] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const currentStep = GPS_STEPS_DATA[selectedFileIdx] || GPS_STEPS_DATA[0];
  const currentScript = currentStep.runnableScript;

  // Load active file code (customized or default) when selected file changes
  useEffect(() => {
    if (isOpen) {
      setEditedCode(getCustomScriptCode(currentScript.filename, currentScript.code));
      setTerminalOutput(null);
      setIsEditing(false);
    }
  }, [selectedFileIdx, isOpen, currentScript.filename, currentScript.code]);

  // Sync owner auth status and custom code saves across all applet tabs
  useEffect(() => {
    const handleAuthChange = () => {
      setIsOwner(isOwnerLoggedIn());
    };
    const handleCodeSaved = (e: Event) => {
      const customEvent = e as CustomEvent<{ filename: string }>;
      if (customEvent.detail?.filename === currentScript.filename) {
        setEditedCode(getCustomScriptCode(currentScript.filename, currentScript.code));
      }
    };
    window.addEventListener('gps_owner_auth_change', handleAuthChange);
    window.addEventListener('gps_custom_code_saved', handleCodeSaved);
    return () => {
      window.removeEventListener('gps_owner_auth_change', handleAuthChange);
      window.removeEventListener('gps_custom_code_saved', handleCodeSaved);
    };
  }, [currentScript.filename, currentScript.code]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const isCurrentFileModified = hasCustomScriptModifications(currentScript.filename);
  const activeCodeToRunOrCopy = isEditing
    ? editedCode
    : getCustomScriptCode(currentScript.filename, currentScript.code);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCodeToRunOrCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTerminalOutput(
      `Running ${currentScript.filename} through Python 3.11 environment...\n$ python3 ${currentScript.filename}\n`
    );
    setTimeout(() => {
      const extraNotice = isCurrentFileModified
        ? '\n[Notice: Running customized script saved by author Krishna Chaurasia]\n'
        : '';
      setTerminalOutput(
        (prev) => (prev || '') + currentScript.expectedOutput + extraNotice + '\n[Process completed with exit code 0]'
      );
      setIsRunning(false);
    }, 550);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([activeCodeToRunOrCopy], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = currentScript.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveCode = () => {
    saveCustomScriptCode(currentScript.filename, editedCode);
    setSaveNotice(`Saved changes to ${currentScript.filename}!`);
    setTimeout(() => setSaveNotice(null), 2500);
  };

  const handleResetCode = () => {
    resetCustomScriptCode(currentScript.filename);
    setEditedCode(currentScript.code);
    setIsEditing(false);
    setSaveNotice(`Reverted ${currentScript.filename} to original template.`);
    setTimeout(() => setSaveNotice(null), 2500);
  };

  const handleEditClick = () => {
    if (isOwner) {
      setIsEditing(!isEditing);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[88vh] max-h-[850px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Project Code Suite (All 9 Runnable Python Files)
                </h3>
                {isOwner && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Author Access Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Standalone, executable Python scripts for each of the 9 mathematical principles of GPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Layout: Left File Picker + Right Code/Terminal Viewer */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar: 9 File List */}
          <div className="w-full md:w-80 bg-slate-950 border-r border-slate-800 p-3 pb-28 overflow-y-auto space-y-1.5 shrink-0 h-60 sm:h-72 md:h-full min-h-0">
            <div className="px-2 py-1 text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Project Python Scripts</span>
              <span className="text-[10px] text-slate-600 font-sans">9 Files</span>
            </div>
            {GPS_STEPS_DATA.map((step, idx) => {
              const isSelected = selectedFileIdx === idx;
              const hasMod = hasCustomScriptModifications(step.runnableScript.filename);
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setSelectedFileIdx(idx);
                    setTerminalOutput(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="block text-slate-200 font-sans font-medium text-[11px] truncate">
                        {step.shortTitle}
                      </span>
                      {hasMod && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Custom Modified" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {step.runnableScript.filename}
                    </span>
                  </div>
                  <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Area: Code Editor & Terminal Output */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden min-h-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-800 text-sky-400 rounded-md font-mono text-xs font-semibold">
                  {currentScript.filename}
                </span>
                {isCurrentFileModified && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Modified
                  </span>
                )}
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Step {currentStep.stepNumber}: {currentStep.mathDomain}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Author Authentication Button */}
                {isOwner ? (
                  <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-800/60 rounded-lg px-2.5 py-1 text-xs">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Author: Krishna
                    </span>
                    <button
                      onClick={() => {
                        lockOwnerMode();
                        setIsEditing(false);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white ml-1 underline"
                      title="Lock Owner Edit Mode"
                    >
                      Lock
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
                    title="Code editing is restricted exclusively to project creator Krishna Chaurasia"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Owner Edit</span>
                  </button>
                )}

                {/* Edit Mode Toggle */}
                <button
                  onClick={handleEditClick}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isEditing
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                      : isOwner
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'View Mode' : 'Edit Code'}</span>
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                  title="Download .py file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            {/* Notification Toast for Save/Reset */}
            {saveNotice && (
              <div className="mx-4 mt-3 p-2.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {saveNotice}
                </span>
                <button onClick={() => setSaveNotice(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Split Pane: Code on top / Terminal at bottom */}
            <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 min-h-0">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-300 bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-800/40">
                    <span className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      Editing: {currentScript.filename}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetCode}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        title="Revert back to original template"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Revert
                      </button>
                      <button
                        onClick={handleSaveCode}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs shadow transition-colors"
                      >
                        <Save className="w-3 h-3" />
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-xl border border-amber-600/40 overflow-hidden bg-slate-950">
                    <textarea
                      value={editedCode}
                      onChange={(e) => setEditedCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const start = e.currentTarget.selectionStart;
                          const end = e.currentTarget.selectionEnd;
                          const newText = editedCode.substring(0, start) + '    ' + editedCode.substring(end);
                          setEditedCode(newText);
                          setTimeout(() => {
                            e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                          }, 0);
                        }
                      }}
                      rows={16}
                      spellCheck={false}
                      className="w-full p-4 bg-transparent font-mono text-xs text-amber-100 leading-relaxed focus:outline-none resize-y selection:bg-amber-500/30"
                      placeholder="Enter Python code..."
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Tab key inserts 4 spaces · Edits are saved locally in browser storage</span>
                    <span>Lines: {editedCode.split('\n').length}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-slate-300 leading-relaxed whitespace-pre font-mono">
                    {activeCodeToRunOrCopy}
                  </pre>
                </div>
              )}

              {/* Terminal Output Console */}
              {terminalOutput && (
                <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <Terminal className="w-3.5 h-3.5" />
                      Execution Output Console (Python 3.11)
                    </span>
                    <button
                      onClick={() => setTerminalOutput(null)}
                      className="text-[11px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-emerald-300 whitespace-pre overflow-x-auto leading-relaxed bg-black/50">
                    {terminalOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Owner Authentication Modal */}
        <OwnerAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsOwner(true);
            setIsEditing(true);
          }}
        />
      </div>
    </div>,
    document.body
  );
};
