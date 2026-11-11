import React, { useState } from 'react';
import { X, HelpCircle, CheckCircle, ChevronRight, ChevronLeft, Sparkles, BookOpen } from 'lucide-react';
import { GPS_STEPS_DATA } from '../data/gpsStepsData';

interface VivaQuizTrainerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VivaQuizTrainer: React.FC<VivaQuizTrainerProps> = ({ isOpen, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean>(false);

  if (!isOpen) return null;

  // Flatten all viva questions across all 9 steps
  const allQuestions = GPS_STEPS_DATA.flatMap((s) =>
    s.vivaQuestions.map((vq) => ({
      ...vq,
      stepNumber: s.stepNumber,
      stepTitle: s.title,
      domain: s.mathDomain,
    }))
  );

  const currentQ = allQuestions[currentIdx];

  const nextQuestion = () => {
    setRevealed(false);
    setCurrentIdx((prev) => (prev + 1) % allQuestions.length);
  };

  const prevQuestion = () => {
    setRevealed(false);
    setCurrentIdx((prev) => (prev - 1 + allQuestions.length) % allQuestions.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Exhibition Viva-Voce Practice Trainer
              </h3>
              <p className="text-xs text-slate-400">
                Question {currentIdx + 1} of {allQuestions.length} · Step {currentQ.stepNumber} ({currentQ.domain})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Body */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Judge / Teacher Question:
            </span>
            <p className="text-base font-semibold text-white leading-relaxed">
              "{currentQ.question}"
            </p>
          </div>

          {/* Reveal Button or Answer */}
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Reveal Scientifically Accurate Model Answer & Hinglish Tip
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/40 space-y-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  Model Answer:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{currentQ.answer}</p>
              </div>

              <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/40 text-xs text-amber-200/90 space-y-1">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide block">
                  Hinglish Speaking Tip:
                </span>
                <p>{currentQ.hinglishTip}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={prevQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-xs font-mono text-slate-500">
            {currentIdx + 1} / {allQuestions.length}
          </span>

          <button
            onClick={nextQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Next Question <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
