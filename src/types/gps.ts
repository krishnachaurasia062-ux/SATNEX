export interface SatelliteData {
  id: number;
  prn: string;
  name: string;
  x: number; // in km
  y: number;
  z: number;
  vx?: number; // km/s
  vy?: number;
  vz?: number;
  clockBiasNs?: number;
  orbitalPlane?: number;
  trueDistance?: number;
  pseudorange?: number;
}

export interface ReceiverPosition {
  x: number;
  y: number;
  z: number;
  clockBiasMeters: number; // c * dt
  lat?: number;
  lon?: number;
  alt?: number;
}

export interface FormulaItem {
  name: string;
  readableNotation: string; // Beautifully formatted plain-text math, e.g. "d = √[(xs - xr)² + (ys - yr)² + (zs - zr)²]"
  latex: string;
  inSimpleWords: string;
  variables: { symbol: string; meaning: string }[];
}

export interface RunnableFileCode {
  filename: string;
  title: string;
  code: string;
  expectedOutput: string;
}

export interface VivaQuestionItem {
  question: string;
  answer: string;
  hinglishTip: string;
  difficulty?: 'Standard' | 'Advanced' | 'Expert';
}

export interface StepInfo {
  id: number;
  stepNumber: number;
  title: string;
  shortTitle: string;
  mathDomain: string;
  classConnection: string;
  summary: string;
  purpose: string;
  whyRequired: string;
  formulas: FormulaItem[];
  numericalExample: {
    scenario: string;
    inputs: Record<string, string | number>;
    calculationSteps: string[];
    result: string;
  };
  realWorldApp: string;
  runnableScript: RunnableFileCode;
  cbseCurriculumLinks: {
    standard: 'Class 11' | 'Class 12';
    chapter: string;
    topics: string[];
  }[];
  vivaQuestions: VivaQuestionItem[];
  hinglishSummary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  roadName: string;
}
