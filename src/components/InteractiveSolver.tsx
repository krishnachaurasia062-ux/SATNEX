import React, { useState, useMemo } from 'react';
import {
  calculate3DDistance,
  calculateSignalTravelTime,
  solveTrilaterationNewtonRaphson,
  ecefToGeodetic,
  geodeticToEcef,
  vectorSub,
  vectorDot,
  vectorNormalize,
  vectorMagnitude,
  calculateElevationAngle,
  calculateDopplerShift,
  rotationMatrixX,
  rotationMatrixY,
  rotationMatrixZ,
  multiplyMatrix3x3,
  ecefToEnu,
  calculateOrbitalVelocity,
  calculateOrbitalPeriodHours,
  calculateGravitationalAcceleration,
  computeLeastSquaresWithDop,
  runDijkstra,
  SPEED_OF_LIGHT,
  SPEED_OF_LIGHT_M,
  WGS84_A,
  WGS84_B,
} from '../utils/gpsMath';
import { Calculator, Play, RotateCcw, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface InteractiveSolverProps {
  currentStep: number;
}

export const InteractiveSolver: React.FC<InteractiveSolverProps> = ({ currentStep }) => {
  // ==========================================
  // STEP 1 STATE: 3D Distance
  // ==========================================
  const [s1SatX, setS1SatX] = useState<number>(15600);
  const [s1SatY, setS1SatY] = useState<number>(7540);
  const [s1SatZ, setS1SatZ] = useState<number>(20140);
  const [s1RecX, setS1RecX] = useState<number>(3800);
  const [s1RecY, setS1RecY] = useState<number>(1500);
  const [s1RecZ, setS1RecZ] = useState<number>(4800);

  const step1Distance = useMemo(() => {
    return calculate3DDistance(
      { x: s1SatX, y: s1SatY, z: s1SatZ },
      { x: s1RecX, y: s1RecY, z: s1RecZ }
    );
  }, [s1SatX, s1SatY, s1SatZ, s1RecX, s1RecY, s1RecZ]);

  const step1Time = useMemo(() => {
    return calculateSignalTravelTime(step1Distance);
  }, [step1Distance]);

  // ==========================================
  // STEP 2 STATE: Spheres Intersection
  // ==========================================
  const [s2R1, setS2R1] = useState<number>(20000);
  const [s2R2, setS2R2] = useState<number>(22000);
  const [s2D, setS2D] = useState<number>(18000); // distance between centers

  const step2Intersection = useMemo(() => {
    // If d > r1 + r2: disjoint
    // If d < |r1 - r2|: nested
    // Otherwise intersect in a circle
    if (s2D > s2R1 + s2R2) return { status: 'Disjoint (No intersection)', circleRadius: 0, xPlane: 0 };
    if (s2D < Math.abs(s2R1 - s2R2)) return { status: 'Nested (No intersection)', circleRadius: 0, xPlane: 0 };
    // x = (d^2 - r2^2 + r1^2) / (2d)
    const x = (s2D * s2D - s2R2 * s2R2 + s2R1 * s2R1) / (2 * s2D);
    const rSq = s2R1 * s2R1 - x * x;
    const rCircle = rSq > 0 ? Math.sqrt(rSq) : 0;
    return {
      status: 'Intersects in a 2D Circle',
      circleRadius: rCircle,
      xPlane: x,
    };
  }, [s2R1, s2R2, s2D]);

  // ==========================================
  // STEP 3 STATE: 4-Sat Trilateration
  // ==========================================
  const [trilaterationSats, setTrilaterationSats] = useState([
    { x: 15600, y: 7540, z: 20140, pseudorange: 20580.4 },
    { x: 18760, y: 2750, z: 18610, pseudorange: 19850.2 },
    { x: 17610, y: 14600, z: 13480, pseudorange: 21820.6 },
    { x: 19170, y: 610, z: 18390, pseudorange: 20110.8 },
  ]);

  const step3Solution = useMemo(() => {
    return solveTrilaterationNewtonRaphson(trilaterationSats);
  }, [trilaterationSats]);

  // ==========================================
  // STEP 4 STATE: ECEF to WGS84
  // ==========================================
  const [geoEcefX, setGeoEcefX] = useState<number>(1334.2);
  const [geoEcefY, setGeoEcefY] = useState<number>(-4654.1);
  const [geoEcefZ, setGeoEcefZ] = useState<number>(4138.8);

  const step4Geodetic = useMemo(() => {
    return ecefToGeodetic(geoEcefX, geoEcefY, geoEcefZ);
  }, [geoEcefX, geoEcefY, geoEcefZ]);

  const loadCityPreset = (preset: 'Delhi' | 'NYC' | 'London' | 'Tokyo') => {
    if (preset === 'Delhi') {
      const e = geodeticToEcef(28.6139, 77.209, 0.216);
      setGeoEcefX(Number(e.x.toFixed(1)));
      setGeoEcefY(Number(e.y.toFixed(1)));
      setGeoEcefZ(Number(e.z.toFixed(1)));
    } else if (preset === 'NYC') {
      setGeoEcefX(1334.2);
      setGeoEcefY(-4654.1);
      setGeoEcefZ(4138.8);
    } else if (preset === 'London') {
      const e = geodeticToEcef(51.5074, -0.1278, 0.035);
      setGeoEcefX(Number(e.x.toFixed(1)));
      setGeoEcefY(Number(e.y.toFixed(1)));
      setGeoEcefZ(Number(e.z.toFixed(1)));
    } else if (preset === 'Tokyo') {
      const e = geodeticToEcef(35.6762, 139.6503, 0.04);
      setGeoEcefX(Number(e.x.toFixed(1)));
      setGeoEcefY(Number(e.y.toFixed(1)));
      setGeoEcefZ(Number(e.z.toFixed(1)));
    }
  };

  // ==========================================
  // STEP 5 STATE: Vectors & Angles
  // ==========================================
  const [satVelX, setSatVelX] = useState<number>(-1.5);
  const [satVelY, setSatVelY] = useState<number>(2.4);
  const [satVelZ, setSatVelZ] = useState<number>(2.2);

  const step5VectorAnalysis = useMemo(() => {
    const satPos = { x: s1SatX, y: s1SatY, z: s1SatZ };
    const recPos = { x: s1RecX, y: s1RecY, z: s1RecZ };
    const los = vectorSub(satPos, recPos);
    const losUnit = vectorNormalize(los);
    const satVel = { x: satVelX, y: satVelY, z: satVelZ };
    const speed = vectorMagnitude(satVel);
    const elev = calculateElevationAngle(satPos, recPos);
    const doppler = calculateDopplerShift(satPos, satVel, recPos);

    return { los, losUnit, speed, elevation: elev.elevationDeg, azimuth: elev.azimuthDeg, doppler };
  }, [s1SatX, s1SatY, s1SatZ, s1RecX, s1RecY, s1RecZ, satVelX, satVelY, satVelZ]);

  // ==========================================
  // STEP 6 STATE: Calculus & Orbital Motion
  // ==========================================
  const [orbitalAltitudeKm, setOrbitalAltitudeKm] = useState<number>(20180);

  const step6Calculus = useMemo(() => {
    const r = 6371 + orbitalAltitudeKm;
    const v = calculateOrbitalVelocity(r);
    const T = calculateOrbitalPeriodHours(r);
    const g = calculateGravitationalAcceleration(r);
    return { r, v, T, g };
  }, [orbitalAltitudeKm]);

  // ==========================================
  // STEP 7 STATE: Least Squares & GDOP
  // ==========================================
  const [numSatellites, setNumSatellites] = useState<number>(6);
  const [noiseStdDev, setNoiseStdDev] = useState<number>(5); // meters

  const step7LeastSquares = useMemo(() => {
    const baseSats = [
      { x: 15600, y: 7540, z: 20140, pseudorange: 20580.4 },
      { x: 18760, y: 2750, z: 18610, pseudorange: 19850.2 },
      { x: 17610, y: 14600, z: 13480, pseudorange: 21820.6 },
      { x: 19170, y: 610, z: 18390, pseudorange: 20110.8 },
      { x: 12400, y: 18900, z: 16200, pseudorange: 22400.1 },
      { x: 21500, y: 8200, z: 14100, pseudorange: 19450.5 },
      { x: 14200, y: 12100, z: 21300, pseudorange: 21100.9 },
      { x: 16800, y: 3900, z: 22400, pseudorange: 20950.3 },
    ];

    const selectedSats = baseSats.slice(0, numSatellites).map((s, idx) => {
      // Deterministic pseudo-noise for repeatable mathematical exhibition
      const noise = ((idx % 2 === 0 ? 1 : -1) * noiseStdDev) / 1000; // km
      return { ...s, pseudorange: s.pseudorange + noise };
    });

    return computeLeastSquaresWithDop(selectedSats);
  }, [numSatellites, noiseStdDev]);

  // ==========================================
  // STEP 8 STATE: Rotation Matrices
  // ==========================================
  const [rotAngleX, setRotAngleX] = useState<number>(15);
  const [rotAngleY, setRotAngleY] = useState<number>(30);
  const [rotAngleZ, setRotAngleZ] = useState<number>(45);

  const step8Matrix = useMemo(() => {
    const Rx = rotationMatrixX(rotAngleX);
    const Ry = rotationMatrixY(rotAngleY);
    const Rz = rotationMatrixZ(rotAngleZ);
    // Combined R = Rz * Ry * Rx
    const Rzy = multiplyMatrix3x3(Rz, Ry);
    const Rtotal = multiplyMatrix3x3(Rzy, Rx);
    return Rtotal;
  }, [rotAngleX, rotAngleY, rotAngleZ]);

  // ==========================================
  // STEP 9 STATE: Graph Theory & Dijkstra
  // ==========================================
  const graphNodes = useMemo(
    () => [
      { id: 'A', label: 'Point A (Receiver)' },
      { id: 'B', label: 'Intersection B' },
      { id: 'C', label: 'Intersection C' },
      { id: 'D', label: 'Intersection D' },
      { id: 'E', label: 'Intersection E' },
      { id: 'F', label: 'Point F (Destination)' },
      { id: 'G', label: 'Intersection G' },
    ],
    []
  );

  const graphEdges = useMemo(
    () => [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'C', weight: 2 },
      { from: 'B', to: 'C', weight: 1 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'C', to: 'D', weight: 8 },
      { from: 'C', to: 'E', weight: 10 },
      { from: 'D', to: 'E', weight: 2 },
      { from: 'D', to: 'F', weight: 6 },
      { from: 'E', to: 'F', weight: 3 },
      { from: 'B', to: 'G', weight: 7 },
      { from: 'G', to: 'F', weight: 4 },
    ],
    []
  );

  const [startNode, setStartNode] = useState<string>('A');
  const [destNode, setDestNode] = useState<string>('F');
  const [dijkstraStepIdx, setDijkstraStepIdx] = useState<number>(0);

  const dijkstraResult = useMemo(() => {
    return runDijkstra(graphNodes, graphEdges, startNode, destNode);
  }, [graphNodes, graphEdges, startNode, destNode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      {/* Step-Specific Solver Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h3 className="font-display font-bold text-lg text-slate-100">
            Interactive Mathematical Solver & Live Verification
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Step {currentStep} Active Engine</span>
      </div>

      <div className="mt-5">
        {/* ========================================================= */}
        {/* STEP 1 SOLVER: 3D Euclidean Distance & Light Travel Time */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Input 3D Cartesian coordinates for Satellite Transmitter (Xs, Ys, Zs) and Ground Receiver (Xr, Yr, Zr) in kilometers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Satellite Inputs */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">
                  Satellite Coordinates (km)
                </span>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="text-xs text-slate-400 font-mono">Xs:</label>
                    <input
                      type="number"
                      value={s1SatX}
                      onChange={(e) => setS1SatX(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono">Ys:</label>
                    <input
                      type="number"
                      value={s1SatY}
                      onChange={(e) => setS1SatY(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono">Zs:</label>
                    <input
                      type="number"
                      value={s1SatZ}
                      onChange={(e) => setS1SatZ(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Receiver Inputs */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  Receiver Coordinates (km)
                </span>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="text-xs text-slate-400 font-mono">Xr:</label>
                    <input
                      type="number"
                      value={s1RecX}
                      onChange={(e) => setS1RecX(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono">Yr:</label>
                    <input
                      type="number"
                      value={s1RecY}
                      onChange={(e) => setS1RecY(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-mono">Zr:</label>
                    <input
                      type="number"
                      value={s1RecZ}
                      onChange={(e) => setS1RecZ(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Calculation Box */}
            <div className="bg-slate-950 p-5 rounded-xl border border-sky-900/50 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-sky-400 font-semibold text-sm">
                <span>Class 11 Euclidean 3D Calculation Breakdown:</span>
                <span>c = {SPEED_OF_LIGHT.toLocaleString()} km/s</span>
              </div>
              <div className="text-slate-300 space-y-1">
                <p>Δx = {s1SatX} - {s1RecX} = {(s1SatX - s1RecX).toFixed(1)} km</p>
                <p>Δy = {s1SatY} - {s1RecY} = {(s1SatY - s1RecY).toFixed(1)} km</p>
                <p>Δz = {s1SatZ} - {s1RecZ} = {(s1SatZ - s1RecZ).toFixed(1)} km</p>
                <p className="text-amber-300 font-bold">
                  d = √[({(s1SatX - s1RecX).toFixed(1)})² + ({(s1SatY - s1RecY).toFixed(1)})² + ({(s1SatZ - s1RecZ).toFixed(1)})²]
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-xs">Calculated Euclidean Distance:</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {step1Distance.toLocaleString(undefined, { maximumFractionDigits: 3 })} km
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ({(step1Distance * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} meters)
                  </p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-xs">Radio Signal Travel Time (Δt = d / c):</span>
                  <p className="text-lg font-bold text-cyan-400 mt-1">
                    {step1Time.milliseconds.toFixed(3)} ms
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ({step1Time.microseconds.toFixed(1)} microseconds)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2 SOLVER: Spheres & Intersection Circle               */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Explore how two spheres intersect in 3D space. Adjust radii r1, r2 and distance between satellite centers d.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-rose-400">Sphere 1 Radius (r1): {s2R1.toLocaleString()} km</label>
                <input
                  type="range"
                  min="5000"
                  max="30000"
                  step="500"
                  value={s2R1}
                  onChange={(e) => setS2R1(parseFloat(e.target.value))}
                  className="w-full mt-3 accent-rose-500"
                />
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-emerald-400">Sphere 2 Radius (r2): {s2R2.toLocaleString()} km</label>
                <input
                  type="range"
                  min="5000"
                  max="30000"
                  step="500"
                  value={s2R2}
                  onChange={(e) => setS2R2(parseFloat(e.target.value))}
                  className="w-full mt-3 accent-emerald-500"
                />
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-sky-400">Center Distance (d): {s2D.toLocaleString()} km</label>
                <input
                  type="range"
                  min="2000"
                  max="40000"
                  step="500"
                  value={s2D}
                  onChange={(e) => setS2D(parseFloat(e.target.value))}
                  className="w-full mt-3 accent-sky-500"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Intersection Status:</span>
                <span className={`font-bold px-2.5 py-1 rounded-md ${
                  step2Intersection.status.includes('Circle') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {step2Intersection.status}
                </span>
              </div>
              <div className="space-y-1 text-slate-400">
                <p>Triangular Inequality Test: |r1 - r2| ≤ d ≤ (r1 + r2)</p>
                <p>|{s2R1} - {s2R2}| = {Math.abs(s2R1 - s2R2).toLocaleString()} km ≤ {s2D.toLocaleString()} km ≤ {(s2R1 + s2R2).toLocaleString()} km</p>
              </div>
              {step2Intersection.circleRadius > 0 && (
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Intersection Circle Radius (R_circle):</span>
                    <p className="text-lg font-bold text-cyan-400 mt-1">
                      {step2Intersection.circleRadius.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
                    </p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Radical Plane Position (x from Center 1):</span>
                    <p className="text-lg font-bold text-amber-400 mt-1">
                      {step2Intersection.xPlane.toLocaleString(undefined, { maximumFractionDigits: 1 })} km
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3 SOLVER: 4-Satellite Nonlinear Trilateration        */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Solve the 4 nonlinear pseudorange equations for the 4 unknowns: Receiver (X, Y, Z) and Receiver Clock Bias offset (c · δtr).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">Satellite</th>
                    <th className="py-2 px-3">X (km)</th>
                    <th className="py-2 px-3">Y (km)</th>
                    <th className="py-2 px-3">Z (km)</th>
                    <th className="py-2 px-3">Measured Pseudorange ρ (km)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {trilaterationSats.map((sat, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-sky-400">Sat PRN-{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={sat.x}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTrilaterationSats((prev) => {
                              const next = [...prev];
                              next[idx].x = val;
                              return next;
                            });
                          }}
                          className="w-20 bg-slate-950 border border-slate-700 px-1.5 py-1 rounded text-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={sat.y}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTrilaterationSats((prev) => {
                              const next = [...prev];
                              next[idx].y = val;
                              return next;
                            });
                          }}
                          className="w-20 bg-slate-950 border border-slate-700 px-1.5 py-1 rounded text-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={sat.z}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTrilaterationSats((prev) => {
                              const next = [...prev];
                              next[idx].z = val;
                              return next;
                            });
                          }}
                          className="w-20 bg-slate-950 border border-slate-700 px-1.5 py-1 rounded text-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={sat.pseudorange}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTrilaterationSats((prev) => {
                              const next = [...prev];
                              next[idx].pseudorange = val;
                              return next;
                            });
                          }}
                          className="w-24 bg-slate-950 border border-slate-700 px-1.5 py-1 rounded text-white"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Solved Results */}
            <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-semibold text-sm">
                <span>Newton-Raphson Solver Results:</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Converged in {step3Solution.iterations} iterations
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Solved Xr:</span>
                  <p className="text-sm font-bold text-white mt-1">{step3Solution.x.toFixed(2)} km</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Solved Yr:</span>
                  <p className="text-sm font-bold text-white mt-1">{step3Solution.y.toFixed(2)} km</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Solved Zr:</span>
                  <p className="text-sm font-bold text-white mt-1">{step3Solution.z.toFixed(2)} km</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Receiver Clock Bias (δtr):</span>
                  <p className="text-sm font-bold text-amber-400 mt-1">
                    {((step3Solution.clockBiasKm / SPEED_OF_LIGHT) * 1000000).toFixed(2)} μs
                  </p>
                  <p className="text-[10px] text-slate-500">({(step3Solution.clockBiasKm * 1000).toFixed(1)} m offset)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4 SOLVER: ECEF to WGS84 Geodetic Converter           */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">
                Convert Earth-Centered Earth-Fixed (ECEF) coordinates to Latitude, Longitude, and Altitude via Bowring’s formula.
              </p>
              {/* City Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400">Presets:</span>
                {(['Delhi', 'NYC', 'London', 'Tokyo'] as const).map((city) => (
                  <button
                    key={city}
                    onClick={() => loadCityPreset(city)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-md transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-rose-400 font-mono">ECEF X (km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={geoEcefX}
                  onChange={(e) => setGeoEcefX(parseFloat(e.target.value) || 0)}
                  className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white text-sm"
                />
              </div>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-emerald-400 font-mono">ECEF Y (km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={geoEcefY}
                  onChange={(e) => setGeoEcefY(parseFloat(e.target.value) || 0)}
                  className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white text-sm"
                />
              </div>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-sky-400 font-mono">ECEF Z (km):</label>
                <input
                  type="number"
                  step="0.1"
                  value={geoEcefZ}
                  onChange={(e) => setGeoEcefZ(parseFloat(e.target.value) || 0)}
                  className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-white text-sm"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-sky-900/40 space-y-4 font-mono text-xs">
              <div className="text-sky-400 font-semibold text-sm">
                Bowring’s WGS84 Geodetic Transformation Output:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-xs">Geodetic Latitude (φ):</span>
                  <p className="text-lg font-bold text-amber-400 mt-1">
                    {Math.abs(step4Geodetic.latitudeDeg).toFixed(5)}° {step4Geodetic.latitudeDeg >= 0 ? 'N' : 'S'}
                  </p>
                  <p className="text-[10px] text-slate-500">({step4Geodetic.latitudeRad.toFixed(5)} rad)</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-xs">Geodetic Longitude (λ):</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">
                    {Math.abs(step4Geodetic.longitudeDeg).toFixed(5)}° {step4Geodetic.longitudeDeg >= 0 ? 'E' : 'W'}
                  </p>
                  <p className="text-[10px] text-slate-500">atan2(Y, X) = {step4Geodetic.longitudeRad.toFixed(5)} rad</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-xs">Ellipsoidal Height (h):</span>
                  <p className="text-lg font-bold text-cyan-400 mt-1">
                    {(step4Geodetic.altitudeKm * 1000).toFixed(1)} meters
                  </p>
                  <p className="text-[10px] text-slate-500">Above WGS84 reference ellipsoid</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 5 SOLVER: Vectors & Doppler Shift                     */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Calculate the 3D Line-of-Sight vector ρ, unit pointing vector û, satellite elevation angle above local horizon, and Doppler frequency shift on L1 carrier (1575.42 MHz).
            </p>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                Satellite Velocity Vector (km/s)
              </span>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="text-xs text-slate-400 font-mono">vx:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={satVelX}
                    onChange={(e) => setSatVelX(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-mono">vy:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={satVelY}
                    onChange={(e) => setSatVelY(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-mono">vz:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={satVelZ}
                    onChange={(e) => setSatVelZ(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-indigo-400 font-semibold text-sm">
                Vector Algebra & Doppler Results:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Total Speed ||v||:</span>
                  <p className="text-base font-bold text-white mt-1">{step5VectorAnalysis.speed.toFixed(3)} km/s</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Elevation Angle:</span>
                  <p className={`text-base font-bold mt-1 ${step5VectorAnalysis.elevation >= 10 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {step5VectorAnalysis.elevation.toFixed(1)}°
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {step5VectorAnalysis.elevation >= 10 ? 'Above 10° Mask (Visible)' : 'Below Mask (Blocked)'}
                  </p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Azimuth Angle:</span>
                  <p className="text-base font-bold text-cyan-400 mt-1">{step5VectorAnalysis.azimuth.toFixed(1)}°</p>
                  <p className="text-[10px] text-slate-500">From True North</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Doppler Shift (Δf):</span>
                  <p className="text-base font-bold text-amber-400 mt-1">
                    {step5VectorAnalysis.doppler >= 0 ? '+' : ''}{step5VectorAnalysis.doppler.toFixed(1)} Hz
                  </p>
                  <p className="text-[10px] text-slate-500">f0 = 1575.42 MHz</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 6 SOLVER: Orbital Motion Calculus                    */}
        {/* ========================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Calculate satellite orbital dynamics using Newton’s law of gravitation and calculus derivatives: v = √(GM/r) and T = 2π√(r³/GM).
            </p>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-sky-400 font-mono">
                <span>Satellite Orbital Altitude (h above Earth crust):</span>
                <span>{orbitalAltitudeKm.toLocaleString()} km</span>
              </div>
              <input
                type="range"
                min="500"
                max="36000"
                step="200"
                value={orbitalAltitudeKm}
                onChange={(e) => setOrbitalAltitudeKm(parseInt(e.target.value))}
                className="w-full mt-3 accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>LEO (500 km)</span>
                <span className="text-amber-400 font-bold">GPS MEO (20,180 km)</span>
                <span>GEO (35,786 km)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Orbital Speed v = dr/dt:</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  {step6Calculus.v.toFixed(3)} km/s
                </p>
                <p className="text-[10px] text-slate-500">({(step6Calculus.v * 3600).toFixed(0)} km/h)</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Orbital Period (T):</span>
                <p className="text-lg font-bold text-cyan-400 mt-1">
                  {step6Calculus.T.toFixed(2)} hours
                </p>
                <p className="text-[10px] text-slate-500">
                  {Math.abs(step6Calculus.T - 11.96) < 0.2 ? 'Half Sidereal Day (2 orbits/day)' : 'Custom Period'}
                </p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Gravitational Acceleration:</span>
                <p className="text-lg font-bold text-amber-400 mt-1">
                  {step6Calculus.g.toFixed(3)} m/s²
                </p>
                <p className="text-[10px] text-slate-500">a = GM / r²</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 7 SOLVER: Least Squares & GDOP                       */}
        {/* ========================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Solve an overdetermined system (m ≥ 4 satellites) using Least Squares (Hᵀ H)⁻¹ Hᵀ Δρ and evaluate Dilution of Precision (DOP).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-sky-400 font-mono">
                  Number of Tracked Satellites: {numSatellites}
                </label>
                <input
                  type="range"
                  min="4"
                  max="8"
                  value={numSatellites}
                  onChange={(e) => setNumSatellites(parseInt(e.target.value))}
                  className="w-full mt-2 accent-sky-500"
                />
                <span className="text-[10px] text-slate-500">More satellites = lower GDOP error</span>
              </div>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-rose-400 font-mono">
                  Pseudorange Noise (σ): ±{noiseStdDev} meters
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={noiseStdDev}
                  onChange={(e) => setNoiseStdDev(parseInt(e.target.value))}
                  className="w-full mt-2 accent-rose-500"
                />
                <span className="text-[10px] text-slate-500">Simulates atmospheric & multipath noise</span>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Dilution of Precision Metrics (from Q = (Hᵀ H)⁻¹):</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  step7LeastSquares.dop.gdop <= 2.5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {step7LeastSquares.dop.gdop <= 2.5 ? 'Excellent Geometry' : 'Moderate Geometry'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">GDOP:</span>
                  <p className="text-base font-bold text-white mt-0.5">{step7LeastSquares.dop.gdop}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">PDOP (3D Pos):</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{step7LeastSquares.dop.pdop}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">HDOP (Horiz):</span>
                  <p className="text-base font-bold text-cyan-400 mt-0.5">{step7LeastSquares.dop.hdop}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">VDOP (Vert):</span>
                  <p className="text-base font-bold text-amber-400 mt-0.5">{step7LeastSquares.dop.vdop}</p>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">TDOP (Time):</span>
                  <p className="text-base font-bold text-purple-400 mt-0.5">{step7LeastSquares.dop.tdop}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 8 SOLVER: 3D Rotation Matrices                       */}
        {/* ========================================================= */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Interactive 3D Euler rotation matrix R = Rz(γ) · Ry(β) · Rx(α). Adjust angles and observe live 3x3 matrix coefficients.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-rose-400 font-mono">Roll Angle α (X-axis): {rotAngleX}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotAngleX}
                  onChange={(e) => setRotAngleX(parseInt(e.target.value))}
                  className="w-full mt-2 accent-rose-500"
                />
              </div>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-emerald-400 font-mono">Pitch Angle β (Y-axis): {rotAngleY}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotAngleY}
                  onChange={(e) => setRotAngleY(parseInt(e.target.value))}
                  className="w-full mt-2 accent-emerald-500"
                />
              </div>
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs font-semibold text-sky-400 font-mono">Yaw Angle γ (Z-axis): {rotAngleZ}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotAngleZ}
                  onChange={(e) => setRotAngleZ(parseInt(e.target.value))}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <span className="text-slate-400">Resulting 3x3 Orthogonal Rotation Matrix R (det R = +1):</span>
              <div className="max-w-md mx-auto bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                {step8Matrix.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-3 gap-3 text-center">
                    {row.map((val, cIdx) => (
                      <span
                        key={cIdx}
                        className={`py-1 rounded bg-slate-950 ${
                          rIdx === cIdx ? 'text-emerald-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        {val.toFixed(4)}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-center text-slate-500 text-[11px]">
                Class 12 Invariant: Length of any rotated vector is preserved: ||R · v|| = ||v||.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 9 SOLVER: Graph Theory & Dijkstra Route Planning     */}
        {/* ========================================================= */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <p className="text-sm text-slate-300">
              Model a road network as a weighted graph G = (V, E) and compute the shortest path using Dijkstra’s algorithm.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs text-slate-400 font-mono">Start Node (Origin):</label>
                <select
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                >
                  {graphNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <label className="text-xs text-slate-400 font-mono">Destination Node:</label>
                <select
                  value={destNode}
                  onChange={(e) => setDestNode(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                >
                  {graphNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dijkstra Path Display */}
            <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/40 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-400 font-bold">Optimal Shortest Route:</span>
                <span className="text-slate-300 font-bold">
                  Total Cost: {dijkstraResult.totalDistance} units (km / mins)
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap py-2">
                {dijkstraResult.path.map((nodeId, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold">
                      {nodeId}
                    </span>
                    {idx < dijkstraResult.path.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">Dijkstra Execution Trace Logs:</span>
                <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
                  {dijkstraResult.steps.map((st, i) => (
                    <p key={i} className="text-[11px] text-slate-400">
                      Step {i + 1}: {st.log}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
