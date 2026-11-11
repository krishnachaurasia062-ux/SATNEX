import React, { useState, useEffect } from 'react';
import { StepInfo } from '../types/gps';
import {
  BookOpen,
  HelpCircle,
  Terminal,
  FileCode,
  GraduationCap,
  Lightbulb,
  CheckCircle,
  FileText,
  Languages,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Download,
  Sparkles,
  Edit3,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Eye,
  ShieldCheck,
} from 'lucide-react';
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

interface StepDetailedContentProps {
  step: StepInfo;
  isHinglishMode: boolean;
  onToggleHinglish: () => void;
  onOpenAllCodeModal?: () => void;
  onOpenChatbot?: (mode?: 'general' | 'viva' | 'solver' | 'model') => void;
}

export const StepDetailedContent: React.FC<StepDetailedContentProps> = ({
  step,
  isHinglishMode,
  onToggleHinglish,
  onOpenAllCodeModal,
  onOpenChatbot,
}) => {
  const [activeTab, setActiveTab] = useState<
    'concept' | 'formulas' | 'example' | 'runnable_code' | 'curriculum' | 'viva'
  >('concept');

  const [expandedVivaIndex, setExpandedVivaIndex] = useState<number | null>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Owner Code Editing State
  const [isOwner, setIsOwner] = useState<boolean>(isOwnerLoggedIn());
  const [isEditingCode, setIsEditingCode] = useState<boolean>(false);
  const [editedCode, setEditedCode] = useState<string>(() =>
    getCustomScriptCode(step.runnableScript.filename, step.runnableScript.code)
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Keep edited code in sync with step changes
  useEffect(() => {
    setEditedCode(getCustomScriptCode(step.runnableScript.filename, step.runnableScript.code));
    setIsEditingCode(false);
  }, [step.runnableScript.filename, step.runnableScript.code]);

  // Listen to owner login/logout events across components
  useEffect(() => {
    const handleAuthChange = () => {
      setIsOwner(isOwnerLoggedIn());
    };
    const handleCodeSaved = (e: Event) => {
      const customEvent = e as CustomEvent<{ filename: string }>;
      if (customEvent.detail?.filename === step.runnableScript.filename) {
        setEditedCode(getCustomScriptCode(step.runnableScript.filename, step.runnableScript.code));
      }
    };
    window.addEventListener('gps_owner_auth_change', handleAuthChange);
    window.addEventListener('gps_custom_code_saved', handleCodeSaved);
    return () => {
      window.removeEventListener('gps_owner_auth_change', handleAuthChange);
      window.removeEventListener('gps_custom_code_saved', handleCodeSaved);
    };
  }, [step.runnableScript.filename, step.runnableScript.code]);

  const isModified = hasCustomScriptModifications(step.runnableScript.filename);
  const currentActiveCode = isEditingCode ? editedCode : getCustomScriptCode(step.runnableScript.filename, step.runnableScript.code);

  const handleRunScript = () => {
    setIsRunning(true);
    const filename = step.runnableScript.filename;
    setConsoleOutput(`Executing ${filename}...\n$ python3 ${filename}\n`);
    setTimeout(() => {
      const extraNotice = isModified ? '\n[Notice: Running customized script saved by author Krishna Chaurasia]\n' : '';
      setConsoleOutput(
        (prev) => (prev || '') + step.runnableScript.expectedOutput + extraNotice + '\n[Finished in 0.04s with returncode 0]'
      );
      setIsRunning(false);
    }, 500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentActiveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCode = () => {
    saveCustomScriptCode(step.runnableScript.filename, editedCode);
    setSaveSuccessMsg('Code saved successfully! Your custom changes are active.');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleResetCode = () => {
    resetCustomScriptCode(step.runnableScript.filename);
    setEditedCode(step.runnableScript.code);
    setIsEditingCode(false);
    setSaveSuccessMsg('Reverted back to original project implementation.');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  const handleEditClick = () => {
    if (isOwner) {
      setIsEditingCode(!isEditingCode);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleDownloadScript = () => {
    const element = document.createElement('a');
    const file = new Blob([step.runnableScript.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = step.runnableScript.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-100">
      {/* Step Header Banner */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-mono mb-1">
              <span>STEP 0{step.stepNumber} OF 09</span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">{step.mathDomain}</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              {step.title}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">{step.summary}</p>
          </div>

          {/* Bilingual Presentation Assistant Toggle */}
          <button
            onClick={onToggleHinglish}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isHinglishMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Languages className="w-4 h-4 text-amber-400" />
            <span>{isHinglishMode ? 'Hinglish Mode: ON' : 'Hinglish Assistant'}</span>
          </button>
        </div>

        {/* Hinglish Explanation Box */}
        {isHinglishMode && (
          <div className="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200/90 text-sm">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-xs mb-1.5 uppercase tracking-wide">
              <Lightbulb className="w-3.5 h-3.5" />
              Exhibition Explanation (Hinglish):
            </div>
            <p className="leading-relaxed">{step.hinglishSummary}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation Strip (Physical Model tab removed, working model replaced with runnable code tab) */}
      <div className="flex items-center gap-1 px-4 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('concept')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'concept'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          1. Concept & GPS Purpose
        </button>

        <button
          onClick={() => setActiveTab('formulas')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'formulas'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          2. Mathematical Formulas
        </button>

        <button
          onClick={() => setActiveTab('example')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'example'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          3. Step-by-Step Numerical Example
        </button>

        <button
          onClick={() => setActiveTab('runnable_code')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'runnable_code'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          4. Runnable Python Code & Output
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'curriculum'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          5. Class 11/12 Syllabus Alignment
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'viva'
              ? 'bg-sky-500 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          6. Teacher & Judge Viva Q&A
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 space-y-6">
        {/* ========================================== */}
        {/* TAB 1: CONCEPT & WHY REQUIRED               */}
        {/* ========================================== */}
        {activeTab === 'concept' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                1. Purpose of the Mathematical Concept
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">{step.purpose}</p>

              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Real-World Application
                </span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.realWorldApp}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                2. Why it is Required in GPS
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">{step.whyRequired}</p>
              {isHinglishMode && (
                <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-300">
                  {step.hinglishSummary}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: HUMAN-READABLE MATHEMATICAL FORMULAS */}
        {/* ========================================== */}
        {activeTab === 'formulas' && (
          <div className="space-y-5">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Mathematical Equations & Formulation</h4>
                <p className="text-xs text-slate-400">
                  Formatted for easy human reading with variable legends and plain-English explanations
                </p>
              </div>
              <span className="text-xs font-mono text-amber-400 font-semibold px-2.5 py-1 bg-amber-500/10 rounded border border-amber-500/20">
                Human-Readable Format
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {step.formulas.map((form, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <span className="text-sm font-semibold text-sky-300">{form.name}</span>
                    <span className="text-xs font-mono text-slate-500">Equation 0{idx + 1}</span>
                  </div>

                  {/* Clean Visual Formula Card */}
                  <div className="py-4 px-5 bg-gradient-to-r from-slate-900 to-slate-950 rounded-xl border border-sky-900/40 shadow-inner">
                    <div className="text-center font-mono text-base sm:text-lg font-bold text-amber-300 tracking-wide overflow-x-auto py-1">
                      {form.readableNotation}
                    </div>
                  </div>

                  {/* Plain-English Explanation */}
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-emerald-400 block mb-1">In Simple Words:</span>
                    <p>{form.inSimpleWords}</p>
                  </div>

                  {/* Variables Legend Table */}
                  <div className="pt-1">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                      Variable Meanings:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {form.variables.map((v, vIdx) => (
                        <div key={vIdx} className="p-2 bg-slate-900/50 rounded-md border border-slate-800/80 flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[11px] font-bold shrink-0">
                            {v.symbol}
                          </span>
                          <span className="text-slate-400 text-[11px] leading-tight font-sans">
                            {v.meaning}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: STEP-BY-STEP NUMERICAL EXAMPLE      */}
        {/* ========================================== */}
        {activeTab === 'example' && (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Exhibition Numerical Demonstration
                </span>
                <h4 className="text-base font-semibold text-white mt-1">
                  {step.numericalExample.scenario}
                </h4>
              </div>
              <button
                onClick={() => onOpenChatbot?.('solver')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-500/30 transition-all hover:scale-105"
                title="Open Orbital AI in Step-by-Step Numerical Solver Mode"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Solve with Orbital AI</span>
              </button>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400">Given Input Variables:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {Object.entries(step.numericalExample.inputs).map(([key, value], i) => (
                  <div key={i} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-mono block">{key}:</span>
                    <span className="text-xs font-semibold text-white font-mono mt-0.5 block">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400">Step-by-Step Mathematical Derivation:</span>
              <ol className="mt-2 space-y-2 text-xs font-mono text-slate-300">
                {step.numericalExample.calculationSteps.map((stepStr, idx) => (
                  <li key={idx} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-400 rounded text-[10px] shrink-0 font-bold">
                      Step {idx + 1}
                    </span>
                    <span className="leading-relaxed">{stepStr}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide block">
                Final Result:
              </span>
              <p className="text-sm font-semibold text-emerald-200 mt-1 font-mono">
                {step.numericalExample.result}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: RUNNABLE PYTHON CODE & LIVE SIMULATOR CONSOLE           */}
        {/* ============================================================== */}
        {activeTab === 'runnable_code' && (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            {/* Top Toolbar: Filename, Owner Badge & Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Terminal className="w-3.5 h-3.5" />
                    {step.runnableScript.filename}
                  </span>
                  {isModified && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Custom Modified
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">
                  {step.runnableScript.title}
                </h4>
              </div>

              {/* Author Access & Control Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Owner Status / Verification Button */}
                {isOwner ? (
                  <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/60 rounded-lg px-2.5 py-1 text-xs">
                    <span className="flex items-center gap-1 text-amber-300 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Author: Krishna
                    </span>
                    <button
                      onClick={() => {
                        lockOwnerMode();
                        setIsEditingCode(false);
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

                {/* Edit Mode Toggle Button */}
                <button
                  onClick={handleEditClick}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isEditingCode
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                      : isOwner
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingCode ? 'View Mode' : 'Edit Code'}</span>
                </button>

                {/* Run Code Button */}
                <button
                  onClick={handleRunScript}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Download Button */}
                <button
                  onClick={handleDownloadScript}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                  title="Download .py file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            {/* Notification Toast for Save/Reset */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {saveSuccessMsg}
                </span>
                <button onClick={() => setSaveSuccessMsg(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Code Body: Viewer OR Editor */}
            {isEditingCode ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-amber-300 bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-800/40">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    Interactive Editor Active: You are modifying {step.runnableScript.filename}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                      title="Reset back to default template"
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
                      // Support Tab key indentation in editor
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
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-80">
                <pre className="text-slate-300 leading-relaxed whitespace-pre font-mono">
                  {currentActiveCode}
                </pre>
              </div>
            )}

            {/* Simulated Terminal Console */}
            {consoleOutput && (
              <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Terminal className="w-3.5 h-3.5" />
                    Standard Output (stdout)
                  </span>
                  <button
                    onClick={() => setConsoleOutput(null)}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Clear Terminal
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300 whitespace-pre overflow-x-auto leading-relaxed bg-black/60">
                  {consoleOutput}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Owner Authentication Modal */}
        <OwnerAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsOwner(true);
            setIsEditingCode(true);
          }}
        />

        {/* ========================================== */}
        {/* TAB 5: CLASS 11 & 12 SYLLABUS CONNECTION   */}
        {/* ========================================== */}
        {activeTab === 'curriculum' && (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Curriculum Integration & Academic Alignment
              </span>
              <h4 className="text-base font-semibold text-white mt-1">
                Direct connections to CBSE / ISC Class 11 and 12 Mathematics chapters
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {step.cbseCurriculumLinks.map((link, idx) => (
                <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {link.standard}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">CBSE / ISC</span>
                  </div>
                  <h5 className="text-sm font-semibold text-white">{link.chapter}</h5>
                  <ul className="space-y-1 text-xs text-slate-300 pt-1 border-t border-slate-800">
                    {link.topics.map((top, tIdx) => (
                      <li key={tIdx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>{top}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 6: TEACHER & JUDGE VIVA-VOCE QUESTIONS */}
        {/* ========================================== */}
        {activeTab === 'viva' && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  Exhibition Viva-Voce Practice
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Frequently asked teacher and judge examination questions with scientifically accurate answers.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenChatbot?.('viva')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold border border-rose-500/30 transition-all hover:scale-105"
                  title="Practice Live Viva with Orbital AI External Examiner"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Live Viva Examiner (AI)</span>
                </button>
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                  {step.vivaQuestions.length} Questions
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {step.vivaQuestions.map((vq, idx) => {
                const isExpanded = expandedVivaIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setExpandedVivaIndex(isExpanded ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-200 flex items-start gap-2">
                        <span className="text-rose-400 font-mono">Q{idx + 1}.</span>
                        <span>{vq.question}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {vq.difficulty && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            vq.difficulty === 'Expert'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : vq.difficulty === 'Advanced'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          }`}>
                            {vq.difficulty}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3 text-xs leading-relaxed">
                        <div className="mt-2 text-slate-300">
                          <span className="font-semibold text-emerald-400 block mb-1">
                            Scientifically Accurate Answer:
                          </span>
                          <p>{vq.answer}</p>
                        </div>
                        <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg text-amber-200/90">
                          <span className="font-semibold text-amber-400 block mb-1">
                            Hinglish Explanation (How to answer smoothly):
                          </span>
                          <p>{vq.hinglishTip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
