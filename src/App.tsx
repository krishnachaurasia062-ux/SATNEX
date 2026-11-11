import React, { useState } from 'react';
import { NavigationHeader } from './components/NavigationHeader';
import { StepOverviewBar } from './components/StepOverviewBar';
import { ThreeGPSScene } from './components/ThreeGPSScene';
import { InteractiveSolver } from './components/InteractiveSolver';
import { StepDetailedContent } from './components/StepDetailedContent';
import { AllFilesCodeModal } from './components/AllFilesCodeModal';
import { VivaQuizTrainer } from './components/VivaQuizTrainer';
import { GpsChatbotModal, AiMode } from './components/GpsChatbotModal';
import { GPS_STEPS_DATA } from './data/gpsStepsData';
import {
  Compass,
  Code,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Bot,
} from 'lucide-react';

export default function App() {
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);
  const [isHinglishMode, setIsHinglishMode] = useState<boolean>(false);
  const [isAllCodeModalOpen, setIsAllCodeModalOpen] = useState<boolean>(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [chatbotInitialMode, setChatbotInitialMode] = useState<AiMode>('general');

  const currentStepData =
    GPS_STEPS_DATA.find((s) => s.stepNumber === currentStepNumber) || GPS_STEPS_DATA[0];

  const handleStartWalkthrough = () => {
    setCurrentStepNumber(1);
    const element = document.getElementById('step-details-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenChatbot = (mode: AiMode = 'general') => {
    setChatbotInitialMode(mode);
    setIsChatbotOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Header (Adheres to 3-Zone Contract) */}
      <NavigationHeader
        onOpenAllCodeModal={() => setIsAllCodeModalOpen(true)}
        onOpenVivaTrainer={() => setIsVivaModalOpen(true)}
        onOpenChatbot={() => handleOpenChatbot('general')}
        onStartWalkthrough={handleStartWalkthrough}
      />

      {/* Hero Exhibition Banner (Centered) */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <div
          className="flex flex-col items-center text-center justify-center gap-5 pb-8 border-b border-slate-800/80 rounded-3xl p-6 sm:p-8"
          style={{ backgroundColor: '#000000' }}
        >
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="inline-flex items-center justify-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-sky-400">
              <span className="uppercase tracking-wider font-semibold">Mathematics Exhibition Project</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400 font-medium">CBSE / ISC Class 11 & 12 Advanced Working Lab</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-balance leading-[1.15]"
              style={{ backgroundColor: '#000000', color: '#8db831' }}
            >
              The Mathematical Architecture of GPS Navigation
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance">
              How space satellite constellations determine millimeter-precise positions on Earth through{' '}
              <strong className="text-white font-semibold">Coordinate Geometry, Intersecting Spheres, Trilateration, WGS84 Trigonometry, Vectors, 3D Rotation Matrices, Orbital Calculus, Least Squares Optimization,</strong> and <strong className="text-white font-semibold">Graph Theory Route Planning</strong>.
            </p>
          </div>

          {/* Quick Action Badges (Centered) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAllCodeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700/80 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              Project Code Suite (9 Files)
            </button>
            <button
              onClick={() => setIsVivaModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Viva Q&A Practice
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* 1. 3D Celestial Constellation Visualizer (Three.js WebGL) */}
        <section id="celestial-model" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <h3 className="font-display font-bold text-base text-slate-200">
                Interactive 3D Earth, GPS Constellation & Trilateration Stage
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Interactive Viewport · Click & Drag to Orbit · Scroll to Zoom
            </span>
          </div>

          <ThreeGPSScene currentStep={currentStepNumber} />
        </section>

        {/* 2. Step Selector Bar (Positioned below the 3D visualization) */}
        <StepOverviewBar
          currentStep={currentStepNumber}
          onSelectStep={(num) => setCurrentStepNumber(num)}
        />

        {/* 3. Interactive Mathematical Workbench & Live Calculation Engine */}
        <section id="solver-section">
          <InteractiveSolver currentStep={currentStepNumber} />
        </section>

        {/* 4. Detailed Exhibition Study & Teaching Guide */}
        <section id="step-details-section">
          <StepDetailedContent
            step={currentStepData}
            isHinglishMode={isHinglishMode}
            onToggleHinglish={() => setIsHinglishMode(!isHinglishMode)}
            onOpenAllCodeModal={() => setIsAllCodeModalOpen(true)}
            onOpenChatbot={handleOpenChatbot}
          />
        </section>

        {/* Next Step Jump Footer Button */}
        <div className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
          <div>
            <span className="text-xs font-mono text-slate-500">CONTINUE WALKTHROUGH</span>
            <p className="text-sm font-semibold text-white mt-0.5">
              {currentStepNumber < 9
                ? `Next: Step 0${currentStepNumber + 1} - ${GPS_STEPS_DATA[currentStepNumber].title}`
                : 'Finished all 9 steps! Return to Step 1 (Coordinate Geometry)'}
            </p>
          </div>
          <button
            onClick={() => setCurrentStepNumber(currentStepNumber < 9 ? currentStepNumber + 1 : 1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            <span>Proceed to Step {currentStepNumber < 9 ? currentStepNumber + 1 : 1}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            GPS Navigation System · Advanced School Mathematics Exhibition Project · CBSE & ISC Curriculum
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Class 11 & 12 Mathematics</span>
            <span>·</span>
            <span>WGS84 Reference Standard</span>
          </div>
        </div>
      </footer>

      {/* Code Suite Modal (All 9 Files) */}
      <AllFilesCodeModal
        isOpen={isAllCodeModalOpen}
        onClose={() => setIsAllCodeModalOpen(false)}
        initialStep={currentStepNumber}
      />

      {/* Viva Q&A Practice Modal */}
      <VivaQuizTrainer
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />

      {/* Exhibition Mini AI Chatbot Modal */}
      <GpsChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        initialMode={chatbotInitialMode}
      />

      {/* Floating Action Button for Orbital AI Assistant */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => handleOpenChatbot('general')}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-full shadow-2xl hover:shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 border border-sky-400/30"
          title="Ask Orbital AI about GPS Mathematics"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">Ask Orbital AI</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-white/20 text-white uppercase hidden md:inline">
            Gemini
          </span>
        </button>
      </div>
    </div>
  );
}
