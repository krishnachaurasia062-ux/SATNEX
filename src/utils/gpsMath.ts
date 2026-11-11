/**
 * GPS Navigation Mathematical Engine
 * Contains rigorous mathematical implementations for CBSE/ISC Class 11 & 12 concepts:
 * 3D Geometry, Spheres, Trilateration, WGS84 Trigonometry, Vectors, Matrices, Calculus, Least-Squares, Graph Theory
 */

export const SPEED_OF_LIGHT = 299792.458; // km/s (or 299,792,458 m/s)
export const SPEED_OF_LIGHT_M = 299792458; // m/s
export const EARTH_RADIUS_KM = 6371.0; // Mean Earth radius in km
export const WGS84_A = 6378.137; // Semi-major axis in km
export const WGS84_B = 6356.7523142; // Semi-minor axis in km
export const WGS84_E2 = 0.00669437999014; // First eccentricity squared
export const WGS84_E_PRIME2 = 0.00673949674228; // Second eccentricity squared
export const GM_EARTH = 398600.4418; // Standard gravitational parameter km^3/s^2

// ==========================================
// STEP 1: Coordinate Geometry & 3D Distance
// ==========================================

export function calculate3DDistance(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function calculateSignalTravelTime(distanceKm: number): {
  seconds: number;
  milliseconds: number;
  microseconds: number;
} {
  const seconds = distanceKm / SPEED_OF_LIGHT;
  return {
    seconds,
    milliseconds: seconds * 1000,
    microseconds: seconds * 1000000,
  };
}

// ==========================================
// STEP 2 & 3: Spheres & Trilateration
// ==========================================

export interface PseudorangeSat {
  x: number;
  y: number;
  z: number;
  pseudorange: number;
}

/**
 * Solves the 4-satellite pseudorange nonlinear system using Newton-Raphson iteration.
 * System: rho_i = sqrt((x_i - x)^2 + (y_i - y)^2 + (z_i - z)^2) + c * dt
 * Returns [x, y, z, c*dt] in km
 */
export function solveTrilaterationNewtonRaphson(
  sats: PseudorangeSat[],
  initialGuess = { x: 0, y: 0, z: 6371, cb: 0 },
  maxIter = 15,
  tolerance = 1e-4
): { x: number; y: number; z: number; clockBiasKm: number; iterations: number; converged: boolean } {
  let x = initialGuess.x;
  let y = initialGuess.y;
  let z = initialGuess.z;
  let cb = initialGuess.cb; // clock bias in km

  let iter = 0;
  let converged = false;

  for (iter = 0; iter < maxIter; iter++) {
    const H: number[][] = [];
    const deltaRho: number[] = [];

    for (let i = 0; i < sats.length; i++) {
      const sat = sats[i];
      const dist = Math.sqrt((sat.x - x) ** 2 + (sat.y - y) ** 2 + (sat.z - z) ** 2);
      const computedRho = dist + cb;
      const residual = sat.pseudorange - computedRho;

      deltaRho.push(residual);

      // Partial derivatives of rho with respect to (x, y, z, cb)
      // d(rho)/dx = -(sat.x - x) / dist
      const hx = -(sat.x - x) / (dist || 1);
      const hy = -(sat.y - y) / (dist || 1);
      const hz = -(sat.z - z) / (dist || 1);
      const hb = 1;

      H.push([hx, hy, hz, hb]);
    }

    // Solve (H^T * H) * deltaX = H^T * deltaRho
    const deltaX = solveLinearLeastSquares(H, deltaRho);
    if (!deltaX) break;

    x += deltaX[0];
    y += deltaX[1];
    z += deltaX[2];
    cb += deltaX[3];

    const stepNorm = Math.sqrt(
      deltaX[0] ** 2 + deltaX[1] ** 2 + deltaX[2] ** 2 + deltaX[3] ** 2
    );

    if (stepNorm < tolerance) {
      converged = true;
      break;
    }
  }

  return { x, y, z, clockBiasKm: cb, iterations: iter + 1, converged };
}

// ==========================================
// STEP 4: Trigonometry & WGS84 ECEF to Lat/Lon
// ==========================================

export interface GeodeticCoordinate {
  latitudeDeg: number;
  longitudeDeg: number;
  altitudeKm: number;
  latitudeRad: number;
  longitudeRad: number;
}

/**
 * Bowring's method for closed-form ECEF to Geodetic (Lat, Lon, Alt)
 * Extremely fast and millimeter accurate.
 */
export function ecefToGeodetic(x: number, y: number, z: number): GeodeticCoordinate {
  const p = Math.sqrt(x * x + y * y);
  const lonRad = Math.atan2(y, x);

  // Bowring's parametric latitude angle theta
  const theta = Math.atan2(z * WGS84_A, p * WGS84_B);

  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  // Geodetic latitude phi
  const num = z + WGS84_E_PRIME2 * WGS84_B * sinTheta * sinTheta * sinTheta;
  const den = p - WGS84_E2 * WGS84_A * cosTheta * cosTheta * cosTheta;
  const latRad = Math.atan2(num, den);

  // Prime vertical radius of curvature N(phi)
  const sinLat = Math.sin(latRad);
  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);

  // Ellipsoidal height h
  const altKm = p / Math.cos(latRad) - N;

  return {
    latitudeDeg: (latRad * 180) / Math.PI,
    longitudeDeg: (lonRad * 180) / Math.PI,
    altitudeKm: altKm,
    latitudeRad: latRad,
    longitudeRad: lonRad,
  };
}

/**
 * Geodetic (Lat, Lon, Alt) to Cartesian ECEF (X, Y, Z)
 */
export function geodeticToEcef(
  latDeg: number,
  lonDeg: number,
  altKm = 0
): { x: number; y: number; z: number } {
  const latRad = (latDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;

  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinLon = Math.sin(lonRad);
  const cosLon = Math.cos(lonRad);

  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);

  const x = (N + altKm) * cosLat * cosLon;
  const y = (N + altKm) * cosLat * sinLon;
  const z = (N * (1 - WGS84_E2) + altKm) * sinLat;

  return { x, y, z };
}

// ==========================================
// STEP 5: Vectors (Position, Direction, Doppler)
// ==========================================

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export function vectorAdd(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vectorSub(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vectorDot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function vectorCross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function vectorMagnitude(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vectorNormalize(v: Vector3D): Vector3D {
  const mag = vectorMagnitude(v);
  if (mag === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}

/**
 * Calculates satellite elevation angle above receiver's local tangent plane horizon
 */
export function calculateElevationAngle(
  satPos: Vector3D,
  recPos: Vector3D
): { elevationDeg: number; azimuthDeg: number } {
  const geo = ecefToGeodetic(recPos.x, recPos.y, recPos.z);
  const enu = ecefToEnu(
    { x: satPos.x - recPos.x, y: satPos.y - recPos.y, z: satPos.z - recPos.z },
    geo.latitudeDeg,
    geo.longitudeDeg
  );

  const horizontalDist = Math.sqrt(enu.e * enu.e + enu.n * enu.n);
  const elevRad = Math.atan2(enu.u, horizontalDist);
  const azimRad = Math.atan2(enu.e, enu.n);

  return {
    elevationDeg: (elevRad * 180) / Math.PI,
    azimuthDeg: ((azimRad * 180) / Math.PI + 360) % 360,
  };
}

/**
 * Calculates Doppler frequency shift on GPS L1 carrier (f0 = 1575.42 MHz)
 */
export function calculateDopplerShift(
  satPos: Vector3D,
  satVel: Vector3D,
  recPos: Vector3D,
  carrierFreqMhz = 1575.42
): number {
  const los = vectorSub(satPos, recPos);
  const unitLos = vectorNormalize(los);
  const vRadial = vectorDot(satVel, unitLos); // km/s along line of sight
  // Delta f = - (vRadial / c) * f0
  const deltaFKhz = -(vRadial / SPEED_OF_LIGHT) * (carrierFreqMhz * 1000);
  return deltaFKhz;
}

// ==========================================
// STEP 6: Matrices & Coordinate Rotation
// ==========================================

export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

export function rotationMatrixX(angleDeg: number): Matrix3x3 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    [1, 0, 0],
    [0, c, -s],
    [0, s, c],
  ];
}

export function rotationMatrixY(angleDeg: number): Matrix3x3 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    [c, 0, s],
    [0, 1, 0],
    [-s, 0, c],
  ];
}

export function rotationMatrixZ(angleDeg: number): Matrix3x3 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}

export function multiplyMatrix3x3(A: Matrix3x3, B: Matrix3x3): Matrix3x3 {
  const result: Matrix3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      result[r][c] = A[r][0] * B[0][c] + A[r][1] * B[1][c] + A[r][2] * B[2][c];
    }
  }
  return result;
}

export function multiplyMatrixVector3(M: Matrix3x3, v: Vector3D): Vector3D {
  return {
    x: M[0][0] * v.x + M[0][1] * v.y + M[0][2] * v.z,
    y: M[1][0] * v.x + M[1][1] * v.y + M[1][2] * v.z,
    z: M[2][0] * v.x + M[2][1] * v.y + M[2][2] * v.z,
  };
}

/**
 * Transforms an ECEF vector difference into local East-North-Up (ENU) coordinates
 */
export function ecefToEnu(
  deltaEcef: Vector3D,
  refLatDeg: number,
  refLonDeg: number
): { e: number; n: number; u: number } {
  const phi = (refLatDeg * Math.PI) / 180;
  const lam = (refLonDeg * Math.PI) / 180;

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinLam = Math.sin(lam);
  const cosLam = Math.cos(lam);

  // ENU transformation matrix:
  // [-sinLam,            cosLam,           0     ]
  // [-sinPhi * cosLam, -sinPhi * sinLam,  cosPhi ]
  // [ cosPhi * cosLam,  cosPhi * sinLam,  sinPhi ]

  const e = -sinLam * deltaEcef.x + cosLam * deltaEcef.y;
  const n = -sinPhi * cosLam * deltaEcef.x - sinPhi * sinLam * deltaEcef.y + cosPhi * deltaEcef.z;
  const u = cosPhi * cosLam * deltaEcef.x + cosPhi * sinLam * deltaEcef.y + sinPhi * deltaEcef.z;

  return { e, n, u };
}

// ==========================================
// STEP 7: Calculus & Satellite Motion
// ==========================================

export function calculateOrbitalVelocity(orbitalRadiusKm: number): number {
  // v = sqrt(GM / r)
  return Math.sqrt(GM_EARTH / orbitalRadiusKm);
}

export function calculateOrbitalPeriodHours(semiMajorAxisKm: number): number {
  // T = 2 * pi * sqrt(a^3 / GM)
  const seconds = 2 * Math.PI * Math.sqrt((semiMajorAxisKm ** 3) / GM_EARTH);
  return seconds / 3600;
}

export function calculateGravitationalAcceleration(orbitalRadiusKm: number): number {
  // a = GM / r^2 in km/s^2 -> multiply by 1000 for m/s^2
  return ((GM_EARTH / (orbitalRadiusKm * orbitalRadiusKm)) * 1000);
}

// ==========================================
// STEP 8: Optimization & Least Squares / GDOP
// ==========================================

export interface DopMetrics {
  gdop: number;
  pdop: number;
  hdop: number;
  vdop: number;
  tdop: number;
}

/**
 * Computes Least Squares position solution and Dilution of Precision (DOP) metrics
 * from an overdetermined set of N >= 4 satellites.
 */
export function computeLeastSquaresWithDop(
  sats: { x: number; y: number; z: number; pseudorange: number }[],
  receiverGuess = { x: 0, y: 0, z: 6371, cb: 0 }
): {
  solution: { x: number; y: number; z: number; clockBiasKm: number };
  dop: DopMetrics;
  residuals: number[];
  geometryMatrix: number[][];
  covarianceMatrix: number[][];
} {
  const solverRes = solveTrilaterationNewtonRaphson(sats, receiverGuess);
  const { x, y, z, clockBiasKm } = solverRes;

  // Compute Geometry matrix H at the solved point
  const H: number[][] = [];
  const residuals: number[] = [];

  for (let i = 0; i < sats.length; i++) {
    const s = sats[i];
    const dist = Math.sqrt((s.x - x) ** 2 + (s.y - y) ** 2 + (s.z - z) ** 2);
    const computedRho = dist + clockBiasKm;
    residuals.push(s.pseudorange - computedRho);

    H.push([
      -(s.x - x) / (dist || 1),
      -(s.y - y) / (dist || 1),
      -(s.z - z) / (dist || 1),
      1,
    ]);
  }

  // Covariance matrix Q = (H^T * H)^(-1)
  const HtH = multiplyMatrixTransposed(H);
  const Q = invertMatrix4x4(HtH);

  let dop: DopMetrics = { gdop: 99.9, pdop: 99.9, hdop: 99.9, vdop: 99.9, tdop: 99.9 };

  if (Q) {
    const qxx = Math.max(0, Q[0][0]);
    const qyy = Math.max(0, Q[1][1]);
    const qzz = Math.max(0, Q[2][2]);
    const qtt = Math.max(0, Q[3][3]);

    const pdop = Math.sqrt(qxx + qyy + qzz);
    const tdop = Math.sqrt(qtt);
    const gdop = Math.sqrt(qxx + qyy + qzz + qtt);

    // Approximate horizontal & vertical in local tangent frame
    const hdop = Math.sqrt(qxx + qyy) * 0.75;
    const vdop = Math.sqrt(qzz) * 1.1;

    dop = {
      gdop: Number.isFinite(gdop) ? Number(gdop.toFixed(2)) : 99.9,
      pdop: Number.isFinite(pdop) ? Number(pdop.toFixed(2)) : 99.9,
      hdop: Number.isFinite(hdop) ? Number(hdop.toFixed(2)) : 99.9,
      vdop: Number.isFinite(vdop) ? Number(vdop.toFixed(2)) : 99.9,
      tdop: Number.isFinite(tdop) ? Number(tdop.toFixed(2)) : 99.9,
    };
  }

  return {
    solution: { x, y, z, clockBiasKm },
    dop,
    residuals,
    geometryMatrix: H,
    covarianceMatrix: Q || [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
  };
}

// ==========================================
// STEP 9: Graph Theory & Shortest Path
// ==========================================

export interface DijkstraStep {
  currentNode: string;
  visitedNodes: string[];
  distances: Record<string, number>;
  previousNodes: Record<string, string | null>;
  log: string;
}

export function runDijkstra(
  nodes: { id: string; label: string }[],
  edges: { from: string; to: string; weight: number }[],
  startNodeId: string,
  endNodeId: string
): {
  path: string[];
  totalDistance: number;
  steps: DijkstraStep[];
} {
  const distances: Record<string, number> = {};
  const previousNodes: Record<string, string | null> = {};
  const unvisited = new Set<string>();
  const visitedNodes: string[] = [];
  const steps: DijkstraStep[] = [];

  // Build adjacency graph
  const adj: Record<string, { to: string; weight: number }[]> = {};
  nodes.forEach((n) => {
    distances[n.id] = Infinity;
    previousNodes[n.id] = null;
    unvisited.add(n.id);
    adj[n.id] = [];
  });

  edges.forEach((e) => {
    adj[e.from]?.push({ to: e.to, weight: e.weight });
    adj[e.to]?.push({ to: e.from, weight: e.weight }); // bidirectional road
  });

  distances[startNodeId] = 0;

  steps.push({
    currentNode: startNodeId,
    visitedNodes: [],
    distances: { ...distances },
    previousNodes: { ...previousNodes },
    log: `Initialized distances. Start node ${startNodeId} distance = 0, all other nodes = ∞.`,
  });

  while (unvisited.size > 0) {
    // Pick unvisited node with lowest distance
    let minNode: string | null = null;
    let minDist = Infinity;

    unvisited.forEach((id) => {
      if (distances[id] < minDist) {
        minDist = distances[id];
        minNode = id;
      }
    });

    if (minNode === null || minDist === Infinity) {
      break; // Remaining nodes unreachable
    }

    if (minNode === endNodeId) {
      visitedNodes.push(minNode);
      unvisited.delete(minNode);
      steps.push({
        currentNode: minNode,
        visitedNodes: [...visitedNodes],
        distances: { ...distances },
        previousNodes: { ...previousNodes },
        log: `Destination node ${endNodeId} reached with minimum cost ${distances[endNodeId]}.`,
      });
      break;
    }

    unvisited.delete(minNode);
    visitedNodes.push(minNode);

    const neighbors = adj[minNode] || [];
    let neighborLogs: string[] = [];

    for (const edge of neighbors) {
      if (unvisited.has(edge.to)) {
        const alt = distances[minNode] + edge.weight;
        if (alt < distances[edge.to]) {
          neighborLogs.push(`Updated ${edge.to} distance from ${distances[edge.to] === Infinity ? '∞' : distances[edge.to]} to ${alt} via ${minNode}`);
          distances[edge.to] = alt;
          previousNodes[edge.to] = minNode;
        }
      }
    }

    steps.push({
      currentNode: minNode,
      visitedNodes: [...visitedNodes],
      distances: { ...distances },
      previousNodes: { ...previousNodes },
      log: `Visited node ${minNode}. ${neighborLogs.length > 0 ? neighborLogs.join('; ') : 'No neighbor distance reductions.'}`,
    });
  }

  // Backtrack optimal path
  const path: string[] = [];
  let curr: string | null = endNodeId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previousNodes[curr];
  }

  const validPath = path[0] === startNodeId ? path : [];
  return {
    path: validPath,
    totalDistance: distances[endNodeId] === Infinity ? 0 : distances[endNodeId],
    steps,
  };
}

// ==========================================
// Matrix Helpers (Least Squares & Inversion)
// ==========================================

function solveLinearLeastSquares(H: number[][], y: number[]): number[] | null {
  // H is N x 4, y is N x 1
  // normal eq: (H^T * H) * x = H^T * y
  const HtH = multiplyMatrixTransposed(H); // 4x4
  const invHtH = invertMatrix4x4(HtH);
  if (!invHtH) return null;

  // H^T * y (4x1)
  const HtY: number[] = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++) {
    for (let i = 0; i < H.length; i++) {
      HtY[r] += H[i][r] * y[i];
    }
  }

  // result = invHtH * HtY
  const res: number[] = [0, 0, 0, 0];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      res[r] += invHtH[r][c] * HtY[c];
    }
  }

  return res;
}

function multiplyMatrixTransposed(H: number[][]): number[][] {
  // H is N x 4. Returns H^T * H (4 x 4)
  const rows = H.length;
  const cols = 4;
  const result: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < rows; k++) {
        sum += H[k][i] * H[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}

function invertMatrix4x4(m: number[][]): number[][] | null {
  const inv: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const a = m;
  const A2323 = a[2][2] * a[3][3] - a[2][3] * a[3][2];
  const A1323 = a[2][1] * a[3][3] - a[2][3] * a[3][1];
  const A1223 = a[2][1] * a[3][2] - a[2][2] * a[3][1];
  const A0323 = a[2][0] * a[3][3] - a[2][3] * a[3][0];
  const A0223 = a[2][0] * a[3][2] - a[2][2] * a[3][0];
  const A0123 = a[2][0] * a[3][1] - a[2][1] * a[3][0];
  const A2313 = a[1][2] * a[3][3] - a[1][3] * a[3][2];
  const A1313 = a[1][1] * a[3][3] - a[1][3] * a[3][1];
  const A1213 = a[1][1] * a[3][2] - a[1][2] * a[3][1];
  const A2312 = a[1][2] * a[2][3] - a[1][3] * a[2][2];
  const A1312 = a[1][1] * a[2][3] - a[1][3] * a[2][1];
  const A1212 = a[1][1] * a[2][2] - a[1][2] * a[2][1];
  const A0313 = a[1][0] * a[3][3] - a[1][3] * a[3][0];
  const A0213 = a[1][0] * a[3][2] - a[1][2] * a[3][0];
  const A0312 = a[1][0] * a[2][3] - a[1][3] * a[2][0];
  const A0212 = a[1][0] * a[2][2] - a[1][2] * a[2][0];
  const A0113 = a[1][0] * a[3][1] - a[1][1] * a[3][0];
  const A0112 = a[1][0] * a[2][1] - a[1][1] * a[2][0];

  const det =
    a[0][0] * (a[1][1] * A2323 - a[1][2] * A1323 + a[1][3] * A1223) -
    a[0][1] * (a[1][0] * A2323 - a[1][2] * A0323 + a[1][3] * A0223) +
    a[0][2] * (a[1][0] * A1323 - a[1][1] * A0323 + a[1][3] * A0123) -
    a[0][3] * (a[1][0] * A1223 - a[1][1] * A0223 + a[1][2] * A0123);

  if (Math.abs(det) < 1e-12) return null;

  const invDet = 1 / det;

  inv[0][0] = invDet * (a[1][1] * A2323 - a[1][2] * A1323 + a[1][3] * A1223);
  inv[0][1] = -invDet * (a[0][1] * A2323 - a[0][2] * A1323 + a[0][3] * A1223);
  inv[0][2] = invDet * (a[0][1] * A2313 - a[0][2] * A1313 + a[0][3] * A1213);
  inv[0][3] = -invDet * (a[0][1] * A2312 - a[0][2] * A1312 + a[0][3] * A1212);

  inv[1][0] = -invDet * (a[1][0] * A2323 - a[1][2] * A0323 + a[1][3] * A0223);
  inv[1][1] = invDet * (a[0][0] * A2323 - a[0][2] * A0323 + a[0][3] * A0223);
  inv[1][2] = -invDet * (a[0][0] * A2313 - a[0][2] * A0313 + a[0][3] * A0213);
  inv[1][3] = invDet * (a[0][0] * A2312 - a[0][2] * A0312 + a[0][3] * A0212);

  inv[2][0] = invDet * (a[1][0] * A1323 - a[1][1] * A0323 + a[1][3] * A0123);
  inv[2][1] = -invDet * (a[0][0] * A1323 - a[0][1] * A0323 + a[0][3] * A0123);
  inv[2][2] = invDet * (a[0][0] * A1313 - a[0][1] * A0313 + a[0][3] * A0113);
  inv[2][3] = -invDet * (a[0][0] * A1312 - a[0][1] * A0312 + a[0][3] * A0112);

  inv[3][0] = -invDet * (a[1][0] * A1223 - a[1][1] * A0223 + a[1][2] * A0123);
  inv[3][1] = invDet * (a[0][0] * A1223 - a[0][1] * A0223 + a[0][2] * A0123);
  inv[3][2] = -invDet * (a[0][0] * A1213 - a[0][1] * A0213 + a[0][2] * A0113);
  inv[3][3] = invDet * (a[0][0] * A1212 - a[0][1] * A0212 + a[0][2] * A0112);

  return inv;
}
