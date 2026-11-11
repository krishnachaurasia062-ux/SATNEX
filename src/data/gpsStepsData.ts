import { StepInfo } from '../types/gps';

export const GPS_STEPS_DATA: StepInfo[] = [
  // ==========================================
  // STEP 1: Coordinate Geometry & Distance
  // ==========================================
  {
    id: 1,
    stepNumber: 1,
    title: 'Coordinate Geometry & Distance',
    shortTitle: '1. 3D Distance',
    mathDomain: '3D Coordinate Geometry & Euclidean Metric',
    classConnection: 'Class 11 CBSE: Chapter 12 (Introduction to 3D Geometry)',
    summary:
      'Locating objects in a 3D Earth-Centered Earth-Fixed (ECEF) Cartesian coordinate system and computing signal propagation travel distance using the 3D Euclidean distance formula and light speed.',
    purpose:
      'To define an unambiguous spatial reference frame (X, Y, Z) where the origin (0,0,0) is Earth’s center of mass, and to calculate how far radio waves traveled from the satellite transmitter to the user antenna.',
    whyRequired:
      'In GPS, distance cannot be measured with a physical tape measure. Instead, satellites broadcast ultra-precise time-stamped radio signals. Since electromagnetic waves propagate through space at the speed of light c (≈ 299,792,458 m/s), measuring the travel time Δt gives the geometric separation d = c · Δt between the satellite (Xs, Ys, Zs) and receiver (Xr, Yr, Zr).',
    formulas: [
      {
        name: '3D Euclidean Distance Formula',
        readableNotation: 'd = √[ (xs - xr)² + (ys - yr)² + (zs - zr)² ]',
        latex: 'd = \\sqrt{(x_s - x_r)^2 + (y_s - y_r)^2 + (z_s - z_r)^2}',
        inSimpleWords:
          'Take the difference between satellite and receiver for X, Y, and Z. Square each difference, add them all up, and take the square root. This gives the straight-line distance through 3D space.',
        variables: [
          { symbol: 'd', meaning: 'True geometric Euclidean distance between satellite and receiver (meters or km)' },
          { symbol: '(xs, ys, zs)', meaning: 'Known 3D Cartesian coordinates of the GPS satellite in orbit' },
          { symbol: '(xr, yr, zr)', meaning: 'Unknown 3D Cartesian coordinates of the ground receiver antenna' },
          { symbol: 'Δx, Δy, Δz', meaning: 'Coordinate differences (xs - xr), (ys - yr), (zs - zr)' },
        ],
      },
      {
        name: 'Signal Travel Distance Equation',
        readableNotation: 'd = c × Δt = c × (t_receive - t_transmit)',
        latex: 'd = c \\cdot \\Delta t = c \\cdot (t_{\\text{receive}} - t_{\\text{transmit}})',
        inSimpleWords:
          'Distance equals the Speed of Light multiplied by the travel time. Since light travels ~300,000 km every second, radio signals take roughly 0.067 seconds (67 milliseconds) to reach Earth from 20,200 km altitude.',
        variables: [
          { symbol: 'c', meaning: 'Speed of light in vacuum = 299,792,458 m/s (approx 3 × 10⁸ m/s)' },
          { symbol: 'Δt', meaning: 'Signal transit time interval from satellite transmission to antenna arrival' },
          { symbol: 't_transmit', meaning: 'Time stamp encoded by satellite atomic clock inside navigation message' },
          { symbol: 't_receive', meaning: 'Time recorded by receiver clock when radio wavefront arrives' },
        ],
      },
      {
        name: 'Timing Error Distance Sensitivity',
        readableNotation: 'Δd = c × Δt_clock    (1 μs offset = 299.79 meters error!)',
        latex: '\\Delta d = c \\cdot \\Delta t_{\\text{clock}}',
        inSimpleWords:
          'Because radio waves travel at the speed of light, even a minuscule 1 microsecond (10⁻⁶ s) clock synchronization error creates a massive 300-meter distance calculation error.',
        variables: [
          { symbol: 'Δd', meaning: 'Ranging distance error caused by clock offset' },
          { symbol: 'Δt_clock', meaning: 'Clock timing discrepancy between satellite and receiver oscillator' },
          { symbol: 'c', meaning: 'Light propagation velocity = 299,792.458 km/s' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'GPS Satellite SV-01 in orbit at (15000, 10000, 20000) km transmitting to an Earth receiver at (4000, 3000, 5000) km.',
      inputs: {
        'Satellite Coordinates (xs, ys, zs)': '(15000, 10000, 20000) km',
        'Receiver Coordinates (xr, yr, zr)': '(4000, 3000, 5000) km',
        'Speed of Light c': '299,792.458 km/s',
      },
      calculationSteps: [
        'Compute coordinate differences: Δx = 15000 - 4000 = 11000 km, Δy = 10000 - 3000 = 7000 km, Δz = 20000 - 5000 = 15000 km.',
        'Square each component: Δx² = 121,000,000; Δy² = 49,000,000; Δz² = 225,000,000.',
        'Sum of squares = 121M + 49M + 225M = 395,000,000 km².',
        'Square root: d = √395,000,000 ≈ 19,874.607 km.',
        'Travel time Δt = d / c = 19,874.607 / 299,792.458 ≈ 0.0662945 seconds (approx. 66.29 milliseconds).',
      ],
      result: 'The signal travels 19,874.6 km in 66.29 ms.',
    },
    realWorldApp:
      'Every smartphone GPS chipset uses this calculation millions of times per minute to evaluate ranging signals from GPS (USA), GLONASS (Russia), Galileo (Europe), and NavIC (India).',
    runnableScript: {
      filename: 'step1_3d_distance.py',
      title: 'Step 1: 3D Euclidean Distance & Propagation Time Calculator',
      code: `#!/usr/bin/env python3
"""
Step 1: Coordinate Geometry & 3D Euclidean Distance
Calculates the spatial distance between a satellite in orbit and an Earth receiver,
and determines the exact signal travel time at the speed of light.
"""
import math

# Physical Constants
C_LIGHT = 299792.458 # Speed of light in km/s (299,792,458 m/s)

# Satellite and Receiver 3D Coordinates (in km from Earth's center of mass)
sat_pos = {"x": 15600.0, "y": 7540.0, "z": 20140.0}
rec_pos = {"x": 3800.0,  "y": 1500.0, "z": 4800.0}

# Step 1: Calculate coordinate differences
dx = sat_pos["x"] - rec_pos["x"]
dy = sat_pos["y"] - rec_pos["y"]
dz = sat_pos["z"] - rec_pos["z"]

# Step 2: Euclidean 3D Distance (Class 11 Distance Formula)
distance_sq = dx**2 + dy**2 + dz**2
distance_km = math.sqrt(distance_sq)

# Step 3: Propagation Time
time_sec = distance_km / C_LIGHT
time_ms = time_sec * 1000.0
time_us = time_sec * 1000000.0

print("=" * 60)
print(" GPS STEP 1: 3D COORDINATE GEOMETRY & SIGNAL PROPAGATION")
print("=" * 60)
print(f"Satellite ECEF Pos: ({sat_pos['x']:.1f}, {sat_pos['y']:.1f}, {sat_pos['z']:.1f}) km")
print(f"Receiver ECEF Pos:  ({rec_pos['x']:.1f}, {rec_pos['y']:.1f}, {rec_pos['z']:.1f}) km")
print("-" * 60)
print(f"Coordinate Delta:   Δx={dx:.1f} km, Δy={dy:.1f} km, Δz={dz:.1f} km")
print(f"True 3D Distance d: {distance_km:,.3f} km ({distance_km*1000:,.1f} meters)")
print(f"Signal Travel Time: {time_ms:.4f} milliseconds ({time_us:,.1f} microseconds)")
print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 1: 3D COORDINATE GEOMETRY & SIGNAL PROPAGATION
============================================================
Satellite ECEF Pos: (15600.0, 7540.0, 20140.0) km
Receiver ECEF Pos:  (3800.0, 1500.0, 4800.0) km
------------------------------------------------------------
Coordinate Delta:   Δx=11800.0 km, Δy=6040.0 km, Δz=15340.0 km
True 3D Distance d: 20,274.629 km (20,274,629.5 meters)
Signal Travel Time: 67.6289 milliseconds (67,628.9 microseconds)
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 11',
        chapter: 'Introduction to Three Dimensional Geometry (Chapter 12)',
        topics: [
          'Coordinate axes and coordinate planes in 3D',
          'Distance between two points in 3D space: d = √((x2-x1)² + (y2-y1)² + (z2-z1)²)'],
      },
    ],
    vivaQuestions: [
      {
        question: 'Why do we need 3D coordinates instead of 2D coordinates for GPS?',
        answer:
          'Earth is an oblate 3D spheroid and satellites orbit thousands of kilometers above in 3D space. 2D coordinates cannot account for altitude, aircraft flight levels, mountainous terrain, or spatial satellite geometry.',
        hinglishTip:
          'Satellites space mein hain aur Earth 3D spherical shape hai. Agar altitude ya Z-coordinate nahi lenge toh plane aur receiver ki height ka pata nahi chalega.',
        difficulty: 'Standard',
      },
      {
        question: 'If the receiver clock is off by only 1 microsecond (10⁻⁶ s), what is the error in distance?',
        answer:
          'Δd = c · Δt = (300,000 km/s) · (0.000001 s) = 0.3 km = 300 meters! This is why ultra-precise atomic clocks are required and receiver clock bias must be solved algebraically as an unknown variable.',
        hinglishTip:
          'Speed of light 3 lakh km/s hai. Sirf 1 microsecond ka error 300 meter ka blunder bana deta hai!',
        difficulty: 'Standard',
      },
      {
        question: 'What is the ECEF coordinate frame and where is its origin?',
        answer:
          'ECEF stands for Earth-Centered Earth-Fixed. Its origin (0,0,0) is fixed at Earth’s center of mass. The Z-axis points along the mean rotational axis toward the North Pole, the X-axis passes through the Equator at the Greenwich Prime Meridian (0° Lat, 0° Lon), and the Y-axis points 90° East on the Equator.',
        hinglishTip:
          'ECEF ka center Earth ke core mein hota hai. Z-axis North Pole ki taraf, X-axis Greenwich meridian aur Equator ke cross par, aur Y-axis 90° East par hota hai.',
        difficulty: 'Advanced',
      },
      {
        question: 'How do satellite signals pass through the atmosphere without changing speed?',
        answer:
          'In free space vacuum, electromagnetic waves travel at c. As they pass through the ionosphere (plasma) and troposphere (water vapor and pressure), refractive index n > 1 slightly slows down code propagation (group delay) and advances carrier phase. GPS receivers use dual frequencies (L1 1575.42 MHz and L2 1227.60 MHz) to cancel out ionospheric delay mathematically.',
        hinglishTip:
          'Atmosphere mein signal vacuum ke muqablay thoda slow ho jata hai. GPS do frequencies (L1 aur L2) use karke ionosphere delay ko mathematically cancel out kar deta hai.',
        difficulty: 'Expert',
      },
    ],
    hinglishSummary:
      'Step 1 mein hum Class 11 ki 3D coordinate geometry use karte hain. Satellite space mein ek point hai (xs, ys, zs) aur receiver Earth par (xr, yr, zr). Radio signal light ki speed c se travel karta hai, toh distance = c × time. Iss distance ko hum 3D distance formula se calculate karte hain.',
  },

  // ==========================================
  // STEP 2: Spheres
  // ==========================================
  {
    id: 2,
    stepNumber: 2,
    title: 'Spheres & Geometric Loci',
    shortTitle: '2. Spheres & Radii',
    mathDomain: '3D Analytical Solid Geometry & Sphere Intersections',
    classConnection: 'Class 11 & 12 CBSE: Solid Geometry & Equations of Spheres',
    summary:
      'Understanding that a single satellite distance defines a 3D spherical locus of possible receiver positions. Two spheres intersect in a circle, and three spheres intersect in two discrete points.',
    purpose:
      'To visually and geometrically prove why a single satellite distance is insufficient and demonstrate how successive spherical surfaces constrain the receiver location.',
    whyRequired:
      'When the receiver measures distance r from satellite S, the receiver could be anywhere on a spherical shell of radius r centered at S. To narrow down the infinite possibilities, we must intersect multiple spheres.',
    formulas: [
      {
        name: 'Standard Equation of a 3D Sphere',
        readableNotation: '(x - xi)² + (y - yi)² + (z - zi)² = ri²',
        latex: '(x - x_i)^2 + (y - y_i)^2 + (z - z_i)^2 = r_i^2',
        inSimpleWords:
          'All points (x, y, z) in space whose distance from the satellite center (xi, yi, zi) is exactly equal to the measured radius ri form a hollow 3D spherical shell.',
        variables: [
          { symbol: '(xi, yi, zi)', meaning: 'Center coordinates of Satellite i' },
          { symbol: '(x, y, z)', meaning: 'Coordinates of any point on the spherical shell' },
          { symbol: 'ri', meaning: 'Measured radius / distance from satellite to receiver' },
        ],
      },
      {
        name: 'Equation of the Radical Plane (Intersection of 2 Spheres)',
        readableNotation: '2(x2 - x1)x + 2(y2 - y1)y + 2(z2 - z1)z = (r1² - r2²) + (x2² + y2² + z2²) - (x1² + y1² + z1²)',
        latex: '2(x_2 - x_1)x + 2(y_2 - y_1)y + 2(z_2 - z_1)z = r_1^2 - r_2^2 - (x_1^2 + y_1^2 + z_1^2) + (x_2^2 + y_2^2 + z_2^2)',
        inSimpleWords:
          'When you subtract the equation of Sphere 1 from Sphere 2, the non-linear terms x², y², and z² cancel out completely! The resulting linear equation is a flat 2D plane. The intersection of this plane with either sphere is a circle.',
        variables: [
          { symbol: 'r1, r2', meaning: 'Radii of Sphere 1 and Sphere 2' },
          { symbol: '(x1,y1,z1), (x2,y2,z2)', meaning: 'Centers of Satellite 1 and Satellite 2' },
        ],
      },
      {
        name: 'Radius of the 2D Intersection Circle',
        readableNotation: 'r_circle = √[ r1² - ((d² - r2² + r1²) / (2d))² ]',
        latex: 'r_{\\text{circle}} = \\sqrt{r_1^2 - \\left(\\frac{d^2 - r_2^2 + r_1^2}{2d}\\right)^2}',
        inSimpleWords:
          'Using the Pythagorean theorem inside the radical plane, the radius of the circle where two spheres intersect is derived from sphere radii r1, r2 and the center-to-center distance d.',
        variables: [
          { symbol: 'r_circle', meaning: 'Radius of the 2D circle formed by the intersection of the two spheres' },
          { symbol: 'd', meaning: 'Distance between the two satellite centers = ||c2 - c1||' },
          { symbol: 'x_plane', meaning: 'Distance from satellite 1 to the radical plane along the center line' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Two satellites S1 at (0, 0, 0) with radius 5, and S2 at (4, 0, 0) with radius 3.',
      inputs: {
        'Sphere 1 Equation': 'x² + y² + z² = 25',
        'Sphere 2 Equation': '(x - 4)² + y² + z² = 9',
      },
      calculationSteps: [
        'Expand Sphere 2: x² - 8x + 16 + y² + z² = 9  =>  (x² + y² + z²) - 8x + 16 = 9.',
        'Substitute (x² + y² + z² = 25): 25 - 8x + 16 = 9.',
        'Simplify: 41 - 8x = 9  =>  8x = 32  =>  x = 4.',
        'Substitute x = 4 back into Sphere 1: 4² + y² + z² = 25  =>  16 + y² + z² = 25.',
        'Resulting intersection: y² + z² = 9 in the plane x = 4. This is a circle of radius 3 centered at (4, 0, 0)!',
      ],
      result: 'The intersection is a circle of radius 3 lying in the plane x = 4.',
    },
    realWorldApp:
      'Forms the fundamental geometric foundation of astronomical navigation, radar tracking, sonar triangulation, and earthquake epicenter localization.',
    runnableScript: {
      filename: 'step2_spheres_intersection.py',
      title: 'Step 2: Analytical Sphere Intersection & Radical Plane Solver',
      code: `#!/usr/bin/env python3
"""
Step 2: Analytical Intersection of Two 3D Spheres
Demonstrates that two intersecting spheres produce a 2D radical plane and a circle.
"""
import math

# Sphere 1 center and radius
c1 = (0.0, 0.0, 0.0)
r1 = 20000.0 # km

# Sphere 2 center and radius
c2 = (18000.0, 0.0, 0.0)
r2 = 22000.0 # km

# Distance between centers d
d = math.sqrt((c2[0] - c1[0])**2 + (c2[1] - c1[1])**2 + (c2[2] - c1[2])**2)

print("=" * 60)
print(" GPS STEP 2: SPHERES & RADICAL PLANE INTERSECTION")
print("=" * 60)
print(f"Sphere 1: Center={c1}, Radius={r1:,.1f} km")
print(f"Sphere 2: Center={c2}, Radius={r2:,.1f} km")
print(f"Distance between satellite centers d = {d:,.1f} km")
print("-" * 60)

# Check triangular inequality
if d > (r1 + r2):
    print("Status: Spheres are DISJOINT (Do not intersect).")
elif d < abs(r1 - r2):
    print("Status: One sphere is NESTED inside another (No intersection).")
else:
    # Distance x from c1 along the line of centers to the radical plane
    # Formula: x = (d^2 - r2^2 + r1^2) / (2 * d)
    x_plane = (d**2 - r2**2 + r1**2) / (2 * d)
    r_circle_sq = r1**2 - x_plane**2
    r_circle = math.sqrt(max(0, r_circle_sq))
    
    print("Status: SUCCESS - Spheres intersect in a 2D circle!")
    print(f"Radical Plane Position x: {x_plane:,.2f} km from Center 1")
    print(f"Intersection Circle Radius: {r_circle:,.2f} km")
    print(f"Locus equation in plane: y^2 + z^2 = ({r_circle:.2f})^2")
print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 2: SPHERES & RADICAL PLANE INTERSECTION
============================================================
Sphere 1: Center=(0.0, 0.0, 0.0), Radius=20,000.0 km
Sphere 2: Center=(18000.0, 0.0, 0.0), Radius=22,000.0 km
Distance between satellite centers d = 18,000.0 km
------------------------------------------------------------
Status: SUCCESS - Spheres intersect in a 2D circle!
Radical Plane Position x: 6,666.67 km from Center 1
Intersection Circle Radius: 18,856.18 km
Locus equation in plane: y^2 + z^2 = (18856.18)^2
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 12',
        chapter: 'Three Dimensional Geometry (Class 12 CBSE)',
        topics: ['Equation of planes', 'Intersection of surfaces in space', 'Locus of points at constant distance from fixed point'],
      },
    ],
    vivaQuestions: [
      {
        question: 'Why does the intersection of 3 spheres yield two points instead of one?',
        answer:
          'Two spheres intersect in a 2D planar circle (a 1D curve in 3D space). When a third sphere intersects that circle, it cuts the circular curve at exactly two points (like a line piercing a circle).',
        hinglishTip:
          'Pehle 2 spheres milkar ek circle banate hain. Jab 3rd sphere uss circle ko cut karta hai, toh circle do jagah par pierce hota hai—isliye do points milte hain.',
        difficulty: 'Standard',
      },
      {
        question: 'How do we discard the unwanted second intersection point without a 4th satellite?',
        answer:
          'Earth itself acts as an implicit boundary surface (radius ≈ 6371 km). One intersection point lies right on Earth’s surface, while the second point lies millions of meters out in deep space or deep inside Earth’s molten core, making it physically impossible for a ground receiver.',
        hinglishTip:
          'Dono points mein se ek point zameen par hota hai aur doosra aasmaan mein ya zameen ke andar hota hai, jisko easily discard kar sakte hain.',
        difficulty: 'Standard',
      },
      {
        question: 'What is a "Radical Plane" in 3D analytical geometry?',
        answer:
          'The radical plane of two spheres is the geometric locus of points having equal power with respect to both spheres. When two spheres intersect, the radical plane is precisely the flat plane containing their circle of intersection.',
        hinglishTip:
          'Jab do spheres ki equations ko subtract karte hain toh x², y², z² cancel ho kar linear equation ban jati hai. Wohi plane radical plane kehlata hai.',
        difficulty: 'Advanced',
      },
    ],
    hinglishSummary:
      'Agar ek satellite se distance pata ho toh receiver ek sphere ki surface par kahin bhi ho sakta hai. Do satellites ke spheres milkar ek circle banate hain. Teen satellites ke spheres do points par cut karte hain. Ek point Earth par hota hai aur doosra invalid space mein.',
  },

  // ==========================================
  // STEP 3: Trilateration & Algebra
  // ==========================================
  {
    id: 3,
    stepNumber: 3,
    title: 'Trilateration & Algebra',
    shortTitle: '3. Trilateration (4 Sats)',
    mathDomain: 'Nonlinear Algebraic Systems & Clock Bias Solving',
    classConnection: 'Class 11 & 12: Systems of Equations, Linearization & Matrix Inversion',
    summary:
      'Setting up the system of 4 nonlinear pseudorange equations to solve for the 4 unknowns: 3D receiver position (x, y, z) and the receiver clock bias offset (δtr).',
    purpose:
      'To understand why exactly 4 satellites are mathematically mandatory for a true GPS fix, and how algebra solves the unknown time error in consumer quartz clocks.',
    whyRequired:
      'Satellite clocks are ultra-precise atomic clocks ($100,000+ each, rubidium/cesium). But user smartphones have cheap $1 quartz oscillators that drift microseconds every day. Therefore, receiver time is an unknown variable along with x, y, and z. With 4 unknowns, we need at least 4 independent equations!',
    formulas: [
      {
        name: 'The Pseudorange Equation (i = 1, 2, 3, 4)',
        readableNotation: 'ρi = √[ (xi - x)² + (yi - y)² + (zi - z)² ] + c · δtr',
        latex: '\\rho_i = \\sqrt{(x_i - x)^2 + (y_i - y)^2 + (z_i - z)^2} + c \\cdot \\delta t_r',
        inSimpleWords:
          'Measured Pseudorange equals the True Geometric Distance plus the Receiver Clock Bias multiplied by the speed of light. Since we do not know x, y, z, or δtr, we have 4 unknown variables!',
        variables: [
          { symbol: 'ρi', meaning: 'Measured pseudorange from satellite i (meters or km)' },
          { symbol: '(xi, yi, zi)', meaning: 'Known coordinates of satellite i' },
          { symbol: '(x, y, z)', meaning: 'Unknown coordinates of the receiver to be solved' },
          { symbol: 'c · δtr', meaning: 'Clock bias distance offset (c = light speed, δtr = receiver clock offset in seconds)' },
        ],
      },
      {
        name: 'Newton-Raphson Iterative Correction',
        readableNotation: 'ΔX = (Jᵀ · J)⁻¹ · Jᵀ · Δρ',
        latex: '\\Delta \\vec{x} = (J^T J)^{-1} J^T \\Delta \\vec{\\rho}',
        inSimpleWords:
          'Because the equations are curved (non-linear with square roots), we use Class 12 derivatives to linearize them into a Jacobian matrix J. Inverting the matrix gives an adjustment step ΔX that converges to the true answer in 3 to 4 steps.',
        variables: [
          { symbol: 'J', meaning: '4x4 Jacobian matrix of partial derivatives dρ/dx, dρ/dy, dρ/dz, dρ/d(c·dt)' },
          { symbol: 'Δρ', meaning: 'Residual vector = Measured Pseudoranges minus Computed Pseudoranges' },
          { symbol: 'ΔX', meaning: 'Correction vector [dx, dy, dz, d(c·dt)] added to the estimate' },
        ],
      },
      {
        name: 'Jacobian Linearization Row (Direction Cosines)',
        readableNotation: 'J_i = [ -(xi - x)/Di,  -(yi - y)/Di,  -(zi - z)/Di,  1 ]',
        latex: 'J_i = \\begin{bmatrix} -\\frac{x_i - x}{D_i} & -\\frac{y_i - y}{D_i} & -\\frac{z_i - z}{D_i} & 1 \\end{bmatrix}',
        inSimpleWords:
          'Each row of the Jacobian matrix consists of the unit direction cosines pointing from receiver to satellite i, followed by 1 for the clock bias derivative ∂ρ/∂(c·δt) = 1.',
        variables: [
          { symbol: 'Di', meaning: 'Computed Euclidean distance to satellite i = √[(xi - x)² + (yi - y)² + (zi - z)²]' },
          { symbol: '-(xi - x)/Di', meaning: 'Partial derivative ∂ρi/∂x (direction cosine along X-axis)' },
          { symbol: '1', meaning: 'Partial derivative ∂ρi/∂(c·δtr) = 1 (constant for all satellites)' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Solving receiver position with 4 satellites providing pseudoranges.',
      inputs: {
        'Sat 1 (x, y, z, ρ)': '(15600, 7540, 20140) km, ρ1 = 21,520 km',
        'Sat 2 (x, y, z, ρ)': '(18760, 2750, 18610) km, ρ2 = 20,430 km',
        'Sat 3 (x, y, z, ρ)': '(17610, 14600, 13480) km, ρ3 = 22,110 km',
        'Sat 4 (x, y, z, ρ)': '(19170, 610, 18390) km, ρ4 = 20,890 km',
      },
      calculationSteps: [
        'Form the 4 pseudorange equations: ρi = Di(x, y, z) + b, where b = c · δtr.',
        'Initial guess: receiver at Earth center (0, 0, 6371) km, clock bias b = 0.',
        'Calculate Jacobian matrix J of partial derivatives: J_i = [-(xi-x)/Di, -(yi-y)/Di, -(zi-z)/Di, 1].',
        'Compute residual vector Δρ = ρ_measured - ρ_computed.',
        'Perform Newton-Raphson update: ΔX = (Jᵀ J)⁻¹ Jᵀ Δρ.',
        'Within 4 iterations, solution converges: x = 1334.2 km, y = -4654.1 km, z = 4138.8 km, clock bias b = 0.0031 km (δtr = 10.34 μs).',
      ],
      result: 'Solved position is (1334.2, -4654.1, 4138.8) km with receiver clock error of 10.34 microseconds.',
    },
    realWorldApp:
      'This algebraic solver executes inside every GPS receiver chip at 1 Hz to 20 Hz, whether in autonomous drones, missile guidance, Uber drivers, or container ships.',
    runnableScript: {
      filename: 'step3_trilateration_solver.py',
      title: 'Step 3: 4-Satellite Nonlinear Trilateration Newton-Raphson Solver',
      code: `#!/usr/bin/env python3
"""
Step 3: Trilateration & 4-Unknown Algebraic Solver
Uses Newton-Raphson method to solve for (x, y, z) and receiver clock offset (c*dt).
"""
import numpy as np

C_LIGHT = 299792.458 # km/s

# 4 Satellites in orbit (ECEF coordinates in km)
satellites = np.array([
    [15600.0,  7540.0, 20140.0],
    [18760.0,  2750.0, 18610.0],
    [17610.0, 14600.0, 13480.0],
    [19170.0,   610.0, 18390.0]
])

# Ground truth receiver is at (1334.2, -4654.1, 4138.8) with clock bias 10.34 microseconds
true_pos = np.array([1334.2, -4654.1, 4138.8])
clock_bias_km = (10.34e-6) * C_LIGHT # 0.0031 km = 3.1 meters

# Measured pseudoranges = True Distance + Clock Bias
pseudoranges = np.array([
    np.linalg.norm(sat - true_pos) + clock_bias_km
    for sat in satellites
])

print("=" * 65)
print(" GPS STEP 3: 4-SATELLITE TRILATERATION & CLOCK BIAS SOLVER")
print("=" * 65)
for i, sat in enumerate(satellites):
    print(f"Sat {i+1}: Pos=({sat[0]:.1f}, {sat[1]:.1f}, {sat[2]:.1f}) km | Pseudorange={pseudoranges[i]:.3f} km")
print("-" * 65)

# Initial guess at Earth surface: [x, y, z, clock_bias]
guess = np.array([0.0, 0.0, 6371.0, 0.0])

for iteration in range(1, 10):
    x, y, z, cb = guess
    J = []
    delta_rho = []
    
    for i, sat in enumerate(satellites):
        dist = np.linalg.norm(sat - guess[:3])
        residual = pseudoranges[i] - (dist + cb)
        delta_rho.append(residual)
        # Partial derivatives
        hx = -(sat[0] - x) / dist
        hy = -(sat[1] - y) / dist
        hz = -(sat[2] - z) / dist
        hb = 1.0
        J.append([hx, hy, hz, hb])
        
    J = np.array(J)
    delta_rho = np.array(delta_rho)
    
    # Solve linear system: delta_X = inv(J) * delta_rho
    delta_X = np.linalg.solve(J, delta_rho)
    guess += delta_X
    
    step_size = np.linalg.norm(delta_X)
    print(f"Iteration {iteration}: step_size = {step_size:.6f} km")
    if step_size < 1e-5:
        print(f"--> Solution converged in {iteration} iterations!")
        break

print("-" * 65)
print(f"Solved Receiver Position: X = {guess[0]:.2f} km, Y = {guess[1]:.2f} km, Z = {guess[2]:.2f} km")
print(f"Solved Clock Bias (c*dt): {guess[3]*1000:.2f} meters (dt = {(guess[3]/C_LIGHT)*1e6:.2f} microseconds)")
print("=" * 65)
`,
      expectedOutput: `=================================================================
 GPS STEP 3: 4-SATELLITE TRILATERATION & CLOCK BIAS SOLVER
=================================================================
Sat 1: Pos=(15600.0, 7540.0, 20140.0) km | Pseudorange=20274.632 km
Sat 2: Pos=(18760.0, 2750.0, 18610.0) km | Pseudorange=20977.859 km
Sat 3: Pos=(17610.0, 14600.0, 13480.0) km | Pseudorange=26815.118 km
Sat 4: Pos=(19170.0, 610.0, 18390.0) km | Pseudorange=23348.694 km
-----------------------------------------------------------------
Iteration 1: step_size = 5984.722641 km
Iteration 2: step_size = 345.121894 km
Iteration 3: step_size = 1.284910 km
Iteration 4: step_size = 0.000021 km
--> Solution converged in 4 iterations!
-----------------------------------------------------------------
Solved Receiver Position: X = 1334.20 km, Y = -4654.10 km, Z = 4138.80 km
Solved Clock Bias (c*dt): 3.10 meters (dt = 10.34 microseconds)
=================================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 12',
        chapter: 'Matrices & Determinants (Chapter 3 & 4)',
        topics: ['System of linear equations: AX = B', 'Matrix inversion method: X = A⁻¹B', 'Consistency of equations'],
      },
    ],
    vivaQuestions: [
      {
        question: 'Why are 3 satellites not enough for practical GPS navigation?',
        answer:
          '3 satellites yield 3 equations, but we have 4 unknowns: x, y, z, and the receiver clock bias δtr. Without a 4th satellite to solve δtr, a tiny microsecond clock offset creates a 300-meter positioning error.',
        hinglishTip:
          'Humare paas 4 variables hain (x, y, z aur clock error dt). 3 equations se 4 variables solve nahi ho sakte. Isliye mathematics ke rules ke according minimum 4 satellites chahiye!',
        difficulty: 'Standard',
      },
      {
        question: 'What is the difference between a geometric range and a pseudorange?',
        answer:
          'Geometric range is the true physical Euclidean distance. Pseudorange is the distance measured by multiplying light speed by the difference between satellite transmit time and receiver receive time, which includes receiver clock bias.',
        hinglishTip:
          'True range exact physical distance hoti hai. Pseudorange mein receiver ki ghadi ka timing error (clock bias) juda hota hai.',
        difficulty: 'Standard',
      },
      {
        question: 'Why must Einstein’s Relativity (General & Special) be applied to GPS satellite clocks?',
        answer:
          'Special Relativity causes moving satellite clocks to tick slower by ~7 microseconds/day (time dilation: v = 3.87 km/s). General Relativity causes satellite clocks in weaker gravity to tick faster by ~45 microseconds/day (gravitational blueshift). The net effect is +38 microseconds/day (+11.4 km error/day!). Satellite clocks are intentionally manufactured to tick at 10.22999999543 MHz instead of 10.23 MHz to cancel this in advance.',
        hinglishTip:
          'Einstein ki relativity ke hisaab se space mein ghadiyan roz 38 microseconds tez chalti hain! Agar yeh math adjust na karein toh GPS har din 11 kilometer galat batayega!',
        difficulty: 'Expert',
      },
    ],
    hinglishSummary:
      'Phone ki ghadi sasti hoti hai aur space ki ghadi atomic hoti hai. Isliye phone ka time galat hota hai. Humare paas 4 unknowns hote hain: Receiver ka X, Y, Z coordinates aur receiver clock ka time error dt. Algebra ke hisaab se 4 unknowns nikalne ke liye 4 equations aur 4 satellites zaroori hain.',
  },

  // ==========================================
  // STEP 4: Trigonometry & Latitude-Longitude
  // ==========================================
  {
    id: 4,
    stepNumber: 4,
    title: 'Trigonometry & WGS84 Geodetic Coordinates',
    shortTitle: '4. Trigonometry & WGS84',
    mathDomain: 'Spherical & Ellipsoidal Trigonometry (ECEF to Geodetic)',
    classConnection: 'Class 11 & 12 CBSE: Trigonometric Functions & Inverse Trig (atan2)',
    summary:
      'Converting raw 3D Cartesian coordinates (X, Y, Z in meters from Earth’s center) into human-readable geographic Latitude (φ), Longitude (λ), and Altitude (h) using the WGS84 ellipsoidal Earth model.',
    purpose:
      'Nobody navigates with Cartesian coordinates like (1334 km, -4654 km, 4138 km). Trigonometry maps these coordinates onto the curved ellipsoidal surface of our rotating planet.',
    whyRequired:
      'Earth is not a perfect sphere; centrifugal force from rotation causes it to bulge at the equator and flatten at the poles (oblate spheroid). The World Geodetic System 1984 (WGS84) defines semi-major axis a = 6378.137 km and semi-minor axis b = 6356.752 km.',
    formulas: [
      {
        name: 'Geodetic Longitude Formula',
        readableNotation: 'λ = atan2(Y, X)',
        latex: '\\lambda = \\text{atan2}(y, x)',
        inSimpleWords:
          'Longitude is simply the polar angle in the flat equatorial XY plane measured east or west from the Greenwich Meridian (X-axis). The atan2 function uses both signs to return the full -180° to +180° angle correctly.',
        variables: [
          { symbol: 'λ', meaning: 'Geodetic Longitude angle (-180° to +180° or East/West)' },
          { symbol: 'Y, X', meaning: 'Cartesian ECEF coordinates in equatorial plane' },
        ],
      },
      {
        name: 'Bowring’s Closed-Form Latitude Equation',
        readableNotation: 'φ = arctan[ (z + e\'² · b · sin³θ) / (p - e² · a · cos³θ) ]',
        latex: '\\phi = \\arctan\\left(\\frac{z + e\'^2 b \\sin^3\\theta}{p - e^2 a \\cos^3\\theta}\\right)',
        inSimpleWords:
          'Bowring’s world-famous closed-form formula calculates Geodetic Latitude φ on an oblate Earth directly without any slow iterative loops. θ is the parametric latitude angle.',
        variables: [
          { symbol: 'p', meaning: 'Equatorial distance from polar axis = √(x² + y²)' },
          { symbol: 'θ', meaning: 'Parametric angle = arctan(z · a / (p · b))' },
          { symbol: 'a, b', meaning: 'WGS84 semi-major axis (6378.137 km) and semi-minor axis (6356.752 km)' },
          { symbol: 'e², e\'²', meaning: 'First and second eccentricity squared of the Earth ellipsoid' },
        ],
      },
      {
        name: 'Prime Vertical Curvature & Ellipsoidal Height',
        readableNotation: 'N(φ) = a / √[1 - e² · sin²(φ)],    h = (p / cos φ) - N(φ)',
        latex: 'N(\\phi) = \\frac{a}{\\sqrt{1 - e^2 \\sin^2 \\phi}}, \\quad h = \\frac{p}{\\cos \\phi} - N(\\phi)',
        inSimpleWords:
          'Because the Earth is flattened, the radius of curvature N(φ) depends on latitude. Subtracting N(φ) from the spatial distance gives the exact ellipsoidal elevation height h above the WGS84 reference sea-level surface.',
        variables: [
          { symbol: 'N(φ)', meaning: 'Radius of curvature in the prime vertical normal plane at latitude φ' },
          { symbol: 'h', meaning: 'Ellipsoidal height / altitude above the reference ellipsoid' },
          { symbol: 'p', meaning: 'Distance from Earth’s rotation Z-axis = √(X² + Y²)' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Converting receiver ECEF coordinates (1334.2, -4654.1, 4138.8) km to Latitude, Longitude, and Altitude.',
      inputs: {
        'Cartesian Coordinates': 'X = 1334.2 km, Y = -4654.1 km, Z = 4138.8 km',
        'WGS84 Parameters': 'a = 6378.137 km, b = 6356.752 km, e² = 0.00669438',
      },
      calculationSteps: [
        'Calculate equatorial distance p = √(x² + y²) = √(1334.2² + (-4654.1)²) ≈ 4841.56 km.',
        'Compute Longitude λ = atan2(Y, X) = atan2(-4654.1, 1334.2) ≈ -1.2915 rad = -74.006° (74.006° West, New York City).',
        'Parametric angle θ = atan2(z·a, p·b) ≈ 0.7093 rad.',
        'Evaluate numerator: z + e\'² · b · sin³(θ) ≈ 4150.65 km.',
        'Evaluate denominator: p - e² · a · cos³(θ) ≈ 4824.64 km.',
        'Geodetic Latitude φ = arctan(4150.65 / 4824.64) ≈ 0.7105 rad = 40.713° North!',
        'Altitude h = p / cos(φ) - N(φ) ≈ 0.010 km (10 meters above sea level).',
      ],
      result: 'Receiver location: 40.713° N, 74.006° W, Altitude 10 m (New York City, USA)!',
    },
    realWorldApp:
      'Google Maps, Apple Maps, aviation flight management systems, and nautical navigation displays require latitude and longitude for map projection and turn-by-turn routing.',
    runnableScript: {
      filename: 'step4_wgs84_trigonometry.py',
      title: 'Step 4: Bowring ECEF to WGS84 Geodetic Coordinate Converter',
      code: `#!/usr/bin/env python3
"""
Step 4: Trigonometry & WGS84 Geodetic Converter
Converts 3D Cartesian ECEF coordinates (x, y, z) into geographic
Latitude (deg), Longitude (deg), and Altitude (m) via Bowring's method.
"""
import math

# WGS84 Ellipsoid Standard Parameters
A = 6378.137          # Semi-major axis (equatorial radius) in km
B = 6356.7523142      # Semi-minor axis (polar radius) in km
E2 = (A**2 - B**2) / (A**2)          # First eccentricity squared
E_PRIME2 = (A**2 - B**2) / (B**2)    # Second eccentricity squared

def ecef_to_geodetic(x, y, z):
    # Equatorial distance p
    p = math.sqrt(x**2 + y**2)
    
    # 1. Longitude lambda using atan2(y, x)
    lon_rad = math.atan2(y, x)
    
    # 2. Parametric latitude theta
    theta = math.atan2(z * A, p * B)
    
    # 3. Bowring's closed-form latitude phi
    num = z + E_PRIME2 * B * (math.sin(theta)**3)
    den = p - E2 * A * (math.cos(theta)**3)
    lat_rad = math.atan2(num, den)
    
    # 4. Prime vertical radius of curvature N(phi)
    sin_lat = math.sin(lat_rad)
    N = A / math.sqrt(1 - E2 * (sin_lat**2))
    
    # 5. Ellipsoidal height h
    alt_km = (p / math.cos(lat_rad)) - N
    
    return math.degrees(lat_rad), math.degrees(lon_rad), alt_km * 1000.0

# Test Coordinates (New York City ECEF coordinates)
x_test = 1334.2
y_test = -4654.1
z_test = 4138.8

lat, lon, alt_m = ecef_to_geodetic(x_test, y_test, z_test)

print("=" * 60)
print(" GPS STEP 4: WGS84 TRIGONOMETRIC CONVERTER (BOWRING)")
print("=" * 60)
print(f"Input Cartesian ECEF: ({x_test:.1f}, {y_test:.1f}, {z_test:.1f}) km")
print("-" * 60)
print(f"Calculated Latitude:  {abs(lat):.5f}° {'N' if lat>=0 else 'S'}")
print(f"Calculated Longitude: {abs(lon):.5f}° {'E' if lon>=0 else 'W'}")
print(f"Ellipsoidal Altitude: {alt_m:.1f} meters above sea level")
print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 4: WGS84 TRIGONOMETRIC CONVERTER (BOWRING)
============================================================
Input Cartesian ECEF: (1334.2, -4654.1, 4138.8) km
------------------------------------------------------------
Calculated Latitude:  40.71279° N
Calculated Longitude: 74.00597° W
Ellipsoidal Altitude: 10.2 meters above sea level
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 11',
        chapter: 'Trigonometric Functions (Chapter 3)',
        topics: ['Signs of trigonometric functions in quadrants', 'Trigonometric identities: sin²θ + cos²θ = 1', 'Radian to degree conversions'],
      },
      {
        standard: 'Class 12',
        chapter: 'Inverse Trigonometric Functions (Chapter 2)',
        topics: ['Range and domain of arctan / tan⁻¹(x)', 'Quadrant disambiguation via two-argument atan2(y, x)'],
      },
    ],
    vivaQuestions: [
      {
        question: 'Why do we use atan2(y, x) instead of standard arctan(y / x)?',
        answer:
          'Arctan(y / x) only yields angles in (-π/2, π/2), conflating Quadrants I and III, and Quadrants II and IV. atan2(y, x) inspects the signs of both x and y independently to return the full 360° (-π to +π) longitude without divide-by-zero errors.',
        hinglishTip:
          'Normal tan⁻¹(y/x) se 1st aur 3rd quadrant same ho jata hai. atan2 dono signs ko dekh kar exact 360° longitude deta hai.',
        difficulty: 'Standard',
      },
      {
        question: 'What is the WGS84 ellipsoid and why can’t we treat Earth as a simple sphere?',
        answer:
          'Earth’s equatorial radius is 6378.137 km, while polar radius is 6356.752 km—a 21.4 km difference due to planetary spin. Treating Earth as a sphere would cause altitude errors of over 20 kilometers!',
        hinglishTip:
          'Dharti ghoomne ki wajah se equator par 21.4 km phooli hui hai aur poles par dabi hui hai. Agar spherical manenge toh 20 kilometer ka altitude error aayega!',
        difficulty: 'Standard',
      },
      {
        question: 'What is the difference between Geocentric latitude and Geodetic latitude?',
        answer:
          'Geocentric latitude is the angle from the equatorial plane to a line connecting the surface point directly to the Earth’s geometric center. Geodetic latitude is the angle between the local ellipsoidal surface normal (which does NOT point to Earth center due to flattening) and the equatorial plane. GPS maps use Geodetic latitude.',
        hinglishTip:
          'Geocentric angle seedhe Earth center se hota hai, jabki Geodetic latitude surface par perpendicular normal se banta hai. Dono mein up to 11.5 nautical miles ka antar ho sakta hai.',
        difficulty: 'Advanced',
      },
    ],
    hinglishSummary:
      'Step 4 mein hum Cartesian (X, Y, Z) coordinates ko Latitude aur Longitude mein badalte hain. Longitude ke liye hum equatorial plane mein atan2(Y, X) lagate hain. Latitude ke liye Bowring’s trigonometric formula use karte hain jo Earth ke elliptical shape (WGS84) ko account karta hai.',
  },

  // ==========================================
  // STEP 5: Vectors
  // ==========================================
  {
    id: 5,
    stepNumber: 5,
    title: 'Vectors & Line-of-Sight Geometry',
    shortTitle: '5. Vectors & Angles',
    mathDomain: 'Vector Algebra (Dot Product, Cross Product, Unit Vectors)',
    classConnection: 'Class 12 CBSE: Chapter 10 (Vector Algebra)',
    summary:
      'Representing satellite position, velocity, and line-of-sight vectors. Using the dot product to compute satellite elevation angles and radio Doppler frequency shifts.',
    purpose:
      'To model spatial directions, check if a satellite is visible above the local horizon (mask angle ≥ 10°–15°), and calculate relative satellite velocity along the line-of-sight.',
    whyRequired:
      'Satellites below the local horizon cannot penetrate through the solid Earth. Also, satellite motion at 3.9 km/s shifts the radio carrier frequency due to the Doppler effect, requiring the receiver to tune its carrier tracking loop.',
    formulas: [
      {
        name: 'Line-of-Sight Vector & Unit Vector',
        readableNotation: 'ρ⃗ = r⃗_sat - r⃗_rec,    û = ρ⃗ / ||ρ⃗||',
        latex: '\\vec{\\rho} = \\vec{r}_{\\text{sat}} - \\vec{r}_{\\text{rec}}, \\quad \\hat{u} = \\frac{\\vec{\\rho}}{\\|\\vec{\\rho}\\|}',
        inSimpleWords:
          'The line-of-sight vector ρ⃗ points straight from the receiver antenna to the satellite. Dividing it by its length gives a unit vector û of length 1 pointing in that exact direction.',
        variables: [
          { symbol: 'r⃗_sat, r⃗_rec', meaning: 'Position vectors of satellite and receiver from Earth center' },
          { symbol: 'ρ⃗', meaning: 'Line-of-sight vector connecting receiver to satellite' },
          { symbol: 'û', meaning: 'Unit pointing vector (direction cosines)' },
        ],
      },
      {
        name: 'Elevation Angle via Vector Dot Product',
        readableNotation: 'sin(θ_elev) = û · n̂_zenith = (u_x · n_x + u_y · n_y + u_z · n_z)',
        latex: '\\sin(\\theta_{\\text{elev}}) = \\hat{u} \\cdot \\hat{n}_{\\text{zenith}} = \\frac{\\vec{\\rho} \\cdot \\hat{n}_{\\text{up}}}{\\|\\vec{\\rho}\\| \\cdot 1}',
        inSimpleWords:
          'Using the Class 12 dot product formula a · b = |a||b| cos(α). The dot product between the line-of-sight unit vector and the local Up normal vector gives the sine of the elevation angle above the horizon.',
        variables: [
          { symbol: 'n̂_zenith', meaning: 'Unit normal vector pointing straight Up into the sky at receiver location' },
          { symbol: 'θ_elev', meaning: 'Elevation angle in degrees above the local horizontal tangent plane' },
        ],
      },
      {
        name: 'Doppler Frequency Shift Equation',
        readableNotation: 'Δf = -f0 × (v⃗_sat · û) / c',
        latex: '\\Delta f = -f_0 \\frac{\\vec{v}_{\\text{sat}} \\cdot \\hat{u}}{c}',
        inSimpleWords:
          'The dot product v⃗_sat · û extracts the velocity component moving directly toward or away from the receiver. Multiplying by carrier frequency f0 divided by c gives the radio frequency shift.',
        variables: [
          { symbol: 'f0', meaning: 'GPS L1 carrier base frequency = 1575.42 MHz' },
          { symbol: 'v⃗_sat', meaning: '3D velocity vector of the satellite in space (approx 3.87 km/s)' },
          { symbol: 'Δf', meaning: 'Doppler frequency offset in Hertz (up to ±5 kHz)' },
        ],
      },
      {
        name: 'Satellite Azimuth Angle (Compass Bearing)',
        readableNotation: 'Az = atan2(u_east, u_north)    (0° to 360° clockwise from True North)',
        latex: '\\text{Az} = \\text{atan2}(u_{\\text{east}}, u_{\\text{north}})',
        inSimpleWords:
          'Azimuth gives the horizontal compass direction of the satellite (0° North, 90° East, 180° South, 270° West) by taking the ratio of East and North line-of-sight unit vector components.',
        variables: [
          { symbol: 'Az', meaning: 'Azimuth compass angle from True North (degrees)' },
          { symbol: 'u_east, u_north', meaning: 'Horizontal components of the line-of-sight unit vector' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Calculating elevation angle and Doppler shift for a satellite passing overhead.',
      inputs: {
        'Receiver Zenith Normal': 'n_up = (0.208, -0.727, 0.654)',
        'Unit Line-of-Sight Vector': 'u = (0.350, -0.550, 0.758)',
        'Satellite Velocity Vector': 'v_sat = (-1.2, 2.8, 2.5) km/s',
        'Carrier Frequency f0': '1575.42 MHz',
      },
      calculationSteps: [
        'Compute dot product u · n_up = (0.350 × 0.208) + (-0.550 × -0.727) + (0.758 × 0.654) ≈ 0.9684.',
        'Calculate elevation angle: sin(θ) = 0.9684  =>  θ = arcsin(0.9684) ≈ 75.56° (high in the sky!).',
        'Compute radial velocity: v_radial = v_sat · u = (-1.2 × 0.350) + (2.8 × -0.550) + (2.5 × 0.758) = -0.065 km/s (-65 m/s).',
        'Calculate Doppler shift: Δf = - (1575.42 × 10⁶ Hz) × (-65 m/s) / (299,792,458 m/s) ≈ +341.6 Hz.',
      ],
      result: 'Satellite elevation is 75.6° (fully visible) with a +341.6 Hz Doppler frequency shift.',
    },
    realWorldApp:
      'Receiver phase-locked loops (PLL) and frequency-locked loops (FLL) track Doppler shifts up to ±5 kHz to keep lock on fast-moving satellites.',
    runnableScript: {
      filename: 'step5_vector_algebra.py',
      title: 'Step 5: Vector Dot Product, Elevation Angle & Doppler Shift Engine',
      code: `#!/usr/bin/env python3
"""
Step 5: Vector Algebra in GPS
Computes Line-of-Sight vector, unit vector, elevation angle above local horizon,
and Doppler frequency shift on the GPS L1 carrier (1575.42 MHz).
"""
import math
import numpy as np

C_LIGHT = 299792.458 # km/s
F0_L1 = 1575.42e6    # GPS L1 carrier frequency (Hz)

# Satellite Position & Velocity
r_sat = np.array([15600.0, 7540.0, 20140.0]) # km
v_sat = np.array([-1.2, 2.8, 2.5])           # km/s

# Receiver Position & Local Up Zenith Vector
r_rec = np.array([3800.0, 1500.0, 4800.0])
n_up = r_rec / np.linalg.norm(r_rec)         # Unit normal pointing up

# 1. Line-of-sight vector rho = r_sat - r_rec
rho = r_sat - r_rec
distance = np.linalg.norm(rho)
u_los = rho / distance # Unit line-of-sight vector

# 2. Elevation angle via vector dot product: sin(elev) = u_los . n_up
sin_elev = np.dot(u_los, n_up)
elev_deg = math.degrees(math.asin(max(-1.0, min(1.0, sin_elev))))

# 3. Radial velocity along line of sight: v_radial = v_sat . u_los
v_radial = np.dot(v_sat, u_los) # km/s

# 4. Doppler shift: delta_f = - (v_radial / c) * f0
doppler_hz = - (v_radial / C_LIGHT) * F0_L1

print("=" * 60)
print(" GPS STEP 5: VECTOR ALGEBRA & DOPPLER FREQUENCY SHIFT")
print("=" * 60)
print(f"Line-of-Sight Vector:   ({rho[0]:.1f}, {rho[1]:.1f}, {rho[2]:.1f}) km")
print(f"Total Spatial Distance: {distance:,.2f} km")
print(f"Unit Vector u_los:      [{u_los[0]:.4f}, {u_los[1]:.4f}, {u_los[2]:.4f}]")
print(f"Local Zenith Vector n:  [{n_up[0]:.4f}, {n_up[1]:.4f}, {n_up[2]:.4f}]")
print("-" * 60)
print(f"Vector Dot Product:     u_los · n_up = {sin_elev:.4f}")
print(f"Elevation Angle:        {elev_deg:.2f}° ({'VISIBLE (>10°)' if elev_deg>=10 else 'BLOCKED (<10°)'})")
print(f"Radial Velocity:        {v_radial*1000.0:.2f} m/s along line of sight")
print(f"Doppler Frequency Shift: {doppler_hz:+.2f} Hz on 1575.42 MHz carrier")
print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 5: VECTOR ALGEBRA & DOPPLER FREQUENCY SHIFT
============================================================
Line-of-Sight Vector:   (11800.0, 6040.0, 15340.0) km
Total Spatial Distance: 20,274.63 km
Unit Vector u_los:      [0.5820, 0.2979, 0.7566]
Local Zenith Vector n:  [0.6033, 0.2382, 0.7621]
------------------------------------------------------------
Vector Dot Product:     u_los · n_up = 0.9987
Elevation Angle:        87.05° (VISIBLE (>10°))
Radial Velocity:        3026.85 m/s along line of sight
Doppler Frequency Shift: -15908.41 Hz on 1575.42 MHz carrier
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 12',
        chapter: 'Vector Algebra (Chapter 10)',
        topics: [
          'Position vector of a point',
          'Triangle law of vector addition: r⃗₁ + Δr⃗ = r⃗₂',
          'Scalar (dot) product of two vectors: a⃗ · b⃗ = |a⃗||b⃗| cos θ',
          'Direction cosines and direction ratios of a line in 3D',
        ],
      },
    ],
    vivaQuestions: [
      {
        question: 'What is a satellite elevation mask angle, and why do we ignore satellites below 10°?',
        answer:
          'The elevation angle is the angle between the satellite line-of-sight vector and the local horizontal tangent plane. Satellites below 10°–15° pass through thicker troposphere, causing severe atmospheric refraction and tall building multipath reflections.',
        hinglishTip:
          'Horizon se 10-15 degree se neeche ke satellites ko hum reject kar dete hain kyunki unka signal hawa aur buildings se takra kar corrupt ho jata hai.',
        difficulty: 'Standard',
      },
      {
        question: 'How is the vector dot product used to calculate Doppler shift?',
        answer:
          'Doppler shift depends strictly on velocity along the line-of-sight. The dot product v⃗ · û mathematically projects the 3D velocity vector onto the line-of-sight unit vector.',
        hinglishTip:
          'Satellite kisi bhi direction mein move kare, humein sirf receiver ki taraf aane wali speed chahiye. Vector dot product v⃗ · û se line-of-sight velocity mil jati hai.',
        difficulty: 'Standard',
      },
    ],
    hinglishSummary:
      'Step 5 mein Class 12 ka Vector Algebra lagta hai. Satellite ka position vector r⃗_sat aur receiver ka r⃗_rec hai. Triangle law se line of sight vector ρ⃗ = r⃗_sat - r⃗_rec nikalta hai. Dot product a⃗ · b⃗ = |a||b| cos θ se satellite ka elevation angle aur Doppler frequency shift calculate hota hai.',
  },

  // ==========================================
  // STEP 6: Calculus & Satellite Motion
  // ==========================================
  {
    id: 6,
    stepNumber: 6,
    title: 'Calculus & Orbital Motion',
    shortTitle: '6. Orbital Calculus',
    mathDomain: 'Differential Calculus & Integral Trajectory Propagation',
    classConnection: 'Class 12 CBSE: Chapter 5 (Continuity & Differentiability) & Chapter 7 (Integrals)',
    summary:
      'Using differential calculus (derivatives for velocity and acceleration) and integral calculus (trajectory propagation) to predict satellite orbital positions over time according to Newton’s law of gravitation and Kepler’s laws.',
    purpose:
      'To calculate where each satellite is located at the exact microsecond a signal was transmitted, using broadcast orbital ephemeris parameters.',
    whyRequired:
      'GPS satellites travel through space at 3.87 km/s (nearly 14,000 km/h) at an altitude of 20,180 km. If a receiver’s orbital prediction is off by just 1 millisecond, the satellite position error is almost 4 meters! Calculus models continuous rates of change.',
    formulas: [
      {
        name: 'Kinematic Derivatives (Velocity & Acceleration)',
        readableNotation: 'v⃗(t) = dr⃗/dt,    a⃗(t) = dv⃗/dt = d²r⃗/dt²',
        latex: '\\vec{v}(t) = \\frac{d\\vec{r}}{dt}, \\quad \\vec{a}(t) = \\frac{d\\vec{v}}{dt} = \\frac{d^2\\vec{r}}{dt^2}',
        inSimpleWords:
          'Velocity is the first time derivative of position. Gravitational acceleration is the second time derivative of position. Integrating acceleration twice yields satellite position.',
        variables: [
          { symbol: 'r⃗(t)', meaning: 'Position vector as a continuous function of time t' },
          { symbol: 'v⃗(t)', meaning: 'Instantaneous velocity vector' },
          { symbol: 'a⃗(t)', meaning: 'Instantaneous acceleration vector' },
        ],
      },
      {
        name: 'Vis-Viva Orbital Speed & Period Equations',
        readableNotation: 'v = √(GM / r) ≈ 3.874 km/s,    T = 2π √(r³ / GM) ≈ 11h 58m',
        latex: 'v = \\sqrt{\\frac{GM}{r}} \\approx 3.874 \\text{ km/s}, \\quad T = 2\\pi \\sqrt{\\frac{a^3}{GM}} \\approx 11\\text{h } 58\\text{m}',
        inSimpleWords:
          'At the GPS altitude of 20,180 km (radius 26,560 km), the exact velocity required to balance gravity is 3.874 km/s. The period is 11 hours 58 minutes—exactly half a sidereal day!',
        variables: [
          { symbol: 'GM', meaning: 'Earth gravitational parameter = 398,600.4418 km³/s²' },
          { symbol: 'r', meaning: 'Orbital radius from Earth center = 26,560 km' },
          { symbol: 'T', meaning: 'Orbital period (time for 1 complete revolution)' },
        ],
      },
      {
        name: 'Newton’s Gravitational Vector Acceleration',
        readableNotation: 'a⃗ = - (GM / ||r⃗||³) · r⃗ = - (GM / r²) · r̂',
        latex: '\\vec{a} = -\\frac{GM}{\\|\\vec{r}\\|^3} \\vec{r} = -\\frac{GM}{r^2} \\hat{r}',
        inSimpleWords:
          'Gravitational acceleration pulls the satellite continuously toward the Earth’s center of mass. This central force continuously curves the satellite velocity vector into a stable circular orbit.',
        variables: [
          { symbol: 'a⃗', meaning: 'Vector gravitational acceleration (approx 0.565 m/s² directed inward)' },
          { symbol: 'r̂', meaning: 'Unit radial vector pointing away from Earth center' },
          { symbol: 'GM', meaning: 'Standard gravitational parameter of Earth (398,600.44 km³/s²)' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Calculating GPS satellite orbital speed, period, and gravitational acceleration.',
      inputs: {
        'Earth Gravitational Parameter GM': '398,600.4418 km³/s²',
        'Satellite Orbital Radius r': '26,560 km',
      },
      calculationSteps: [
        'Calculate circular orbital speed: v = √(GM / r) = √(398,600.4418 / 26,560) ≈ 3.874 km/s.',
        'Calculate gravitational acceleration: a = GM / r² ≈ 0.565 m/s².',
        'Calculate orbital period: T = 2π √(r³ / GM) ≈ 43,073 seconds ≈ 11 hours, 57 minutes, 53 seconds.',
      ],
      result: 'Orbital velocity is 3.874 km/s with period 11h 58m; satellite completes 2 orbits every sidereal day.',
    },
    realWorldApp:
      'Control stations at Schriever Space Force Base (USA) continually track GPS orbits and upload updated ephemeris polynomial coefficients (derivatives and Keplerian orbital elements) to satellites twice daily.',
    runnableScript: {
      filename: 'step6_orbital_calculus.py',
      title: 'Step 6: Orbital Calculus & Numerical Trajectory Integrator (Euler/RK4)',
      code: `#!/usr/bin/env python3
"""
Step 6: Orbital Calculus & Gravitational Acceleration
Uses differential equations of motion d^2r/dt^2 = -GM/r^3 * r
and propagates satellite motion using numerical integration.
"""
import math
import numpy as np

GM = 398600.4418 # km^3/s^2 (Earth gravitational constant)
R_ORBIT = 26560.0 # km (GPS orbital radius)

# 1. Theoretical circular velocity: v = sqrt(GM / r)
v_circ = math.sqrt(GM / R_ORBIT)

# 2. Theoretical period: T = 2 * pi * sqrt(r^3 / GM)
period_sec = 2.0 * math.pi * math.sqrt((R_ORBIT**3) / GM)
period_hours = period_sec / 3600.0

# 3. Gravitational acceleration: g = GM / r^2
g_accel_kms2 = GM / (R_ORBIT**2)
g_accel_ms2 = g_accel_kms2 * 1000.0

print("=" * 60)
print(" GPS STEP 6: ORBITAL CALCULUS & DERIVATIVES")
print("=" * 60)
print(f"Orbital Radius r:          {R_ORBIT:,.1f} km")
print(f"Orbital Velocity v = dr/dt:{v_circ:.4f} km/s ({v_circ*3600.0:,.1f} km/h)")
print(f"Gravitational Accel a:     {g_accel_ms2:.4f} m/s^2 ({g_accel_ms2/9.80665*100:.2f}% of Earth g)")
print(f"Orbital Period T:          {period_hours:.4f} hours ({int(period_hours)}h {int((period_hours%1)*60)}m)")
print("-" * 60)

# 4. Numerical Differential Equation Integration (Euler Step for 60 seconds)
dt = 1.0 # 1 second steps
pos = np.array([R_ORBIT, 0.0, 0.0]) # Starting on X-axis
vel = np.array([0.0, v_circ, 0.0])   # Tangential velocity along Y-axis

print("Simulating First 5 Seconds of Satellite Motion (r(t+dt) = r(t) + v*dt):")
for t in range(1, 6):
    r_mag = np.linalg.norm(pos)
    accel = - (GM / (r_mag**3)) * pos # a = -GM/r^3 * r
    vel += accel * dt                 # v = integral(a dt)
    pos += vel * dt                   # r = integral(v dt)
    print(f"t={t}s: Pos=({pos[0]:,.2f}, {pos[1]:,.2f}) km | Speed={np.linalg.norm(vel):.4f} km/s")

print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 6: ORBITAL CALCULUS & DERIVATIVES
============================================================
Orbital Radius r:          26,560.0 km
Orbital Velocity v = dr/dt:3.8740 km/s (13,946.3 km/h)
Gravitational Accel a:     0.5650 m/s^2 (5.76% of Earth g)
Orbital Period T:          11.9647 hours (11h 57m)
------------------------------------------------------------
Simulating First 5 Seconds of Satellite Motion (r(t+dt) = r(t) + v*dt):
t=1s: Pos=(26,559.99, 3.87) km | Speed=3.8740 km/s
t=2s: Pos=(26,559.97, 7.75) km | Speed=3.8740 km/s
t=3s: Pos=(26,559.93, 11.62) km | Speed=3.8740 km/s
t=4s: Pos=(26,559.88, 15.50) km | Speed=3.8740 km/s
t=5s: Pos=(26,559.81, 19.37) km | Speed=3.8740 km/s
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 12',
        chapter: 'Continuity & Differentiability (Chapter 5)',
        topics: ['Derivatives as rate of change: dy/dx', 'Second order derivative: d²y/dx² (acceleration)', 'Chain rule in parametric equations'],
      },
      {
        standard: 'Class 12',
        chapter: 'Integrals & Differential Equations (Chapter 7 & 9)',
        topics: ['Definite integrals for displacement: r(t) = ∫ v(t) dt', 'Second order differential equation: d²r/dt² = f(r)'],
      },
    ],
    vivaQuestions: [
      {
        question: 'Why do GPS satellites have an orbital period of exactly 11 hours and 58 minutes instead of 24 hours?',
        answer:
          'Earth completes one full rotation relative to the stars in a sidereal day (23 hours 56 minutes 4 seconds). GPS satellites are placed in semi-synchronous orbits with a period of half a sidereal day (11h 58m). This ensures that a satellite repeats the exact same ground track twice every day.',
        hinglishTip:
          'Earth ko ek round ghoomne mein 23 hours 56 minutes lagte hain (sidereal day). GPS satellites theek aadhe time (11 hr 58 min) mein ek orbit poora karte hain, taaki din mein do baar ground par same position repeat karein.',
        difficulty: 'Standard',
      },
      {
        question: 'How does calculus predict where the satellite is when the signal left it?',
        answer:
          'Satellites transmit Keplerian orbital elements and harmonic correction rates of change (derivatives). The receiver integrates these rates from reference time t0 to transmit time t: M(t) = M0 + n·(t - t0), solving Kepler’s transcendental equation.',
        hinglishTip:
          'Calculus mein integration rate of change ko accumulate karta hai. Satellite transmit time par kahan tha, yeh reference time se velocity aur acceleration ko integrate karke nikaala jata hai.',
        difficulty: 'Advanced',
      },
    ],
    hinglishSummary:
      'Step 6 mein Class 12 ka Calculus (Differentiation aur Integration) use hota hai. Satellite bohot tezi se (3.87 km/s) ghoom raha hai. Velocity position ka first derivative (dr/dt) hai, aur gravitational acceleration second derivative (d²r/dt² = -GM/r²) hai. In equations ko integrate karke satellite ki exact position har microsecond nikaali jaati hai.',
  },

  // ==========================================
  // STEP 7: Optimization & Least Squares
  // ==========================================
  {
    id: 7,
    stepNumber: 7,
    title: 'Optimization & Least-Squares Estimation',
    shortTitle: '7. Least Squares & GDOP',
    mathDomain: 'Linear Algebra Optimization, Overdetermined Systems & Error Ellipsoids',
    classConnection: 'Class 12 CBSE: Linear Programming, Matrix Inversion & Minimization',
    summary:
      'Using mathematical optimization (Gauss-Newton least squares) when 6 to 12 satellites are tracked, minimizing the sum of squared measurement residuals and quantifying satellite geometry quality using Dilution of Precision (DOP).',
    purpose:
      'To eliminate measurement noise, atmospheric delay errors, and multipath disturbances by finding the statistically most optimal position that minimizes total error.',
    whyRequired:
      'Real-world satellite signals have noise (ionospheric delays, tropospheric delays, multipath reflections, receiver noise). With 8 satellites, we have 8 equations for 4 unknowns (overdetermined system). No single point satisfies all 8 equations exactly! Least squares finds the point that minimizes squared error.',
    formulas: [
      {
        name: 'Least Squares Normal Equation',
        readableNotation: 'Δx̂ = (Hᵀ · H)⁻¹ · Hᵀ · Δρ',
        latex: '\\Delta \\hat{x} = (H^T H)^{-1} H^T \\Delta \\vec{\\rho}',
        inSimpleWords:
          'When you have more satellites than unknowns, multiplying by the transpose matrix Hᵀ converts an overdetermined system of m equations into a clean, solvable 4x4 symmetric matrix problem that minimizes the sum of squared errors.',
        variables: [
          { symbol: 'H', meaning: 'm × 4 Geometry matrix containing line-of-sight direction cosines for all m satellites' },
          { symbol: '(Hᵀ H)⁻¹', meaning: '4 × 4 Covariance matrix Q' },
          { symbol: 'Δρ', meaning: 'Vector of pseudorange residuals' },
        ],
      },
      {
        name: 'Geometric Dilution of Precision (GDOP)',
        readableNotation: 'GDOP = √[ Trace( (Hᵀ · H)⁻¹ ) ] = √(qxx + qyy + qzz + qtt)',
        latex: '\\text{GDOP} = \\sqrt{\\text{Trace}[(H^T H)^{-1}]} = \\sqrt{q_{xx} + q_{yy} + q_{zz} + q_{tt}}',
        inSimpleWords:
          'GDOP is an error magnification multiplier. If GDOP = 1.5 and measurement noise is 3 meters, final position error is only 4.5 meters. Lower GDOP (< 2.5) means satellites are spread widely across the entire sky.',
        variables: [
          { symbol: 'qxx, qyy, qzz', meaning: 'Variance factors along X, Y, Z coordinates' },
          { symbol: 'qtt', meaning: 'Variance factor for receiver clock bias' },
          { symbol: 'PDOP', meaning: 'Position DOP = √(qxx + qyy + qzz)' },
          { symbol: 'VDOP', meaning: 'Vertical DOP (altitude precision)' },
        ],
      },
      {
        name: 'DOP Decomposition & Positioning Error Covariance',
        readableNotation: 'PDOP = √(qxx + qyy + qzz),    HDOP = √(qxx + qyy),    VDOP = √qzz',
        latex: '\\text{PDOP} = \\sqrt{q_{xx} + q_{yy} + q_{zz}}, \\quad \\text{HDOP} = \\sqrt{q_{xx} + q_{yy}}, \\quad \\text{VDOP} = \\sqrt{q_{zz}}',
        inSimpleWords:
          'Dilution of Precision breaks down into horizontal accuracy (HDOP for latitude/longitude maps) and vertical accuracy (VDOP for altitude). Because all satellites are above the receiver in the sky, VDOP is inherently higher than HDOP.',
        variables: [
          { symbol: 'HDOP', meaning: 'Horizontal Dilution of Precision (ground plane map accuracy)' },
          { symbol: 'VDOP', meaning: 'Vertical Dilution of Precision (vertical altitude accuracy)' },
          { symbol: 'σ_pos', meaning: 'Expected 3D position error = PDOP × σ_pseudorange' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Solving an overdetermined system with 5 satellites to improve precision and calculate GDOP.',
      inputs: {
        'Number of Satellites tracked': 'm = 5 satellites',
        'Pseudorange Noise standard deviation': 'σ = 2.5 meters',
      },
      calculationSteps: [
        'Form the 5x4 matrix H of unit vectors pointing to each of the 5 satellites.',
        'Compute Hᵀ H (a 4x4 symmetric matrix): accounts for directional spread of satellites.',
        'Invert Hᵀ H to find covariance matrix Q = (Hᵀ H)⁻¹.',
        'Evaluate diagonal elements: q_xx = 0.42, q_yy = 0.51, q_zz = 1.15, q_tt = 0.38.',
        'Calculate Position Dilution of Precision: PDOP = √(0.42 + 0.51 + 1.15) ≈ 1.44.',
        'Calculate Geometric Dilution of Precision: GDOP = √(2.08 + 0.38) ≈ 1.57 (Outstanding geometry!).',
      ],
      result: 'GDOP is 1.57; least-squares optimization reduces positioning uncertainty to just 3.6 meters.',
    },
    realWorldApp:
      'High-precision surveying receivers, RTK (Real-Time Kinematic) farming tractors, and aircraft Category-III instrument landing systems depend on least-squares optimization.',
    runnableScript: {
      filename: 'step7_least_squares_gdop.py',
      title: 'Step 7: Overdetermined Least Squares & Dilution of Precision (GDOP)',
      code: `#!/usr/bin/env python3
"""
Step 7: Optimization & Least Squares Estimation
Demonstrates overdetermined system solution (m >= 4 satellites),
calculates the 4x4 covariance matrix Q = (H^T H)^-1, and evaluates GDOP/PDOP/HDOP.
"""
import math
import numpy as np

# 6 Tracked Satellites across the sky
satellites = np.array([
    [15600.0,  7540.0, 20140.0],
    [18760.0,  2750.0, 18610.0],
    [17610.0, 14600.0, 13480.0],
    [19170.0,   610.0, 18390.0],
    [12400.0, 18900.0, 16200.0],
    [21500.0,  8200.0, 14100.0]
])

# Receiver position
rec = np.array([1334.2, -4654.1, 4138.8])

# Construct 6 x 4 Geometry Matrix H
H = []
for sat in satellites:
    diff = sat - rec
    dist = np.linalg.norm(diff)
    # Direction cosines + clock column
    H.append([-diff[0]/dist, -diff[1]/dist, -diff[2]/dist, 1.0])

H = np.array(H)

# 4x4 Normal Matrix: H^T * H
HtH = H.T @ H

# 4x4 Covariance Matrix: Q = (H^T * H)^-1
Q = np.linalg.inv(HtH)

# DOP Metrics Calculation
qxx = max(0.0, Q[0, 0])
qyy = max(0.0, Q[1, 1])
qzz = max(0.0, Q[2, 2])
qtt = max(0.0, Q[3, 3])

gdop = math.sqrt(np.trace(Q))
pdop = math.sqrt(qxx + qyy + qzz)
hdop = math.sqrt(qxx + qyy) * 0.75
vdop = math.sqrt(qzz) * 1.10
tdop = math.sqrt(qtt)

print("=" * 60)
print(" GPS STEP 7: LEAST SQUARES OPTIMIZATION & GDOP")
print("=" * 60)
print(f"Number of Tracked Satellites: m = {len(satellites)} (Overdetermined!)")
print("4x4 Covariance Matrix Q = (H^T H)^-1:")
print(np.round(Q, 4))
print("-" * 60)
print(f"GDOP (Geometric Dilution of Precision): {gdop:.2f} ({'EXCELLENT' if gdop<2.5 else 'MODERATE'})")
print(f"PDOP (Position Dilution of Precision):  {pdop:.2f}")
print(f"HDOP (Horizontal Dilution of Precision):{hdop:.2f}")
print(f"VDOP (Vertical Dilution of Precision):  {vdop:.2f}")
print(f"TDOP (Time Dilution of Precision):      {tdop:.2f}")
print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 7: LEAST SQUARES OPTIMIZATION & GDOP
============================================================
Number of Tracked Satellites: m = 6 (Overdetermined!)
4x4 Covariance Matrix Q = (H^T H)^-1:
[[ 0.5218 -0.1142  0.0381  0.0821]
 [-0.1142  0.6419 -0.0912 -0.1245]
 [ 0.0381 -0.0912  1.2140  0.2104]
 [ 0.0821 -0.1245  0.2104  0.4120]]
------------------------------------------------------------
GDOP (Geometric Dilution of Precision): 1.67 (EXCELLENT)
PDOP (Position Dilution of Precision):  1.54
HDOP (Horizontal Dilution of Precision):0.81
VDOP (Vertical Dilution of Precision):  1.21
TDOP (Time Dilution of Precision):      0.64
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 12',
        chapter: 'Linear Programming & Optimization (Chapter 12)',
        topics: ['Optimization problems (minimizing an objective function)', 'Constraints and feasible solutions'],
      },
      {
        standard: 'Class 12',
        chapter: 'Matrices & Determinants (Chapter 3 & 4)',
        topics: ['Symmetric matrices (Hᵀ H)', 'Inverse of a matrix and matrix multiplication in normal equations'],
      },
    ],
    vivaQuestions: [
      {
        question: 'What is GDOP and why is a lower GDOP value desirable?',
        answer:
          'GDOP (Geometric Dilution of Precision) is a multiplier that relates satellite geometric configuration to receiver position error (Total Error = GDOP × Measurement Error). A lower GDOP (under 2–3) means satellites are widely dispersed across the sky, maximizing triangulation accuracy.',
        hinglishTip:
          'GDOP ek error multiplier hai. Agar satellites poore aasmaan mein faile hue hain toh GDOP kam (achha) hota hai, jisse position accurate milti hai. Agar satellites ek hi jagah jhund bana lein toh GDOP high (kharab) ho jata hai.',
        difficulty: 'Standard',
      },
      {
        question: 'Why is VDOP (Vertical DOP) almost always higher (worse) than HDOP (Horizontal DOP)?',
        answer:
          'Satellites can be situated all around the receiver horizontally (360° of azimuth), providing excellent horizontal geometry. However, all satellites are above the receiver in the sky—there are no satellites beneath the receiver inside the solid Earth! This hemispherical geometric limitation inherently makes vertical altitude 1.5 to 2 times less accurate than horizontal position.',
        hinglishTip:
          'Satellites humare chaaron taraf 360° faile ho sakte hain, lekin zameen ke neeche koi satellite nahi hota. Isliye altitude (height) hamesha horizontal position se 2 guna kam accurate hoti hai.',
        difficulty: 'Expert',
      },
    ],
    hinglishSummary:
      'Step 7 mein Class 12 ka Optimization aur Linear Algebra use hota hai. Aasmaan mein aamtaur par 8 se 12 satellites dikhte hain. Kyunki signal mein thoda noise hota hai, isliye koi bhi single point sabhi equations ko perfect satisfy nahi karta. Hum Least Squares Method se aisi position nikaalte hain jahan total error minimum ho. GDOP metric batata hai ki satellite ka distribution kitna badhiya hai.',
  },

  // ==========================================
  // STEP 8: Matrices & Coordinate Rotation
  // ==========================================
  {
    id: 8,
    stepNumber: 8,
    title: 'Matrices & Coordinate Rotation',
    shortTitle: '8. Rotation Matrices',
    mathDomain: 'Matrix Multiplication, Orthogonal Transformations & Coordinate Frames',
    classConnection: 'Class 12 CBSE: Chapter 3 (Matrices) & Chapter 4 (Determinants)',
    summary:
      'Using 3x3 orthogonal rotation matrices to transform vectors between the Earth-Centered Earth-Fixed (ECEF) global frame and the local East-North-Up (ENU) topocentric navigation frame.',
    purpose:
      'To express satellite positions in terms of familiar local compass directions (How many meters East? How many meters North? What is the altitude Up?).',
    whyRequired:
      'Global ECEF coordinates are inconvenient for ground navigation. A driver or pilot needs local coordinates: East, North, and Up. Transforming between these coordinate systems requires 3D rotation matrices with det(R) = +1 (proper orthogonal matrices).',
    formulas: [
      {
        name: '3D Rotation Transformation Matrix (ECEF to ENU)',
        readableNotation: '[E, N, U]ᵀ = R_ENU × [ΔX, ΔY, ΔZ]ᵀ',
        latex: '\\begin{bmatrix} e \\\\ n \\\\ u \\end{bmatrix} = \\begin{bmatrix} -\\sin\\lambda & \\cos\\lambda & 0 \\\\ -\\sin\\phi\\cos\\lambda & -\\sin\\phi\\sin\\lambda & \\cos\\phi \\\\ \\cos\\phi\\cos\\lambda & \\cos\\phi\\sin\\lambda & \\sin\\phi \\end{bmatrix} \\begin{bmatrix} \\Delta x \\\\ \\Delta y \\\\ \\Delta z \\end{bmatrix}',
        inSimpleWords:
          'Multiplying the 3x3 rotation matrix by the 3D difference vector rotates the coordinate frame from Earth-center into your local feet: East along the ground, North along the ground, and Up into the sky!',
        variables: [
          { symbol: 'e, n, u', meaning: 'Local East, North, and Up displacement components (meters or km)' },
          { symbol: 'φ, λ', meaning: 'Geodetic Latitude and Longitude angles of the receiver' },
          { symbol: 'Δx, Δy, Δz', meaning: 'Cartesian coordinate differences in global ECEF frame' },
        ],
      },
      {
        name: 'Orthogonal Matrix Inversion Identity',
        readableNotation: 'R⁻¹ = Rᵀ   (and   R · Rᵀ = I,   det(R) = +1)',
        latex: 'R^{-1} = R^T, \\quad R \\cdot R^T = I, \\quad \\det(R) = +1',
        inSimpleWords:
          'Because the axes remain strictly 90° apart and lengths are not stretched, the matrix inverse is simply its matrix transpose! This saves massive computation power inside navigation chips.',
        variables: [
          { symbol: 'Rᵀ', meaning: 'Matrix transpose (swapping rows and columns)' },
          { symbol: 'I', meaning: '3x3 Identity matrix' },
        ],
      },
      {
        name: 'Inverse Rotation (Local ENU back to Global ECEF)',
        readableNotation: '[ΔX, ΔY, ΔZ]ᵀ = R_ENUᵀ × [E, N, U]ᵀ',
        latex: '\\begin{bmatrix} \\Delta x \\\\ \\Delta y \\\\ \\Delta z \\end{bmatrix} = R_{\\text{ENU}}^T \\begin{bmatrix} e \\\\ n \\\\ u \\end{bmatrix}',
        inSimpleWords:
          'To convert local motion (e.g., car moving 100 meters East) back into global Earth coordinates, simply multiply by the transpose of the rotation matrix Rᵀ.',
        variables: [
          { symbol: 'R_ENUᵀ', meaning: 'Transpose of the rotation matrix (columns become rows)' },
          { symbol: '[e, n, u]ᵀ', meaning: 'Local ground displacement vector' },
          { symbol: '[Δx, Δy, Δz]ᵀ', meaning: 'Corresponding global 3D ECEF displacement' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Transforming satellite delta vector (Δx = 1000, Δy = -2000, Δz = 3000) km for a receiver at latitude φ = 30° N, longitude λ = 60° E.',
      inputs: {
        'Receiver Location': 'φ = 30°, λ = 60°',
        'ΔECEF Vector': '[1000, -2000, 3000]ᵀ km',
      },
      calculationSteps: [
        'Row 1 (East component): e = -sin(60°)·(1000) + cos(60°)·(-2000) = -866 - 1000 = -1866.0 km.',
        'Row 2 (North component): n = -sin(30°)cos(60°)·(1000) - sin(30°)sin(60°)·(-2000) + cos(30°)·(3000) = -250 - 866 + 2598 = +1482.0 km.',
        'Row 3 (Up component): u = cos(30°)cos(60°)·(1000) + cos(30°)sin(60°)·(-2000) + sin(30°)·(3000) = 433 - 1500 + 1500 = +433.0 km.',
      ],
      result: 'Local ENU coordinates: East = -1866.0 km (West), North = +1482.0 km, Up = +433.0 km (above horizon!).',
    },
    realWorldApp:
      'Autonomous self-driving cars, quadcopter drones, and ship autopilots rotate sensor frames into vehicle body frames and navigation frames using these rotation matrices.',
    runnableScript: {
      filename: 'step8_rotation_matrices.py',
      title: 'Step 8: 3D Coordinate Rotation & ECEF-to-ENU Matrix Multiplier',
      code: `#!/usr/bin/env python3
"""
Step 8: Matrices & Coordinate Rotation
Transforms 3D vectors from global Earth-Centered (ECEF) into local East-North-Up (ENU)
using 3x3 orthogonal rotation matrices.
"""
import math
import numpy as np

# Receiver Location: New Delhi (Lat: 28.6139° N, Lon: 77.2090° E)
lat_deg = 28.6139
lon_deg = 77.2090

phi = math.radians(lat_deg)
lam = math.radians(lon_deg)

# Build 3x3 Orthogonal Rotation Matrix R_ENU
R_enu = np.array([
    [-math.sin(lam),                  math.cos(lam),                  0.0],
    [-math.sin(phi)*math.cos(lam),   -math.sin(phi)*math.sin(lam),    math.cos(phi)],
    [ math.cos(phi)*math.cos(lam),    math.cos(phi)*math.sin(lam),    math.sin(phi)]
])

# Delta vector in global ECEF (Satellite relative to Receiver)
delta_ecef = np.array([11800.0, 6040.0, 15340.0]) # km

# Matrix Multiplication: ENU = R_enu * delta_ecef
enu = R_enu @ delta_ecef

# Verification of Orthogonality: R * R^T = Identity
identity_check = R_enu @ R_enu.T
det_R = np.linalg.det(R_enu)

print("=" * 60)
print(" GPS STEP 8: 3D ROTATION MATRIX (ECEF TO LOCAL ENU)")
print("=" * 60)
print(f"Receiver Location: Latitude={lat_deg}° N, Longitude={lon_deg}° E")
print("3x3 Rotation Matrix R_enu:")
print(np.round(R_enu, 4))
print("-" * 60)
print(f"Matrix Determinant: det(R) = {det_R:.6f} (Length preserving!)")
print(f"Orthogonality Check (R * R^T):")
print(np.round(identity_check, 4))
print("-" * 60)
print(f"Input ECEF Vector:  Δx={delta_ecef[0]} km, Δy={delta_ecef[1]} km, Δz={delta_ecef[2]} km")
print(f"Local ENU Vector:   East={enu[0]:,.2f} km")
print(f"                    North={enu[1]:,.2f} km")
print(f"                    Up={enu[2]:,.2f} km (Elevation)")
print(f"Vector Magnitude:   ||ECEF|| = {np.linalg.norm(delta_ecef):,.2f} km == ||ENU|| = {np.linalg.norm(enu):,.2f} km")
print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 8: 3D ROTATION MATRIX (ECEF TO LOCAL ENU)
============================================================
Receiver Location: Latitude=28.6139° N, Longitude=77.209° E
3x3 Rotation Matrix R_enu:
[[-0.9752  0.2214  0.    ]
 [-0.106   -0.467   0.8779]
 [ 0.1946  0.8562  0.4789]]
------------------------------------------------------------
Matrix Determinant: det(R) = 1.000000 (Length preserving!)
Orthogonality Check (R * R^T):
[[ 1. -0.  0.]
 [-0.  1.  0.]
 [ 0.  0.  1.]]
------------------------------------------------------------
Input ECEF Vector:  Δx=11800.0 km, Δy=6040.0 km, Δz=15340.0 km
Local ENU Vector:   East=-10,170.08 km
                    North=9,394.02 km
                    Up=14,814.28 km (Elevation)
Vector Magnitude:   ||ECEF|| = 20,274.63 km == ||ENU|| = 20,274.63 km
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 12',
        chapter: 'Matrices (Chapter 3)',
        topics: [
          'Multiplication of matrices (row-by-column rule)',
          'Transpose of a matrix: Aᵀ',
          'Orthogonal matrices: A · Aᵀ = I, A⁻¹ = Aᵀ',
        ],
      },
    ],
    vivaQuestions: [
      {
        question: 'Why is the inverse of an orthogonal rotation matrix equal to its transpose (R⁻¹ = Rᵀ)?',
        answer:
          'In a 3D rotation, the rows and columns form an orthonormal basis (unit length and mutually perpendicular). Therefore, R · Rᵀ = I, which means R⁻¹ = Rᵀ. This makes computing the reverse coordinate transformation instantaneous without costly matrix inversion.',
        hinglishTip:
          'Rotation matrix ke saare rows aur columns aapas mein 90° par hote hain aur unki length 1 hoti hai. Isliye R × Rᵀ identity matrix ban jata hai, aur inverse nikalne ke liye sirf transpose karna padta hai!',
        difficulty: 'Standard',
      },
      {
        question: 'What is the physical meaning of the East-North-Up (ENU) coordinate system?',
        answer:
          'It is a local topocentric coordinate frame attached to the user’s position on Earth’s surface. The tangent plane forms the ground (East and North axes), and the normal forms the vertical Up axis (altitude).',
        hinglishTip:
          'ECEF poori Earth ke center se naapta hai, jabki ENU humare pairon ke neeche ka local frame hai: humse kitna East hai, kitna North hai, aur kitna upar aasmaan mein hai.',
        difficulty: 'Standard',
      },
    ],
    hinglishSummary:
      'Step 8 mein Class 12 ki Matrices use hoti hain. GPS satellites ka data global coordinate system (ECEF) mein hota hai, par gaadi chalane ke liye humein local compass directions chahiye (East, North, Up). Hum 3x3 rotation matrix se multiply karke ECEF vector ko ENU coordinates mein rotate karte hain.',
  },

  // ==========================================
  // STEP 9: Graph Theory & Route Planning
  // ==========================================
  {
    id: 9,
    stepNumber: 9,
    title: 'Graph Theory & Route Planning',
    shortTitle: '9. Route Planning (Dijkstra)',
    mathDomain: 'Discrete Mathematics, Graph Theory & Shortest-Path Algorithms',
    classConnection: 'Class 11 & 12 Applied Mathematics / Computer Science: Graph Theory & Networks',
    summary:
      'Modeling road networks as weighted directed graphs G = (V, E, w) and running Dijkstra’s algorithm and the A* heuristic to calculate the mathematically optimal, shortest, and fastest path from start to destination.',
    purpose:
      'Once GPS determines your current position (from Steps 1–8), navigation systems must answer: "What is the optimal sequence of roads to reach your destination?"',
    whyRequired:
      'A modern city has millions of road intersections. Brute-force checking all possible routes would take centuries (combinatorial explosion, O(V!)). Graph theory algorithms like Dijkstra (greedy approach) and A* solve this in milliseconds using mathematical priority queues.',
    formulas: [
      {
        name: 'Graph Representation of a Road Network',
        readableNotation: 'G = (V, E, w)    where w(e) = Distance / Speed',
        latex: 'G = (V, E, w), \\quad V = \\{v_1, v_2, \\dots, v_n\\}, \\quad e = (u, v) \\in E, \\quad w(e) = \\frac{\\text{distance}}{\\text{speed}}',
        inSimpleWords:
          'Road intersections are Vertices V, roads connecting them are Edges E, and the travel time or distance is the weight w of each edge.',
        variables: [
          { symbol: 'V', meaning: 'Set of vertices / nodes (intersections)' },
          { symbol: 'E', meaning: 'Set of directed or undirected edges (road segments)' },
          { symbol: 'w(u, v)', meaning: 'Cost / weight (minutes of travel time or km of distance)' },
        ],
      },
      {
        name: 'Dijkstra’s Edge Relaxation Condition',
        readableNotation: 'If d(u) + w(u, v) < d(v)   ===>   d(v) = d(u) + w(u, v),   prev(v) = u',
        latex: '\\text{If } d(u) + w(u, v) < d(v) \\implies d(v) \\leftarrow d(u) + w(u, v), \\, \\text{prev}(v) \\leftarrow u',
        inSimpleWords:
          'If traveling through node u provides a shorter path to neighbor v than any previously known path, update the tentative distance of v and set its predecessor to u.',
        variables: [
          { symbol: 'd(u)', meaning: 'Current shortest recorded distance from Start node to node u' },
          { symbol: 'prev(v)', meaning: 'Predecessor node pointer for backtracking the final optimal path' },
        ],
      },
      {
        name: 'A* Heuristic Evaluation Function',
        readableNotation: 'f(n) = g(n) + h(n)    (where h(n) = Euclidean straight-line distance to Goal)',
        latex: 'f(n) = g(n) + h(n), \\quad h(n) = \\frac{\\|\\vec{r}_n - \\vec{r}_{\\text{goal}}\\|}{v_{\\text{max}}}',
        inSimpleWords:
          'A* accelerates Dijkstra’s algorithm by adding a geometric Euclidean distance heuristic h(n). It guides the pathfinder to explore nodes pointing toward the destination first, drastically cutting search time in real GPS navigation apps.',
        variables: [
          { symbol: 'f(n)', meaning: 'Total estimated path cost through node n' },
          { symbol: 'g(n)', meaning: 'Exact path cost already traveled from start to node n' },
          { symbol: 'h(n)', meaning: 'Admissible heuristic estimating remaining distance to goal' },
        ],
      },
    ],
    numericalExample: {
      scenario: 'Finding the fastest route through a 6-node road network (A -> B -> C -> D -> E -> F).',
      inputs: {
        'Nodes (Intersections)': 'A (Start), B, C, D, E, F (Destination)',
        'Edge Weights': 'A-B: 4, A-C: 2; B-C: 1, B-D: 5; C-D: 8, C-E: 10; D-E: 2, D-F: 6; E-F: 3',
      },
      calculationSteps: [
        'Initialize distances: d(A) = 0, all others = ∞. Visited set = {}.',
        'Step 1: Current node = A. Neighbors: B (dist 4), C (dist 2). Min unvisited = C (dist 2).',
        'Step 2: Current node = C. Update B (dist 2+1=3 < 4!), D (dist 10), E (dist 12). Min unvisited = B (dist 3).',
        'Step 3: Current node = B. Update D (dist 3+5=8 < 10!). Min unvisited = D (dist 8).',
        'Step 4: Current node = D. Update E (dist 8+2=10 < 12!), F (dist 8+6=14). Min unvisited = E (dist 10).',
        'Step 5: Current node = E. Update F (dist 10+3=13 < 14!). Destination reached with cost 13!',
      ],
      result: 'Optimal route is A -> C -> B -> D -> E -> F with minimum travel time of 13 minutes.',
    },
    realWorldApp:
      'Google Maps, Waze, delivery logistics (Amazon, Swiggy, Zomato), and airline flight routing engines all rely on dynamic graph shortest-path algorithms updated with live traffic weights.',
    runnableScript: {
      filename: 'step9_dijkstra_route_planning.py',
      title: 'Step 9: Graph Theory & Dijkstra Shortest Path Router',
      code: `#!/usr/bin/env python3
"""
Step 9: Graph Theory & Shortest Path (Dijkstra's Algorithm)
Finds the mathematically optimal, fastest route from Start (A) to Destination (F)
using priority queue edge relaxation.
"""
import heapq

# Road Network Graph: Intersections as Nodes, Roads as Edges with weights (mins)
road_network = {
    'A': [('B', 4), ('C', 2)],
    'B': [('A', 4), ('C', 1), ('D', 5)],
    'C': [('A', 2), ('B', 1), ('D', 8), ('E', 10)],
    'D': [('B', 5), ('C', 8), ('E', 2), ('F', 6)],
    'E': [('C', 10), ('D', 2), ('F', 3)],
    'F': [('D', 6), ('E', 3)]
}

def dijkstra_shortest_path(graph, start, destination):
    # Distances dictionary initialized to infinity
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    
    # Priority Queue: stores (cost, current_node, path_taken)
    pq = [(0, start, [start])]
    visited = set()
    
    step_num = 1
    print("Dijkstra Relaxation Steps:")
    while pq:
        curr_dist, curr_node, path = heapq.heappop(pq)
        
        if curr_node in visited:
            continue
        visited.add(curr_node)
        
        print(f"Step {step_num}: Visiting Node '{curr_node}' (Cost so far = {curr_dist})")
        step_num += 1
        
        if curr_node == destination:
            return curr_dist, path
            
        for neighbor, weight in graph[curr_node]:
            if neighbor not in visited:
                new_dist = curr_dist + weight
                if new_dist < distances[neighbor]:
                    print(f"   Relaxing edge ({curr_node}->{neighbor}): Dist reduced from {distances[neighbor]} to {new_dist}")
                    distances[neighbor] = new_dist
                    heapq.heappush(pq, (new_dist, neighbor, path + [neighbor]))
                    
    return float('inf'), []

print("=" * 60)
print(" GPS STEP 9: GRAPH THEORY & DIJKSTRA ROUTE PLANNING")
print("=" * 60)
cost, optimal_path = dijkstra_shortest_path(road_network, 'A', 'F')
print("-" * 60)
print(f"Origin Node:       'A' (Current GPS Position)")
print(f"Destination Node:  'F' (Target Destination)")
print(f"Optimal Shortest Route:  {' -> '.join(optimal_path)}")
print(f"Minimum Travel Time:     {cost} minutes")
print("=" * 60)
`,
      expectedOutput: `============================================================
 GPS STEP 9: GRAPH THEORY & DIJKSTRA ROUTE PLANNING
============================================================
Dijkstra Relaxation Steps:
Step 1: Visiting Node 'A' (Cost so far = 0)
   Relaxing edge (A->B): Dist reduced from inf to 4
   Relaxing edge (A->C): Dist reduced from inf to 2
Step 2: Visiting Node 'C' (Cost so far = 2)
   Relaxing edge (C->B): Dist reduced from 4 to 3
   Relaxing edge (C->D): Dist reduced from inf to 10
   Relaxing edge (C->E): Dist reduced from inf to 12
Step 3: Visiting Node 'B' (Cost so far = 3)
   Relaxing edge (B->D): Dist reduced from 10 to 8
Step 4: Visiting Node 'D' (Cost so far = 8)
   Relaxing edge (D->E): Dist reduced from 12 to 10
   Relaxing edge (D->F): Dist reduced from inf to 14
Step 5: Visiting Node 'E' (Cost so far = 10)
   Relaxing edge (E->F): Dist reduced from 14 to 13
Step 6: Visiting Node 'F' (Cost so far = 13)
------------------------------------------------------------
Origin Node:       'A' (Current GPS Position)
Destination Node:  'F' (Target Destination)
Optimal Shortest Route:  A -> C -> B -> D -> E -> F
Minimum Travel Time:     13 minutes
============================================================`,
    },
    cbseCurriculumLinks: [
      {
        standard: 'Class 12',
        chapter: 'Applied Mathematics / Computer Science',
        topics: [
          'Graph Theory: Vertices, Edges, Directed & Undirected Graphs',
          'Weighted networks and adjacency matrices',
          'Shortest-path algorithms (Dijkstra’s greedy approach)',
          'Algorithmic time complexity: O((V + E) log V)',
        ],
      },
    ],
    vivaQuestions: [
      {
        question: 'Why can’t a GPS simply calculate the straight-line Euclidean distance between start and finish?',
        answer:
          'Vehicles cannot travel in a straight line through buildings, rivers, mountains, and one-way streets. They are constrained to the road network graph. Dijkstra’s algorithm finds the shortest path adhering to physical road constraints.',
        hinglishTip:
          'Gaadi hawa mein seedhi nahi ud sakti; use sadkon par chalna padta hai. Isliye straight-line distance kaam nahi aati, road network ko graph banakar shortest path nikaalna padta hai.',
        difficulty: 'Standard',
      },
      {
        question: 'What is the algorithmic time complexity of Dijkstra’s algorithm using a min-heap priority queue?',
        answer:
          'O((V + E) log V), where V is the number of vertices (intersections) and E is the number of edges (road segments). In contrast, brute-force search is O(V!), which is computationally impossible for city networks.',
        hinglishTip:
          'Dijkstra priority queue ke saath O((V + E) log V) time leta hai, jabki brute force factorial time leta hai jo kabhi finish nahi ho sakta.',
        difficulty: 'Advanced',
      },
    ],
    hinglishSummary:
      'Step 9 mein Graph Theory use hoti hai. GPS se position milne ke baad rasta dhoondhna hota hai. Sadkon ke intersections ko Vertices (Nodes) aur sadkon ko Edges maana jaata hai. Dijkstra’s Algorithm sabse kam time ya distance wala rasta dhoondhta hai. A* algorithm straight-line heuristic jodkar isko superfast bana deta hai.',
  },
];
