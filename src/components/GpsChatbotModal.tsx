import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download,
  GraduationCap,
  Calculator,
  Hammer,
  Languages,
  ArrowRight,
  Code2,
} from 'lucide-react';

export type AiMode = 'general' | 'viva' | 'solver' | 'model';
export type AiLanguage = 'english' | 'hinglish';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: AiMode;
}

interface GpsChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AiMode;
}

const MODE_CONFIGS: Record<
  AiMode,
  { label: string; icon: React.FC<{ className?: string }>; description: string; welcomeMessage: string }
> = {
  general: {
    label: 'Exhibition Tutor',
    icon: Sparkles,
    description: 'Learn the 9 mathematical principles of GPS',
    welcomeMessage:
      "Hello! I'm **Orbital AI**, your comprehensive exhibition mathematics guide. Ask me about **coordinate geometry, intersecting spheres, trilateration, WGS84 trigonometry, vectors, rotation matrices, orbital calculus, optimization, or Dijkstra's algorithm**!",
  },
  viva: {
    label: 'Viva Examiner',
    icon: GraduationCap,
    description: 'Simulate CBSE/ISC viva with scores out of 10',
    welcomeMessage:
      "Welcome to **Viva Voce Examiner Mode**! 🎓 I will act as your strict, encouraging external mathematics examiner. Type **'Start Viva'** or click a suggestion below to begin. Answer my questions, and I will **grade your answer out of 10**, highlight technical gaps, and test you with follow-ups!",
  },
  solver: {
    label: 'Math & Numerical Solver',
    icon: Calculator,
    description: 'Step-by-step arithmetic and numerical solutions',
    welcomeMessage:
      "Welcome to **Numerical Solver Mode**! 📐 Ask me to compute 3D Euclidean distances, signal transit times, Bowring Latitude/Longitude coordinates, least-squares residuals, or Dijkstra shortest paths step-by-step with exact arithmetic!",
  },
  model: {
    label: 'Working Model Architect',
    icon: Hammer,
    description: 'Cardboard, LED, laser, and Arduino blueprints',
    welcomeMessage:
      "Welcome to **Physical & Working Model Guide**! 🛠️ Ask me how to construct black cardboard exhibition stands, laser/wire signal vectors, intersecting sphere models, or how to connect an Arduino with LCD to demonstrate live GPS math calculations!",
  },
};

const MODE_PROMPTS: Record<AiMode, string[]> = {
  general: [
    'Why are 4 satellites needed instead of 3 in GPS?',
    'How does trilateration differ from triangulation?',
    'Explain Einstein relativity clock correction (38 microseconds)',
    'How does WGS84 convert ECEF coordinates to Latitude and Longitude?',
    'What role does Dijkstra algorithm play in GPS turn-by-turn navigation?',
    'How does least-squares optimization reduce GPS positioning noise?',
  ],
  viva: [
    'Start Viva: Test me on GPS Mathematics!',
    'Why does 1 microsecond clock error create a 300m error?',
    'What geometric shape is formed by 2 intersecting spheres?',
    'How does Dijkstra handle dynamic traffic delays mathematically?',
    'Why is Earth modeled as an oblate spheroid instead of a sphere?',
    'Explain the role of the Jacobian matrix in GPS least squares.',
  ],
  solver: [
    'Calculate 3D distance between satellite (15000, 12000, 18000) and receiver (3800, 2200, 4800)',
    'Calculate signal travel time from 20,200 km altitude',
    'Convert ECEF coordinates to WGS84 Latitude and Longitude step-by-step',
    'Demonstrate least-squares normal equations with 5 satellite pseudoranges',
    'Show Dijkstra shortest path matrix calculation on a 5-node graph',
  ],
  model: [
    'How do I build the physical cardboard model for school exhibition?',
    'How can I demonstrate intersecting spheres using wire or acrylic rings?',
    'How can I use Arduino and an LCD to display live GPS calculations?',
    'What materials should I buy from local stationery for this project?',
    'How do I display 3D vectors using laser pointers or colored LED strings?',
  ],
};

export const GpsChatbotModal: React.FC<GpsChatbotModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'general',
}) => {
  const [activeMode, setActiveMode] = useState<AiMode>(initialMode);
  const [language, setLanguage] = useState<AiLanguage>('english');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: MODE_CONFIGS[initialMode].welcomeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: initialMode,
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Text-To-Speech (TTS) State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Stop speech when modal is closed
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleModeChange = (newMode: AiMode) => {
    if (newMode === activeMode) return;
    setActiveMode(newMode);
    setMessages((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        role: 'assistant',
        text: MODE_CONFIGS[newMode].welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: newMode,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          mode: activeMode,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const aiReplyText = data.reply || 'No response received from model.';

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setErrorMsg(err?.message || 'Failed to connect to Orbital AI assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: MODE_CONFIGS[activeMode].welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: activeMode,
      },
    ]);
    setErrorMsg(null);
  };

  // Text-To-Speech (Audio Voice Readout)
  const handleToggleSpeak = (messageId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown formatting for cleaner audio readout
    const cleanText = text
      .replace(/[#*`_$~]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\\Delta/g, 'Delta ')
      .replace(/\\cdot/g, ' times ')
      .replace(/\\approx/g, ' approximately ')
      .replace(/\\sqrt/g, ' square root of ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Export conversation as study notes (.md file)
  const handleExportNotes = () => {
    const formattedDate = new Date().toLocaleDateString();
    let fileContent = `# GPS Mathematics Exhibition – Study Notes & AI Consultation\n`;
    fileContent += `*Project Author: Krishna Chaurasia | Date: ${formattedDate}*\n\n---\n\n`;

    messages.forEach((m, idx) => {
      const sender = m.role === 'user' ? '👤 User Question' : '🛰️ Orbital AI Answer';
      fileContent += `### [${idx + 1}] ${sender} (${m.timestamp})\n\n${m.text}\n\n---\n\n`;
    });

    const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GPS_Math_Exhibition_Study_Notes_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to render markdown bold, bullet points, headers, and code snippets
  const renderFormattedText = (rawText: string) => {
    // Check if contains code blocks
    const parts = rawText.split(/(```[\s\S]*?```)/g);

    return parts.map((part, partIdx) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const hasLang = ['python', 'arduino', 'cpp', 'json', 'bash'].includes(firstLine.toLowerCase());
        const lang = hasLang ? firstLine : 'code';
        const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={partIdx} className="my-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Code2 className="w-3.5 h-3.5" />
                {lang.toUpperCase()}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(codeContent)}
                className="hover:text-white transition-colors"
                title="Copy Code"
              >
                Copy
              </button>
            </div>
            <pre className="p-3 text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
              {codeContent}
            </pre>
          </div>
        );
      }

      // Format markdown headers, bold, bullets
      const lines = part.split('\n');
      return (
        <div key={partIdx} className="space-y-1">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-1.5" />;

            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={idx} className="font-bold text-sky-300 text-sm mt-2 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                  {trimmed.replace('### ', '')}
                </h4>
              );
            }

            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={idx} className="font-bold text-white text-base mt-2 mb-1">
                  {trimmed.replace('## ', '')}
                </h3>
              );
            }

            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
            const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');

            return (
              <span
                key={idx}
                className={`block leading-relaxed ${
                  isBullet
                    ? 'pl-3.5 relative before:content-["•"] before:absolute before:left-0 before:text-sky-400'
                    : ''
                }`}
                dangerouslySetInnerHTML={{
                  __html: isBullet ? formattedLine.replace(/^[-*]\s*/, '') : formattedLine,
                }}
              />
            );
          })}
        </div>
      );
    });
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl h-[92vh] max-h-[820px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 text-white rounded-xl shadow-md">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">Orbital AI 2.0</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Gemini 3.8 Flash
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline">
                  Interactive Lab
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mathematics Exhibition Tutor · Viva Examiner · Numerical Solver · Model Architect
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'english' ? 'hinglish' : 'english')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                language === 'hinglish'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle English / Hinglish explanations"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'hinglish' ? '🇮🇳 Hinglish' : '🇬🇧 English'}</span>
            </button>

            {/* Export Study Notes */}
            <button
              onClick={handleExportNotes}
              className="p-1.5 text-slate-400 hover:text-sky-300 rounded-lg hover:bg-slate-800 transition-colors"
              title="Export Conversation as Study Notes (.md)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear History */}
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close Orbital AI"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Multi-Mode Persona Switcher Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-slate-950 border-b border-slate-800 shrink-0">
          {(Object.keys(MODE_CONFIGS) as AiMode[]).map((modeKey) => {
            const config = MODE_CONFIGS[modeKey];
            const Icon = config.icon;
            const isActive = activeMode === modeKey;

            return (
              <button
                key={modeKey}
                onClick={() => handleModeChange(modeKey)}
                className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600/30 to-indigo-600/30 border border-sky-500/50 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isActive ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold truncate leading-tight">
                    {config.label}
                  </span>
                  <span className="block text-[10px] text-slate-500 truncate leading-tight">
                    {config.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mode-Specific Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Prompts:
          </span>
          {MODE_PROMPTS[activeMode].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-sky-300 transition-colors whitespace-nowrap border border-slate-700/60 shrink-0 text-left disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 min-h-0 bg-slate-950/40">
          {messages.map((message) => {
            const isAi = message.role === 'assistant';
            const isCopied = copiedId === message.id;
            const isSpeaking = speakingMessageId === message.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 text-sm ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative group max-w-[88%] rounded-2xl px-4 sm:px-5 py-3.5 leading-relaxed shadow-md ${
                    isAi
                      ? 'bg-slate-800/90 text-slate-200 border border-slate-700/80'
                      : 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-normal'
                  }`}
                >
                  <div className="font-sans text-xs sm:text-sm">
                    {renderFormattedText(message.text)}
                  </div>

                  {/* Message Toolbar */}
                  <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span>{message.timestamp}</span>
                      {message.mode && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-900 border border-slate-700 uppercase font-mono text-slate-400">
                          {message.mode}
                        </span>
                      )}
                    </span>

                    {isAi && (
                      <div className="flex items-center gap-3">
                        {/* Audio Readout */}
                        <button
                          onClick={() => handleToggleSpeak(message.id, message.text)}
                          className={`hover:text-white transition-colors flex items-center gap-1 ${
                            isSpeaking ? 'text-amber-400 font-semibold animate-pulse' : 'text-slate-400'
                          }`}
                          title={isSpeaking ? 'Stop Audio' : 'Listen to Answer aloud (Text-to-Speech)'}
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                        </button>

                        {/* Copy Answer */}
                        <button
                          onClick={() => handleCopyMessage(message.id, message.text)}
                          className="hover:text-white transition-colors flex items-center gap-1"
                          title="Copy Answer to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-sm justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-xs text-sky-300">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-slate-300 font-medium">
                  Orbital AI ({MODE_CONFIGS[activeMode].label}) is analyzing mathematics...
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Generation Error</span>
                <span className="text-[11px] text-red-300/90 leading-relaxed">{errorMsg}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                activeMode === 'viva'
                  ? 'Type your answer or say "Start Viva Voce"...'
                  : activeMode === 'solver'
                  ? 'Enter problem or numbers (e.g. "Calculate 3D distance for satellite at...")'
                  : activeMode === 'model'
                  ? 'Ask how to construct physical cardboard, LED, or Arduino circuits...'
                  : 'Ask any GPS math question (e.g. "How does Bowring formula work?")...'
              }
              className="w-full pl-4 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 rounded-lg transition-all shadow-sm flex items-center justify-center disabled:cursor-not-allowed"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active Mode: <strong className="text-slate-300">{MODE_CONFIGS[activeMode].label}</strong>
              <span className="text-slate-600">·</span>
              Language: <strong className="text-slate-300">{language === 'hinglish' ? 'Hinglish' : 'English'}</strong>
            </span>
            <span>Press Enter to send · Audio Readout enabled</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
