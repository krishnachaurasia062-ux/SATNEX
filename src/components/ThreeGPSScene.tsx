import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Play, Pause, Compass, ChevronDown, ChevronUp, Sparkles, Eye } from 'lucide-react';
import { WGS84_A, WGS84_B } from '../utils/gpsMath';

interface ThreeGPSSceneProps {
  currentStep: number;
  userCoords?: { x: number; y: number; z: number };
}

export const ThreeGPSScene: React.FC<ThreeGPSSceneProps> = ({
  currentStep,
  userCoords = { x: 3800, y: 1500, z: 4800 },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showSpheres, setShowSpheres] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [sphereOpacity, setSphereOpacity] = useState<number>(0.22);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);
  const [cameraPresetName, setCameraPresetName] = useState<string>('Overview');

  const stateRef = useRef({
    isPlaying: true,
    currentStep,
    userCoords,
    sphereOpacity: 0.22,
    showOrbits: true,
    showSpheres: true,
    showAxes: true,
    orbitAngle: 0,
    pulsePhase: 0,
    rotationMatrixAngle: 0,
  });

  stateRef.current.isPlaying = isPlaying;
  stateRef.current.currentStep = currentStep;
  stateRef.current.userCoords = userCoords;
  stateRef.current.sphereOpacity = sphereOpacity;
  stateRef.current.showOrbits = showOrbits;
  stateRef.current.showSpheres = showSpheres;
  stateRef.current.showAxes = showAxes;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050814);
    scene.fog = new THREE.FogExp2(0x050814, 0.0028);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 350);
    camera.position.set(50, 40, 70);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 180;
    controls.minDistance = 12;
    controlsRef.current = controls;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    sunLight.position.set(60, 45, 50);
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.8);
    scene.add(hemiLight);

    // ==========================================
    // PROCEDURAL TEXT SPRITE GENERATOR (Zero 404)
    // ==========================================
    const createTextSprite = (text: string, color = '#38bdf8', bg = 'rgba(15, 23, 42, 0.90)', w = 320, h = 64) => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const c = canvas.getContext('2d')!;
      c.fillStyle = bg;
      c.roundRect(4, 4, w - 8, h - 8, 8);
      c.fill();
      c.strokeStyle = color;
      c.lineWidth = 2;
      c.stroke();
      c.font = 'bold 22px "JetBrains Mono", sans-serif';
      c.fillStyle = color;
      c.textAlign = 'center';
      c.fillText(text, w / 2, h / 2 + 7);
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(w / 45, h / 45, 1);
      return sprite;
    };

    // ==========================================
    // PROCEDURAL EARTH GLOBE (WGS84 Spheroid)
    // ==========================================
    const earthRadius = 12;
    const earthFlattening = WGS84_B / WGS84_A;

    const earthCanvas = document.createElement('canvas');
    earthCanvas.width = 1024;
    earthCanvas.height = 512;
    const ctx = earthCanvas.getContext('2d')!;

    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
    oceanGrad.addColorStop(0, '#0a2540');
    oceanGrad.addColorStop(0.5, '#0d3866');
    oceanGrad.addColorStop(1, '#0a2540');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1024; x += 1024 / 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 512 / 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(1024, 256);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(512, 0);
    ctx.lineTo(512, 512);
    ctx.stroke();

    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.beginPath();
    ctx.arc(580, 220, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(530, 310, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(280, 200, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(330, 340, 65, 0, Math.PI * 2);
    ctx.fill();

    const earthTexture = new THREE.CanvasTexture(earthCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const earthGeometry = new THREE.SphereGeometry(earthRadius, 48, 48);
    earthGeometry.scale(1, earthFlattening, 1);

    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const atmoGeometry = new THREE.SphereGeometry(earthRadius * 1.025, 32, 32);
    const atmoMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeometry, atmoMaterial);
    scene.add(atmoMesh);

    // ==========================================
    // 3D CARTESIAN AXES (ECEF Frame)
    // ==========================================
    const axesGroup = new THREE.Group();
    const axisLength = 28;

    const createAxisArrow = (dir: THREE.Vector3, color: number, label: string) => {
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), axisLength, color, 2.5, 1.2);
      axesGroup.add(arrow);
      const sprite = createTextSprite(label, '#' + new THREE.Color(color).getHexString(), 'rgba(15, 23, 42, 0.85)', 180, 50);
      sprite.position.copy(dir).multiplyScalar(axisLength + 3);
      axesGroup.add(sprite);
    };

    createAxisArrow(new THREE.Vector3(1, 0, 0), 0xef4444, '+X (0°, 0°)');
    createAxisArrow(new THREE.Vector3(0, 0, 1), 0x10b981, '+Y (90°E, 0°)');
    createAxisArrow(new THREE.Vector3(0, 1, 0), 0x3b82f6, '+Z (North Pole)');
    scene.add(axesGroup);

    // ==========================================
    // SATELLITES & 55° INCLINED ORBITS
    // ==========================================
    const orbitRadius = 34;
    const satellitesGroup = new THREE.Group();
    scene.add(satellitesGroup);

    const orbitLinesGroup = new THREE.Group();
    scene.add(orbitLinesGroup);

    const satConfigs = [
      { id: 1, prn: 'PRN-01', inclination: 55, raan: 0, trueAnomaly: 0.2, color: 0xef4444 },
      { id: 2, prn: 'PRN-04', inclination: 55, raan: 60, trueAnomaly: 1.8, color: 0x10b981 },
      { id: 3, prn: 'PRN-09', inclination: 55, raan: 120, trueAnomaly: 3.4, color: 0x3b82f6 },
      { id: 4, prn: 'PRN-12', inclination: 55, raan: 180, trueAnomaly: 4.9, color: 0xf59e0b },
      { id: 5, prn: 'PRN-18', inclination: 55, raan: 240, trueAnomaly: 2.3, color: 0xa855f7 },
      { id: 6, prn: 'PRN-24', inclination: 55, raan: 300, trueAnomaly: 5.6, color: 0x06b6d4 },
    ];

    const createSatelliteMesh = (color: number, prnName: string) => {
      const satGroup = new THREE.Group();

      const busGeo = new THREE.BoxGeometry(1.6, 1.2, 1.2);
      const busMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.85,
        roughness: 0.25,
      });
      const bus = new THREE.Mesh(busGeo, busMat);
      satGroup.add(bus);

      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        metalness: 0.6,
        roughness: 0.2,
      });

      const wingLeftGeo = new THREE.BoxGeometry(3.5, 0.08, 1.1);
      const wingLeft = new THREE.Mesh(wingLeftGeo, panelMat);
      wingLeft.position.set(-2.6, 0, 0);
      satGroup.add(wingLeft);

      const wingRightGeo = new THREE.BoxGeometry(3.5, 0.08, 1.1);
      const wingRight = new THREE.Mesh(wingRightGeo, panelMat);
      wingRight.position.set(2.6, 0, 0);
      satGroup.add(wingRight);

      const mastGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.0, 12);
      const mastMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.2,
      });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.rotation.x = Math.PI / 2;
      mast.position.set(0, -0.6, 0.4);
      satGroup.add(mast);

      const beaconGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 0.7, 0);
      satGroup.add(beacon);

      const sprite = createTextSprite(prnName, '#' + new THREE.Color(color).getHexString(), 'rgba(15, 23, 42, 0.90)', 140, 50);
      sprite.position.set(0, 2.2, 0);
      satGroup.add(sprite);

      return satGroup;
    };

    const satelliteNodes: {
      group: THREE.Group;
      inclinationRad: number;
      raanRad: number;
      anomaly: number;
      speed: number;
      id: number;
      color: number;
    }[] = [];

    satConfigs.forEach((cfg) => {
      const curvePoints: THREE.Vector3[] = [];
      const incRad = (cfg.inclination * Math.PI) / 180;
      const raanRad = (cfg.raan * Math.PI) / 180;

      for (let i = 0; i <= 64; i++) {
        const u = (i / 64) * Math.PI * 2;
        const xOrb = orbitRadius * Math.cos(u);
        const zOrb = orbitRadius * Math.sin(u);

        const pos = new THREE.Vector3(xOrb, 0, zOrb);
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), incRad);
        pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), raanRad);
        curvePoints.push(pos);
      }

      const orbitGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.35,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLinesGroup.add(orbitLine);

      const satMesh = createSatelliteMesh(cfg.color, cfg.prn);
      satellitesGroup.add(satMesh);

      satelliteNodes.push({
        group: satMesh,
        inclinationRad: incRad,
        raanRad: raanRad,
        anomaly: cfg.trueAnomaly,
        speed: 0.15,
        id: cfg.id,
        color: cfg.color,
      });
    });

    // ==========================================
    // GROUND RECEIVER
    // ==========================================
    const receiverGroup = new THREE.Group();
    scene.add(receiverGroup);

    const pinStemGeo = new THREE.CylinderGeometry(0.15, 0.05, 2.5, 12);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xff0055, metalness: 0.8, roughness: 0.2 });
    const pinStem = new THREE.Mesh(pinStemGeo, pinMat);
    pinStem.position.y = 1.25;
    receiverGroup.add(pinStem);

    const pinHeadGeo = new THREE.SphereGeometry(0.65, 16, 16);
    const pinHeadMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
    pinHead.position.y = 2.5;
    receiverGroup.add(pinHead);

    const recLatRad = (32 * Math.PI) / 180;
    const recLonRad = (45 * Math.PI) / 180;
    const recPos = new THREE.Vector3(
      earthRadius * Math.cos(recLatRad) * Math.cos(recLonRad),
      earthRadius * Math.sin(recLatRad) * earthFlattening,
      earthRadius * Math.cos(recLatRad) * Math.sin(recLonRad)
    );
    receiverGroup.position.copy(recPos);
    receiverGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), recPos.clone().normalize());

    // ==========================================
    // STEP-SPECIFIC VISUAL OVERLAYS
    // ==========================================
    const overlaysGroup = new THREE.Group();
    scene.add(overlaysGroup);

    // Line of sight rays & Spheres
    const rayLines: THREE.Line[] = [];
    const rayGeometries: THREE.BufferGeometry[] = [];
    const sphereMeshes: THREE.Mesh[] = [];

    satConfigs.slice(0, 4).forEach((cfg) => {
      const rayGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const rayMat = new THREE.LineDashedMaterial({
        color: cfg.color,
        dashSize: 1.5,
        gapSize: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const rayLine = new THREE.Line(rayGeo, rayMat);
      overlaysGroup.add(rayLine);
      rayLines.push(rayLine);
      rayGeometries.push(rayGeo);

      const sphGeo = new THREE.SphereGeometry(1, 32, 32);
      const sphMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.22,
        roughness: 0.3,
        metalness: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const sphMesh = new THREE.Mesh(sphGeo, sphMat);
      overlaysGroup.add(sphMesh);
      sphereMeshes.push(sphMesh);
    });

    // =============================================================
    // STEP 1: 3D Coordinate Geometry & Pythagorean Box Decomposition
    // =============================================================
    const step1Group = new THREE.Group();
    overlaysGroup.add(step1Group);

    // Multiple traveling light pulses along line-of-sight
    const photonPulses: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const pGeo = new THREE.SphereGeometry(0.55, 14, 14);
      const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      step1Group.add(pMesh);
      photonPulses.push(pMesh);
    }

    const step1DistanceLabel = createTextSprite('d = √(Δx² + Δy² + Δz²) = 20,274 km | t = 67.6 ms', '#38bdf8', 'rgba(10, 25, 47, 0.94)', 420, 60);
    step1Group.add(step1DistanceLabel);

    // 3D Cartesian Box Decomposition Lines (Delta X Red, Delta Y Green, Delta Z Blue)
    const deltaXGeo = new THREE.BufferGeometry();
    const deltaXMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 3 });
    const deltaXLine = new THREE.Line(deltaXGeo, deltaXMat);
    step1Group.add(deltaXLine);

    const deltaYGeo = new THREE.BufferGeometry();
    const deltaYMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3 });
    const deltaYLine = new THREE.Line(deltaYGeo, deltaYMat);
    step1Group.add(deltaYLine);

    const deltaZGeo = new THREE.BufferGeometry();
    const deltaZMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 3 });
    const deltaZLine = new THREE.Line(deltaZGeo, deltaZMat);
    step1Group.add(deltaZLine);

    const labelDeltaX = createTextSprite('Δx = 11,800 km', '#ef4444', 'rgba(15,23,42,0.9)', 160, 44);
    const labelDeltaY = createTextSprite('Δy = 6,040 km', '#10b981', 'rgba(15,23,42,0.9)', 160, 44);
    const labelDeltaZ = createTextSprite('Δz = 15,340 km', '#3b82f6', 'rgba(15,23,42,0.9)', 160, 44);
    step1Group.add(labelDeltaX);
    step1Group.add(labelDeltaY);
    step1Group.add(labelDeltaZ);

    // Drop line to XY equatorial plane
    const deltaLineGeo = new THREE.BufferGeometry();
    const deltaLineMat = new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 1.2, gapSize: 0.8 });
    const deltaLine = new THREE.Line(deltaLineGeo, deltaLineMat);
    step1Group.add(deltaLine);

    // =============================================================
    // STEP 2: 3D Intersecting Spheres, Radical Plane & Ring Curve
    // =============================================================
    const step2Group = new THREE.Group();
    overlaysGroup.add(step2Group);

    // Radical Plane semi-transparent disk
    const circleSliceGeo = new THREE.RingGeometry(0, 1, 64);
    const circleSliceMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const circleSliceMesh = new THREE.Mesh(circleSliceGeo, circleSliceMat);
    step2Group.add(circleSliceMesh);

    // Glowing Circular Intersection Ring (1D circle curve where 2 spheres intersect)
    const circleRingGeo = new THREE.TorusGeometry(1, 0.08, 16, 64);
    const circleRingMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const circleRingMesh = new THREE.Mesh(circleRingGeo, circleRingMat);
    step2Group.add(circleRingMesh);

    const radicalPlaneLabel = createTextSprite('Radical Plane: 2Δx·x + 2Δy·y + 2Δz·z = C', '#06b6d4', 'rgba(15,23,42,0.92)', 340, 50);
    step2Group.add(radicalPlaneLabel);

    // Piercing locus line connecting P1 and P2
    const locusLineGeo = new THREE.BufferGeometry();
    const locusLineMat = new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 1, gapSize: 0.5 });
    const locusLine = new THREE.Line(locusLineGeo, locusLineMat);
    step2Group.add(locusLine);

    // Intersection Point 1 (Earth Surface Fix - Green) & Point 2 (Deep Space - Red)
    const pt1Mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.0), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    const pt2Mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.0), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    step2Group.add(pt1Mesh);
    step2Group.add(pt2Mesh);
    const pt1Label = createTextSprite('Point 1: Earth Surface Fix (VALID)', '#22c55e', 'rgba(15, 23, 42, 0.92)', 280, 50);
    const pt2Label = createTextSprite('Point 2: Deep Space Point (DISCARDED)', '#ef4444', 'rgba(15, 23, 42, 0.92)', 300, 50);
    step2Group.add(pt1Label);
    step2Group.add(pt2Label);

    // =============================================================
    // STEP 3: 4-Satellite Trilateration, Wavefronts & Newton-Raphson
    // =============================================================
    const step3Group = new THREE.Group();
    overlaysGroup.add(step3Group);

    // 4 Individual Pseudorange distance badges on laser rays
    const pseudorangeBadges: THREE.Sprite[] = [];
    const prTexts = [
      'ρ₁ = 20,274.6 km',
      'ρ₂ = 20,977.9 km',
      'ρ₃ = 26,815.1 km',
      'ρ₄ = 23,348.7 km',
    ];
    const prColors = ['#38bdf8', '#f59e0b', '#a855f7', '#ec4899'];
    for (let i = 0; i < 4; i++) {
      const badge = createTextSprite(prTexts[i], prColors[i], 'rgba(15,23,42,0.92)', 170, 44);
      step3Group.add(badge);
      pseudorangeBadges.push(badge);
    }

    // Expanding spherical pulse beacon wavefronts from each satellite
    const satWavefronts: THREE.Mesh[] = [];
    satConfigs.slice(0, 4).forEach((cfg) => {
      const wfGeo = new THREE.SphereGeometry(1, 24, 24);
      const wfMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const wfMesh = new THREE.Mesh(wfGeo, wfMat);
      step3Group.add(wfMesh);
      satWavefronts.push(wfMesh);
    });

    // Expanding radar ripples at receiver
    const radarRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.5, 0.75, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      receiverGroup.add(ringMesh);
      radarRings.push(ringMesh);
    }

    // Newton-Raphson Convergence Steps Trail (Iter 1 -> Iter 4)
    const nrIterationDots: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      step3Group.add(dot);
      nrIterationDots.push(dot);
    }
    const nrTrailGeo = new THREE.BufferGeometry();
    const nrTrailLine = new THREE.Line(nrTrailGeo, new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.8, gapSize: 0.4 }));
    step3Group.add(nrTrailLine);

    const step3FixBadge = createTextSprite('4 Sats Fixed: (1334, -4654, 4138) km | Clock Bias c·δtr = +3.10 m (10.34 μs)', '#10b981', 'rgba(10, 25, 47, 0.94)', 450, 60);
    step3Group.add(step3FixBadge);

    // =============================================================
    // STEP 4: WGS84 Geodetic Trigonometry, Meridian Arcs & Normal Vector
    // =============================================================
    const step4Group = new THREE.Group();
    overlaysGroup.add(step4Group);

    // WGS84 Equatorial Disc
    const equatorDiscGeo = new THREE.RingGeometry(earthRadius - 0.2, earthRadius + 0.3, 64);
    const equatorDiscMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    const equatorDiscMesh = new THREE.Mesh(equatorDiscGeo, equatorDiscMat);
    equatorDiscMesh.rotation.x = Math.PI / 2;
    step4Group.add(equatorDiscMesh);

    // Greenwich Prime Meridian Arc (0° Longitude)
    const primeMeridianPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI - Math.PI / 2; // -pi/2 to +pi/2
      primeMeridianPts.push(new THREE.Vector3(
        earthRadius * Math.cos(angle),
        earthRadius * Math.sin(angle) * earthFlattening,
        0
      ));
    }
    const primeMeridianGeo = new THREE.BufferGeometry().setFromPoints(primeMeridianPts);
    const primeMeridianLine = new THREE.Line(primeMeridianGeo, new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 }));
    step4Group.add(primeMeridianLine);

    // Receiver Meridian Arc (45° Longitude)
    const recMeridianPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI - Math.PI / 2;
      recMeridianPts.push(new THREE.Vector3(
        earthRadius * Math.cos(angle) * Math.cos(recLonRad),
        earthRadius * Math.sin(angle) * earthFlattening,
        earthRadius * Math.cos(angle) * Math.sin(recLonRad)
      ));
    }
    const recMeridianGeo = new THREE.BufferGeometry().setFromPoints(recMeridianPts);
    const recMeridianLine = new THREE.Line(recMeridianGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 }));
    step4Group.add(recMeridianLine);

    // Geodetic Surface Normal Arrow
    const arrowGeodeticNormal = new THREE.ArrowHelper(recPos.clone().normalize(), recPos, 8, 0x10b981, 1.8, 0.8);
    step4Group.add(arrowGeodeticNormal);

    const step4LatLabel = createTextSprite('Latitude φ = 32.0° N (Bowring Eq)', '#38bdf8', 'rgba(15, 23, 42, 0.92)', 260, 50);
    const step4LonLabel = createTextSprite('Longitude λ = 45.0° E (atan2(Y,X))', '#f59e0b', 'rgba(15, 23, 42, 0.92)', 270, 50);
    const step4WgsBadge = createTextSprite('WGS84 Spheroid: a = 6,378 km (Equator) | b = 6,357 km (Pole)', '#10b981', 'rgba(15, 23, 42, 0.92)', 430, 50);
    step4Group.add(step4LatLabel);
    step4Group.add(step4LonLabel);
    step4Group.add(step4WgsBadge);

    // =============================================================
    // STEP 5: 3D Vectors, 10° Elevation Mask & Doppler Frequency Shift
    // =============================================================
    const vectorGroup = new THREE.Group();
    overlaysGroup.add(vectorGroup);

    const arrowRec = new THREE.ArrowHelper(recPos.clone().normalize(), new THREE.Vector3(0, 0, 0), recPos.length(), 0xffffff, 2.0, 1.0);
    const arrowSat = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), orbitRadius, 0xf59e0b, 2.0, 1.0);
    const arrowRho = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), recPos, 15, 0x06b6d4, 2.0, 1.0);
    const arrowZenith = new THREE.ArrowHelper(recPos.clone().normalize(), recPos, 10, 0xa855f7, 1.5, 0.8);
    const arrowVelSat5 = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 8, 0x10b981, 2.0, 1.0);
    const arrowDopplerRadial = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 5, 0xec4899, 1.5, 0.7);

    vectorGroup.add(arrowRec);
    vectorGroup.add(arrowSat);
    vectorGroup.add(arrowRho);
    vectorGroup.add(arrowZenith);
    vectorGroup.add(arrowVelSat5);
    vectorGroup.add(arrowDopplerRadial);

    // 10° Elevation Mask Angle Disc at Receiver
    const maskDiscGeo = new THREE.RingGeometry(0.1, 12, 32);
    const maskDiscMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const maskDiscMesh = new THREE.Mesh(maskDiscGeo, maskDiscMat);
    maskDiscMesh.position.copy(recPos);
    maskDiscMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), recPos.clone().normalize());
    vectorGroup.add(maskDiscMesh);

    const labelRrec = createTextSprite('r⃗_rec (Receiver)', '#ffffff', 'rgba(15,23,42,0.85)', 170, 45);
    const labelRsat = createTextSprite('r⃗_sat (Satellite)', '#f59e0b', 'rgba(15,23,42,0.85)', 170, 45);
    const labelRho = createTextSprite('ρ⃗ = r⃗_sat - r⃗_rec', '#06b6d4', 'rgba(15,23,42,0.85)', 190, 45);
    const labelZenith = createTextSprite('n̂_zenith (Normal)', '#a855f7', 'rgba(15,23,42,0.85)', 180, 45);
    const labelMask = createTextSprite('10° Elevation Mask Cutoff', '#ef4444', 'rgba(15,23,42,0.9)', 220, 45);
    const labelDoppler = createTextSprite('Doppler Shift Δf = -15.9 kHz on L1 (1575.42 MHz)', '#ec4899', 'rgba(15,23,42,0.92)', 370, 50);

    vectorGroup.add(labelRrec);
    vectorGroup.add(labelRsat);
    vectorGroup.add(labelRho);
    vectorGroup.add(labelZenith);
    vectorGroup.add(labelMask);
    vectorGroup.add(labelDoppler);

    // =============================================================
    // STEP 6: Matrices, Coordinate Rotation & ENU/ECEF Comparison
    // =============================================================
    const enuTriadGroup = new THREE.Group();
    enuTriadGroup.position.copy(recPos);
    overlaysGroup.add(enuTriadGroup);

    // Local ENU Triad (East Red, North Green, Up Blue)
    const arrowEast = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 8, 0xef4444, 1.5, 0.8);
    const arrowNorth = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 8, 0x10b981, 1.5, 0.8);
    const arrowUp = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 8, 0x3b82f6, 1.5, 0.8);
    enuTriadGroup.add(arrowEast);
    enuTriadGroup.add(arrowNorth);
    enuTriadGroup.add(arrowUp);

    const labelEast = createTextSprite('East (E)', '#ef4444', 'rgba(15,23,42,0.85)', 120, 45);
    const labelNorth = createTextSprite('North (N)', '#10b981', 'rgba(15,23,42,0.85)', 120, 45);
    const labelUp = createTextSprite('Up (U)', '#3b82f6', 'rgba(15,23,42,0.85)', 120, 45);
    labelEast.position.set(9, 0, 0);
    labelNorth.position.set(0, 0, 9);
    labelUp.position.set(0, 9, 0);
    enuTriadGroup.add(labelEast);
    enuTriadGroup.add(labelNorth);
    enuTriadGroup.add(labelUp);

    // Local ground tangent grid at receiver
    const localGrid = new THREE.GridHelper(16, 8, 0x38bdf8, 0x1e293b);
    enuTriadGroup.add(localGrid);

    // Compass Rose Cardinal Labels on Grid
    const labelCompN = createTextSprite('N', '#10b981', 'rgba(15,23,42,0.7)', 60, 40);
    const labelCompE = createTextSprite('E', '#ef4444', 'rgba(15,23,42,0.7)', 60, 40);
    const labelCompS = createTextSprite('S', '#94a3b8', 'rgba(15,23,42,0.7)', 60, 40);
    const labelCompW = createTextSprite('W', '#94a3b8', 'rgba(15,23,42,0.7)', 60, 40);
    labelCompN.position.set(0, 0.1, 7.5);
    labelCompE.position.set(7.5, 0.1, 0);
    labelCompS.position.set(0, 0.1, -7.5);
    labelCompW.position.set(-7.5, 0.1, 0);
    enuTriadGroup.add(labelCompN);
    enuTriadGroup.add(labelCompE);
    enuTriadGroup.add(labelCompS);
    enuTriadGroup.add(labelCompW);

    // =============================================================
    // STEP 6: Calculus - Tangent Velocity, Inward Gravity & Orbit Arc
    // =============================================================
    const orbitVectorsGroup = new THREE.Group();
    overlaysGroup.add(orbitVectorsGroup);

    const arrowVelTangent = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 9, 0x10b981, 2.2, 1.0);
    const arrowGravityRadial = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), 9, 0xef4444, 2.2, 1.0);
    orbitVectorsGroup.add(arrowVelTangent);
    orbitVectorsGroup.add(arrowGravityRadial);

    // Glowing orbital trail arc ribbon behind Satellite 1
    const satTrailPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 30; i++) {
      satTrailPts.push(new THREE.Vector3());
    }
    const satTrailGeo = new THREE.BufferGeometry().setFromPoints(satTrailPts);
    const satTrailMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 3, transparent: true, opacity: 0.85 });
    const satTrailLine = new THREE.Line(satTrailGeo, satTrailMat);
    orbitVectorsGroup.add(satTrailLine);

    const step6CalculusBadge = createTextSprite('Calculus Equilibrium: v = dr/dt = 3.874 km/s | a = -GM/r² = 0.565 m/s² | T = 11h 58m', '#10b981', 'rgba(15, 23, 42, 0.94)', 560, 60);
    orbitVectorsGroup.add(step6CalculusBadge);

    // =============================================================
    // STEP 7: Multi-Satellite GDOP Pyramid Wireframe & Error Ellipsoid
    // =============================================================
    const pyramidGeo = new THREE.BufferGeometry();
    const pyramidMat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.85, linewidth: 2 });
    const pyramidLines = new THREE.LineSegments(pyramidGeo, pyramidMat);
    overlaysGroup.add(pyramidLines);

    // Translucent pyramid faces mesh
    const pyramidFacesGeo = new THREE.BufferGeometry();
    const pyramidFacesMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pyramidFacesMesh = new THREE.Mesh(pyramidFacesGeo, pyramidFacesMat);
    overlaysGroup.add(pyramidFacesMesh);

    // Error Ellipsoid at Receiver (Vertical elongation HDOP < VDOP)
    const errorEllipsoidGeo = new THREE.SphereGeometry(1.5, 24, 24);
    errorEllipsoidGeo.scale(1.0, 2.2, 1.0); // Elongated along vertical
    const errorEllipsoidMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.35,
      roughness: 0.3,
    });
    const errorEllipsoid = new THREE.Mesh(errorEllipsoidGeo, errorEllipsoidMat);
    errorEllipsoid.position.copy(recPos);
    overlaysGroup.add(errorEllipsoid);

    const step7GdopBadge = createTextSprite('Overdetermined (6 Sats): GDOP = 1.57 (High Volume Pyramid -> High Precision)', '#a855f7', 'rgba(15, 23, 42, 0.94)', 540, 60);
    step7GdopBadge.position.set(recPos.x + 4, recPos.y + 4, recPos.z + 4);
    overlaysGroup.add(step7GdopBadge);

    // =============================================================
    // STEP 8: Matrices - ENU Triad & Coordinate Rotation
    // =============================================================
    const step8MatrixBadge = createTextSprite('[E, N, U]ᵀ = R_ENU(φ, λ) · [ΔX, ΔY, ΔZ]ᵀ | R⁻¹ = Rᵀ', '#38bdf8', 'rgba(15,23,42,0.92)', 430, 50);
    enuTriadGroup.add(step8MatrixBadge);
    step8MatrixBadge.position.set(0, 11, 0);

    // =============================================================
    // STEP 9: Road Network Graph, Edge Weights & Dijkstra Agent
    // =============================================================
    const roadNetworkGroup = new THREE.Group();
    roadNetworkGroup.position.copy(recPos);
    roadNetworkGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), recPos.clone().normalize());
    overlaysGroup.add(roadNetworkGroup);

    const graphNodePositions = [
      new THREE.Vector3(0, 0.2, 0),      // A: Start
      new THREE.Vector3(-2.5, 0.2, 3),   // B
      new THREE.Vector3(3.0, 0.2, 2),    // C
      new THREE.Vector3(-2.8, 0.2, 6.5), // D
      new THREE.Vector3(2.5, 0.2, 7),    // E
      new THREE.Vector3(0, 0.2, 9.5),    // F: Destination
    ];

    const nodeLabels = ['A (Start)', 'B', 'C', 'D', 'E', 'F (Goal)'];
    graphNodePositions.forEach((pos, idx) => {
      const nodeGeo = new THREE.SphereGeometry(0.42, 14, 14);
      const nodeMat = new THREE.MeshBasicMaterial({ color: idx === 0 ? 0xef4444 : idx === 5 ? 0x22c55e : 0x38bdf8 });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      roadNetworkGroup.add(nodeMesh);

      const lbl = createTextSprite(nodeLabels[idx], idx === 0 ? '#ef4444' : idx === 5 ? '#22c55e' : '#38bdf8', 'rgba(15,23,42,0.88)', 110, 40);
      lbl.position.set(pos.x, pos.y + 0.9, pos.z);
      lbl.scale.set(2.5, 0.9, 1);
      roadNetworkGroup.add(lbl);
    });

    // Road network edges with travel time plaques
    const roadEdges = [
      [0, 1, '4m'], [0, 2, '2m'], [1, 2, '1m'], [1, 3, '5m'],
      [2, 3, '8m'], [2, 4, '10m'], [3, 4, '2m'], [3, 5, '6m'], [4, 5, '3m']
    ];
    const edgePoints: THREE.Vector3[] = [];
    roadEdges.forEach(([fromIdx, toIdx, weightStr]) => {
      const from = graphNodePositions[Number(fromIdx)];
      const to = graphNodePositions[Number(toIdx)];
      edgePoints.push(from, to);

      // Edge weight badge
      const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
      const weightBadge = createTextSprite(String(weightStr), '#94a3b8', 'rgba(15,23,42,0.85)', 70, 32);
      weightBadge.position.set(mid.x, mid.y + 0.35, mid.z);
      weightBadge.scale.set(1.5, 0.7, 1);
      roadNetworkGroup.add(weightBadge);
    });
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(edgePoints);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    roadNetworkGroup.add(edgeLines);

    // Optimal Dijkstra path illuminated in Neon Green: A -> C -> B -> D -> E -> F
    const dijkstraPathGeo = new THREE.BufferGeometry().setFromPoints([
      graphNodePositions[0],
      graphNodePositions[2],
      graphNodePositions[1],
      graphNodePositions[3],
      graphNodePositions[4],
      graphNodePositions[5],
    ]);
    const dijkstraPathMat = new THREE.LineBasicMaterial({ color: 0x22c55e, linewidth: 5 });
    const dijkstraPathLine = new THREE.Line(dijkstraPathGeo, dijkstraPathMat);
    roadNetworkGroup.add(dijkstraPathLine);

    // Moving Car / Agent Pulse on Dijkstra Path
    const navAgentGeo = new THREE.SphereGeometry(0.38, 14, 14);
    const navAgentMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const navAgent = new THREE.Mesh(navAgentGeo, navAgentMat);
    roadNetworkGroup.add(navAgent);

    const step9DijkstraBadge = createTextSprite('Dijkstra Shortest Route: A -> C -> B -> D -> E -> F | 13 mins (Optimal)', '#22c55e', 'rgba(15,23,42,0.92)', 460, 50);
    step9DijkstraBadge.position.set(0, 1.2, 11);
    roadNetworkGroup.add(step9DijkstraBadge);

    // Resize Handler

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // ANIMATION & RENDER LOOP
    // ==========================================
    let frameId = 0;
    let clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = clock.getDelta();
      const state = stateRef.current;

      if (state.isPlaying) {
        state.orbitAngle += delta * 0.18;
        state.pulsePhase += delta * 1.5;
        state.rotationMatrixAngle += delta * 0.4;
      }

      if (state.isPlaying) {
        earthMesh.rotation.y += delta * 0.04;
      }

      const satPositions: THREE.Vector3[] = [];

      satelliteNodes.forEach((node) => {
        const currentAnomaly = node.anomaly + state.orbitAngle * node.speed;
        const xOrb = orbitRadius * Math.cos(currentAnomaly);
        const zOrb = orbitRadius * Math.sin(currentAnomaly);

        const pos = new THREE.Vector3(xOrb, 0, zOrb);
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), node.inclinationRad);
        pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), node.raanRad);

        node.group.position.copy(pos);
        node.group.lookAt(0, 0, 0);

        satPositions.push(pos);
      });

      // Update rays & spheres
      satPositions.slice(0, 4).forEach((satPos, idx) => {
        if (rayGeometries[idx]) {
          rayGeometries[idx].setFromPoints([satPos, recPos]);
          rayLines[idx].computeLineDistances();
        }

        if (sphereMeshes[idx]) {
          sphereMeshes[idx].position.copy(satPos);
          const dist = satPos.distanceTo(recPos);
          sphereMeshes[idx].scale.set(dist, dist, dist);
          (sphereMeshes[idx].material as THREE.MeshStandardMaterial).opacity =
            state.showSpheres && (state.currentStep === 2 || state.currentStep === 3)
              ? state.sphereOpacity
              : 0;
        }
      });

      // ==========================================
      // STEP-SPECIFIC VISUAL UPDATES (STEPS 1 TO 9)
      // ==========================================
      const step = state.currentStep;

      // Global visibility toggles
      axesGroup.visible = state.showAxes;
      orbitLinesGroup.visible = state.showOrbits;

      // Group visibility resets
      step1Group.visible = step === 1;
      step2Group.visible = step === 2;
      step3Group.visible = step === 3;
      step4Group.visible = step === 4;
      vectorGroup.visible = step === 5;
      orbitVectorsGroup.visible = step === 6;
      pyramidLines.visible = step === 7;
      pyramidFacesMesh.visible = step === 7;
      errorEllipsoid.visible = step === 7;
      step7GdopBadge.visible = step === 7;
      enuTriadGroup.visible = step === 8;
      roadNetworkGroup.visible = step === 9;

      // -------------------------------------------------------------
      // STEP 1: Coordinate Geometry & 3D Pythagorean Decomposition Box
      // -------------------------------------------------------------
      if (step === 1 && satPositions[0]) {
        const s0 = satPositions[0];

        // 4 Traveling Light Packet pulses along line of sight
        photonPulses.forEach((pulse, pIdx) => {
          const ratio = ((state.pulsePhase * 0.75 + pIdx * 0.25) % 1);
          pulse.position.lerpVectors(s0, recPos, ratio);
        });

        // 3D Cartesian Box Decomposition vertices
        const c1 = new THREE.Vector3(s0.x, recPos.y, recPos.z); // X leg corner
        const c2 = new THREE.Vector3(s0.x, s0.y, recPos.z);     // Y leg corner

        deltaXGeo.setFromPoints([recPos, c1]);
        deltaYGeo.setFromPoints([c1, c2]);
        deltaZGeo.setFromPoints([c2, s0]);

        labelDeltaX.position.lerpVectors(recPos, c1, 0.5);
        labelDeltaX.position.y += 1.2;
        labelDeltaY.position.lerpVectors(c1, c2, 0.5);
        labelDeltaY.position.x += 1.2;
        labelDeltaZ.position.lerpVectors(c2, s0, 0.5);
        labelDeltaZ.position.y += 1.2;

        step1DistanceLabel.position.lerpVectors(s0, recPos, 0.5);
        step1DistanceLabel.position.y += 2.5;

        const groundSat = new THREE.Vector3(s0.x, 0, s0.z);
        deltaLineGeo.setFromPoints([s0, groundSat, new THREE.Vector3(0, 0, 0)]);
        deltaLine.computeLineDistances();
      }

      // -------------------------------------------------------------
      // STEP 2: Spheres, Radical Plane & Intersection Circle
      // -------------------------------------------------------------
      if (step === 2 && satPositions.length >= 2) {
        const s0 = satPositions[0];
        const s1 = satPositions[1];
        const midPoint = new THREE.Vector3().addVectors(s0, s1).multiplyScalar(0.5);

        circleSliceMesh.position.copy(midPoint);
        circleSliceMesh.lookAt(s1);
        circleSliceMesh.scale.set(15, 15, 15);

        circleRingMesh.position.copy(midPoint);
        circleRingMesh.lookAt(s1);
        circleRingMesh.scale.set(15, 15, 15);

        radicalPlaneLabel.position.set(midPoint.x, midPoint.y + 16, midPoint.z);

        // Point 1 (Earth surface) & Point 2 (Deep space)
        pt1Mesh.position.copy(recPos);
        pt1Label.position.set(recPos.x, recPos.y + 2.8, recPos.z);

        const pt2Pos = recPos.clone().multiplyScalar(2.1);
        pt2Mesh.position.copy(pt2Pos);
        pt2Label.position.set(pt2Pos.x, pt2Pos.y + 2.8, pt2Pos.z);

        locusLineGeo.setFromPoints([pt1Mesh.position, pt2Mesh.position]);
        locusLine.computeLineDistances();
      }

      // -------------------------------------------------------------
      // STEP 3: 4-Satellite Pseudoranges, Beacon Wavefronts & Newton-Raphson
      // -------------------------------------------------------------
      if (step === 3 && satPositions.length >= 4) {
        // Position pseudorange badges on each ray
        for (let i = 0; i < 4; i++) {
          if (satPositions[i]) {
            pseudorangeBadges[i].position.lerpVectors(satPositions[i], recPos, 0.45);
            pseudorangeBadges[i].position.y += 1.8;

            // Expanding wavefronts from each satellite
            const dist = satPositions[i].distanceTo(recPos);
            const wfRatio = ((state.pulsePhase * 0.4 + i * 0.25) % 1);
            const wfRadius = wfRatio * dist;
            satWavefronts[i].position.copy(satPositions[i]);
            satWavefronts[i].scale.set(wfRadius, wfRadius, wfRadius);
            (satWavefronts[i].material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.45 * (1 - wfRatio));
          }
        }

        // Radar ripples at receiver
        radarRings.forEach((ring, rIdx) => {
          const scale = ((state.pulsePhase + rIdx * 0.35) % 1) * 3.5;
          ring.scale.set(scale, scale, scale);
          (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - scale / 3.5);
        });

        // Newton-Raphson 4 convergence steps trail
        const iterSteps = [
          new THREE.Vector3(0, 0, earthRadius + 1), // Initial guess at Earth pole
          new THREE.Vector3(recPos.x * 0.45, recPos.y * 0.3, earthRadius + 0.5),
          new THREE.Vector3(recPos.x * 0.85, recPos.y * 0.8, recPos.z * 0.95),
          recPos.clone(), // Final fix
        ];
        iterSteps.forEach((pos, idx) => {
          nrIterationDots[idx].position.copy(pos);
        });
        nrTrailGeo.setFromPoints(iterSteps);
        nrTrailLine.computeLineDistances();

        step3FixBadge.position.set(recPos.x, recPos.y + 4.8, recPos.z);
      }

      // -------------------------------------------------------------
      // STEP 4: WGS84 Geodetic Coordinates & Normal Surface Vector
      // -------------------------------------------------------------
      if (step === 4) {
        step4LatLabel.position.set(recPos.x + 3.2, recPos.y + 2.0, recPos.z);
        step4LonLabel.position.set(earthRadius + 3.0, 0.5, earthRadius * 0.65);
        step4WgsBadge.position.set(0, earthRadius * earthFlattening + 3.5, 0);
      }

      // -------------------------------------------------------------
      // STEP 5: 3D Vector Arrows, 10° Elevation Mask & Doppler Shift
      // -------------------------------------------------------------
      if (step === 5 && satPositions[0]) {
        const s0 = satPositions[0];

        arrowSat.setDirection(s0.clone().normalize());
        arrowSat.setLength(s0.length());
        labelRsat.position.copy(s0).multiplyScalar(0.5);

        const losDir = new THREE.Vector3().subVectors(s0, recPos);
        arrowRho.position.copy(recPos);
        arrowRho.setDirection(losDir.clone().normalize());
        arrowRho.setLength(losDir.length());
        labelRho.position.lerpVectors(recPos, s0, 0.5);
        labelRho.position.y += 1.8;

        labelRrec.position.copy(recPos).multiplyScalar(0.5);
        labelZenith.position.copy(recPos).add(new THREE.Vector3(0, 7.5, 0));

        // Velocity vector on satellite
        const radial = s0.clone().normalize();
        const tangent = new THREE.Vector3(-radial.z, 0, radial.x).normalize();
        arrowVelSat5.position.copy(s0);
        arrowVelSat5.setDirection(tangent);

        // Doppler radial velocity projection along line-of-sight
        const uLos = losDir.clone().normalize();
        const vRadialComp = tangent.dot(uLos);
        arrowDopplerRadial.position.copy(s0);
        arrowDopplerRadial.setDirection(uLos.clone().multiplyScalar(Math.sign(vRadialComp) || 1));
        arrowDopplerRadial.setLength(Math.abs(vRadialComp) * 5.0 + 1.5);

        labelMask.position.set(recPos.x + 3, recPos.y + 0.5, recPos.z + 4);
        labelDoppler.position.set(s0.x, s0.y + 3.5, s0.z);
      }

      // -------------------------------------------------------------
      // STEP 6: Orbital Calculus, Velocity Tangent & Gravitational Acceleration
      // -------------------------------------------------------------
      if (step === 6 && satPositions[0]) {
        const s0 = satPositions[0];
        arrowVelTangent.position.copy(s0);
        const radial = s0.clone().normalize();
        const tangent = new THREE.Vector3(-radial.z, 0, radial.x).normalize();
        arrowVelTangent.setDirection(tangent);

        arrowGravityRadial.position.copy(s0);
        arrowGravityRadial.setDirection(radial.clone().negate());

        // Update trailing orbital arc
        const trailPoints: THREE.Vector3[] = [];
        const node0 = satelliteNodes[0];
        for (let i = 0; i <= 30; i++) {
          const pastAnomaly = (node0.anomaly + state.orbitAngle * node0.speed) - (i * 0.035);
          const pt = new THREE.Vector3(orbitRadius * Math.cos(pastAnomaly), 0, orbitRadius * Math.sin(pastAnomaly));
          pt.applyAxisAngle(new THREE.Vector3(1, 0, 0), node0.inclinationRad);
          pt.applyAxisAngle(new THREE.Vector3(0, 1, 0), node0.raanRad);
          trailPoints.push(pt);
        }
        satTrailGeo.setFromPoints(trailPoints);

        step6CalculusBadge.position.copy(s0);
        step6CalculusBadge.position.y += 3.8;
      }

      // -------------------------------------------------------------
      // STEP 7: Multi-Satellite GDOP Pyramid Wireframe & Error Ellipsoid
      // -------------------------------------------------------------
      if (step === 7 && satPositions.length >= 4) {
        // Wireframe edges
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < 4; i++) {
          pts.push(recPos, satPositions[i]);
          pts.push(satPositions[i], satPositions[(i + 1) % 4]);
        }
        pyramidGeo.setFromPoints(pts);

        // Triangular faces connecting receiver to satellite pairs
        const facePts: THREE.Vector3[] = [];
        for (let i = 0; i < 4; i++) {
          facePts.push(recPos, satPositions[i], satPositions[(i + 1) % 4]);
        }
        pyramidFacesGeo.setFromPoints(facePts);
        pyramidFacesGeo.computeVertexNormals();

        // Subtle breathing pulsation on error ellipsoid
        const ellipsoidPulse = 1.0 + Math.sin(state.pulsePhase * 2.0) * 0.08;
        errorEllipsoid.scale.set(1.0 * ellipsoidPulse, 2.2 * ellipsoidPulse, 1.0 * ellipsoidPulse);
      }

      // -------------------------------------------------------------
      // STEP 8: ECEF to Local ENU Triad & Coordinate Frame Rotation
      // -------------------------------------------------------------
      if (step === 8) {
        enuTriadGroup.rotation.y = Math.sin(state.rotationMatrixAngle) * 0.4;
        enuTriadGroup.rotation.x = Math.cos(state.rotationMatrixAngle) * 0.25;
        axesGroup.rotation.y = Math.sin(state.rotationMatrixAngle) * 0.4;
      } else {
        axesGroup.rotation.set(0, 0, 0);
      }

      // -------------------------------------------------------------
      // STEP 9: Road Network Graph & Moving Dijkstra Navigation Agent
      // -------------------------------------------------------------
      if (step === 9) {
        // Animate vehicle traversing the Dijkstra path A -> C -> B -> D -> E -> F
        const dijkstraNodes = [
          graphNodePositions[0],
          graphNodePositions[2],
          graphNodePositions[1],
          graphNodePositions[3],
          graphNodePositions[4],
          graphNodePositions[5],
        ];
        const pathTime = (state.pulsePhase * 0.45) % (dijkstraNodes.length - 1);
        const segmentIdx = Math.floor(pathTime);
        const segmentProgress = pathTime - segmentIdx;
        const pA = dijkstraNodes[segmentIdx];
        const pB = dijkstraNodes[segmentIdx + 1];
        if (pA && pB) {
          navAgent.position.lerpVectors(pA, pB, segmentProgress);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const setCameraView = (preset: 'Overview' | 'Equatorial' | 'Polar' | 'Receiver') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    setCameraPresetName(preset);
    if (preset === 'Overview') {
      cam.position.set(50, 40, 70);
      ctrl.target.set(0, 0, 0);
    } else if (preset === 'Equatorial') {
      cam.position.set(75, 4, 15);
      ctrl.target.set(0, 0, 0);
    } else if (preset === 'Polar') {
      cam.position.set(0, 85, 0.1);
      ctrl.target.set(0, 0, 0);
    } else if (preset === 'Receiver') {
      cam.position.set(22, 18, 26);
      ctrl.target.set(8, 8, 8);
    }
    ctrl.update();
  };

  const getStep3DDescription = (s: number) => {
    switch (s) {
      case 1:
        return 'Step 1: Multi-photon laser beam at c=300,000 km/s with live distance billboard & Cartesian projection drops';
      case 2:
        return 'Step 2: 3 intersecting spherical shells, circular intersection plane disc, and valid P1 vs space P2 loci';
      case 3:
        return 'Step 3: 4 converging pseudorange laser beams, expanding radar rings, and solved receiver fix badge';
      case 4:
        return 'Step 4: WGS84 Equatorial disc, Greenwich Prime Meridian, and Latitude (φ) & Longitude (λ) angle arcs';
      case 5:
        return 'Step 5: 3D Vector Triangle (r⃗_sat, r⃗_rec, ρ⃗ = r⃗_sat - r⃗_rec), velocity v⃗, and zenith normal n̂';
      case 6:
        return 'Step 6: Tangential orbital velocity vector v=dr/dt and inward radial gravity acceleration a=-GM/r²';
      case 7:
        return 'Step 7: 5-satellite geometric pyramid (tetrahedron) and 3D positioning error ellipsoid for GDOP';
      case 8:
        return 'Step 8: Dynamic 3D rotation matrix rotating global ECEF axes into local East-North-Up (ENU) ground frame';
      case 9:
        return 'Step 9: Road network graph with weighted edges and animated moving agent on green Dijkstra route';
      default:
        return 'Interactive 3D Constellation & Celestial Stage';
    }
  };

  return (
    <div className="relative w-full h-[520px] md:h-[620px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Floating Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-lg max-w-sm sm:max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm text-slate-100">
              3D Orbit & Mathematics Viewport
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-mono text-cyan-400">Step {currentStep} Active</span>
          </div>
          <div className="mt-1 text-xs text-amber-300 font-medium flex items-center gap-1.5 leading-tight">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{getStep3DDescription(currentStep)}</span>
          </div>
        </div>
      </div>

      {/* Camera Views Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-lg">
        <button
          onClick={() => setCameraView('Overview')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            cameraPresetName === 'Overview'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setCameraView('Equatorial')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            cameraPresetName === 'Equatorial'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Equator
        </button>
        <button
          onClick={() => setCameraView('Polar')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            cameraPresetName === 'Polar'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Polar
        </button>
        <button
          onClick={() => setCameraView('Receiver')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            cameraPresetName === 'Receiver'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Receiver
        </button>
      </div>

      {/* Collapsible Bottom Control Dock */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-2xl transition-transform duration-300 ${
          hudCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              3D Viewport Controls & Step Overlays
            </span>
            <button
              onClick={() => setHudCollapsed(!hudCollapsed)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-0.5 rounded"
            >
              {hudCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Show Controls
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Collapse
                </>
              )}
            </button>
          </div>

          {!hudCollapsed && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-xs">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-colors ${
                  isPlaying
                    ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause Motion' : 'Resume Motion'}
              </button>

              <button
                onClick={() => setShowOrbits(!showOrbits)}
                className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
                  showOrbits
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Orbits: {showOrbits ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setShowSpheres(!showSpheres)}
                className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
                  showSpheres
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Spheres: {showSpheres ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setShowAxes(!showAxes)}
                className={`py-1.5 px-3 rounded-lg font-medium transition-colors ${
                  showAxes
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                ECEF Axes: {showAxes ? 'ON' : 'OFF'}
              </button>
            </div>
          )}

          {!hudCollapsed && showSpheres && (
            <div className="flex items-center gap-3 px-1 pt-1 text-xs text-slate-400">
              <span className="shrink-0">Sphere Opacity:</span>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={sphereOpacity}
                onChange={(e) => setSphereOpacity(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-slate-200 shrink-0">
                {(sphereOpacity * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
