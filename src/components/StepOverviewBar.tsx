import React from 'react';
import { GPS_STEPS_DATA } from '../data/gpsStepsData';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface StepOverviewBarProps {
  currentStep: number;
  onSelectStep: (stepNumber: number) => void;
}

export const StepOverviewBar: React.FC<StepOverviewBarProps> = ({
  currentStep,
  onSelectStep,
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <span className="text-xs font-mono text-sky-400">9-STEP MATHEMATICAL FRAMEWORK</span>
          <h3 className="text-sm font-display font-bold text-white">
            Choose a Mathematical Principle to Inspect & Calculate
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectStep(currentStep > 1 ? currentStep - 1 : 9)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 px-1">
            {currentStep} / 9
          </span>
          <button
            onClick={() => onSelectStep(currentStep < 9 ? currentStep + 1 : 1)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Steps Pill Buttons Bar (Segmented Controls) */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
        {GPS_STEPS_DATA.map((step) => {
          const isActive = step.stepNumber === currentStep;
          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.stepNumber)}
              className={`p-2 rounded-xl text-left transition-all border ${
                isActive
                  ? 'bg-sky-500 text-white border-sky-400 shadow-md font-semibold'
                  : 'bg-slate-950/70 text-slate-400 border-slate-800/80 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className={isActive ? 'text-sky-100' : 'text-slate-500'}>
                  0{step.stepNumber}
                </span>
                <span className={`text-[9px] ${isActive ? 'text-sky-100' : 'text-amber-500/80'}`}>
                  {step.stepNumber <= 4 ? 'Geom/Trig' : step.stepNumber <= 6 ? 'Vec/Calc' : step.stepNumber <= 8 ? 'Opt/Mat' : 'Graph'}
                </span>
              </div>
              <div className="text-xs font-display font-medium truncate">
                {step.shortTitle.replace(/^\d+\.\s*/, '')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
