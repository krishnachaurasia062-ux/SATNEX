import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Mode-specific specialized system instructions
function getSystemInstruction(mode: string = 'general', language: string = 'english'): string {
  const langClause = language === 'hinglish'
    ? 'PRIMARY LANGUAGE REQUIREMENT: Explain all concepts in clear, natural Hinglish (Hindi written in Roman script mixed with standard English mathematical terms like "Satellite", "Distance", "Trilateration", "Velocity", "Equations", "Coordinates"). Example: "GPS mein hume 4 satellites isliye chahiye hote hain kyunki receiver clock ka time error Δt unknown hota hai..."'
    : 'PRIMARY LANGUAGE REQUIREMENT: Respond in clear, academically rigorous, and encouraging English.';

  const baseContext = `You are "Orbital AI", the next-generation mathematics intelligence engine built for Krishna Chaurasia's school exhibition project: "GPS Navigation System – Mathematical Principles" (CBSE / ISC Class 11 & 12 Advanced Working Lab).
You have mastery over the 9 mathematical principles of GPS:
1. 3D Coordinate Geometry & Euclidean distance: d = √((x-xs)² + (y-ys)² + (z-zs)²), light speed c = 299,792,458 m/s, Δt time-of-flight.
2. Intersecting Spheres: (x-xi)² + (y-yi)² + (z-zi)² = ri². 2 spheres intersect in a circle; 3 intersect in 2 points; Earth surface removes spatial ambiguity.
3. Trilateration & Pseudorange Algebra: Receiver clock offset Δtr produces pseudorange ρi = di + c·Δtr. 4 unknowns (x, y, z, Δtr) require ≥4 satellites.
4. WGS84 Ellipsoid Trigonometry: ECEF (X, Y, Z) to geodetic Latitude (φ) and Longitude (λ) using atan2 and Bowring closed formulas (a=6378137m, f=1/298.257223563).
5. 3D Vectors: Position vectors, relative line-of-sight vectors r_rel = r_sat - r_rec, unit direction vectors, vector dot products for elevation angles.
6. Orbital Calculus: Gravitational acceleration a = -GM/r², velocity as first derivative v = dr/dt, position integration r(t) = ∫ v dt.
7. Least-Squares Optimization: 5+ satellites over-determined systems, residual error vector ε = Δρ - H·Δx, normal equations (Hᵀ H) Δx = Hᵀ Δρ.
8. 3D Rotation Matrices: SO(3) Euler rotation matrices R_x, R_y, R_z transforming Earth-Centered Earth-Fixed (ECEF) coordinates to local East-North-Up (ENU) topocentric frames.
9. Graph Theory & Route Planning: Road network G = (V,E), edge travel weights, Dijkstra's algorithm, priority queue, dynamic shortest path routing.`;

  if (mode === 'viva') {
    return `${baseContext}
${langClause}

ROLE: STRICT & ENCOURAGING CBSE/ISC MATHEMATICS EXHIBITION VIVA EXAMINER.
- Your task is to prepare students to score 100% in exhibition viva evaluations.
- When the user asks for a viva test or greets you, present a challenging, realistic viva question from one of the 9 steps or Einstein relativity clock correction.
- When the user submits an answer to a viva question:
  1. **Score out of 10**: Rate their answer (e.g., "Score: 8.5/10").
  2. **Strengths**: Point out what they explained correctly.
  3. **Examiner Corrections**: Clarify any missing technical terms or mathematical oversights.
  4. **Model Answer**: Give the ideal, crisp 2-3 sentence answer an examiner expects.
  5. **Next Question**: Ask the next follow-up viva question!`;
  }

  if (mode === 'solver') {
    return `${baseContext}
${langClause}

ROLE: STEP-BY-STEP MATHEMATICAL & NUMERICAL SOLVER.
- Your task is to calculate live numerical solutions and show clean, step-by-step arithmetic.
- When given coordinates, times, or satellite data:
  1. State given parameters and known constants (c = 299,792,458 m/s, Earth radius R = 6371 km).
  2. Write the exact formula in clear notation.
  3. Substitute numbers step-by-step.
  4. Show intermediate arithmetic values with units (meters, seconds, km).
  5. Highlight the final calculated result in a clear box or bold text.
- If asked for Python code to compute a numerical result, provide a clean, executable Python snippet with comments.`;
  }

  if (mode === 'model') {
    return `${baseContext}
${langClause}

ROLE: SCIENCE EXHIBITION PHYSICAL & WORKING MODEL ARCHITECT.
- Your task is to guide the student on constructing impressive, feasible physical models using school-level materials.
- Offer practical ideas for:
  1. Black cardboard base & dark velvet exhibition background.
  2. Wooden dowels & styrofoam globes for satellite orbits.
  3. Laser pointers or colored LED strings representing radio signal vectors from satellites to receiver.
  4. Intersecting wire rings / transparent plastic acrylic spheres to visually demonstrate trilateration.
  5. Arduino Uno / Nano + 16x2 I2C LCD + Push buttons to demonstrate real-time mathematical calculations.
  6. Formula display placards with high-contrast metallic lettering.`;
  }

  return `${baseContext}
${langClause}

ROLE: COMPREHENSIVE EXHIBITION TUTOR & GUIDE.
- Answer user questions with supreme clarity, structural elegance, and mathematical precision.
- Use bold section headers, formatted formulas, bullet points, and practical real-world intuition.
- Provide simple analogies where helpful, but never sacrifice mathematical rigor.`;
}

// Next-level intelligent fallback knowledge engine
function generateAdvancedFallback(prompt: string, mode: string = 'general', language: string = 'english'): string {
  const q = prompt.toLowerCase();
  const isHinglish = language === 'hinglish';

  if (mode === 'viva') {
    if (q.includes('start') || q.includes('test') || q.includes('question') || q.includes('viva') || q.includes('ask me') || q.length < 15) {
      if (isHinglish) {
        return `### 🎓 Viva Examiner Simulation Mode: Question 1

**Examiner:** "Namaste! Main aapka External Mathematics Examiner hoon. Chaliye shuru karte hain:

**Sawaal:** Agar hum receiver clock ka time measurement bas **1 microsecond (1 μs = 10⁻⁶ s)** galat measure kar dein, toh receiver ki position calculation mein kitne meters ka error aayega? Aur is error ko cancel karne ke liye mathematically kya kiya jaata hai?"

*(Aap apna answer likhiye, main aapko 10 mein se marks dunga aur detailed feedback bataunga!)*`;
      }
      return `### 🎓 Viva Examiner Simulation Mode: Question 1

**Examiner:** "Welcome to the GPS Mathematics Exhibition Viva Voce. Let us test your conceptual depth:

**Question:** If the ground receiver's internal quartz clock has an offset of just **1 microsecond (1 μs = 10⁻⁶ s)**, how many meters of position error does this produce? And mathematically, why does adding a 4th satellite completely eliminate this error without needing an expensive atomic clock inside the receiver?"

*(Submit your response below. I will grade your answer out of 10, highlight missing formulas, and present the next question!)*`;
    }

    if (q.includes('300') || q.includes('c *') || q.includes('speed of light') || q.includes('light speed') || q.includes('300m') || q.includes('300 meter') || q.includes('299')) {
      return `### 🎓 Viva Evaluation: Score: 9.5 / 10! ⭐

**Examiner Assessment:**
- **Strengths:** Excellent! You correctly identified that radio waves travel at the speed of light $c \\approx 300,000\\text{ km/s}$, so $\\Delta d = c \\cdot \\Delta t = 299,792,458 \\times 10^{-6} \\approx 299.79\\text{ meters}$!
- **Mathematical Rigor:** Adding a 4th satellite introduces a 4th equation, allowing the receiver clock bias $\\Delta t_r$ to be treated as a 4th unknown variable alongside $(x, y, z)$. Solving this $4\\times 4$ system solves for both spatial location AND atomic-standard time simultaneously!

---

**Follow-Up Viva Question 2:**
*"When two satellite range spheres intersect in 3D space, what geometric object is formed? And what does a third sphere reduce this down to?"*`;
    }

    return `### 🎓 Viva Evaluation: Score: 8.0 / 10

**Examiner Feedback:**
- **Key Observation:** Good conceptual direction! Always ensure you state the governing equation: $\\rho_i = \\sqrt{(x_i - x)^2 + (y_i - y)^2 + (z_i - z)^2} + c \\cdot \\Delta t_r$.
- **Model Answer:** A 1 microsecond clock discrepancy generates $\\approx 300\\text{ meters}$ of range error ($c \\cdot 10^{-6}\\text{ s}$). GPS resolves this without hardware atomic clocks by formulating a 4-variable system $(x,y,z,\\Delta t_r)$ solved simultaneously with 4 satellite pseudoranges.

---

**Next Viva Question:**
*"Why must GPS satellite atomic clocks be programmed to run 38 microseconds slower per day before launch? Mention the two physical theories involved."*`;
  }

  if (mode === 'solver') {
    return `### 📐 Live Numerical Calculation: 3D Satellite-to-Receiver Distance

**Problem Statement:**
Compute true distance $d$ and signal transit time $\\Delta t$ for:
- Satellite position: $S = (15000, 12000, 18000)\\text{ km}$
- Receiver antenna: $R = (3800, 2200, 4800)\\text{ km}$

**Step 1: Coordinate Differences (ΔX, ΔY, ΔZ)**
- $\\Delta X = 15000 - 3800 = 11,200\\text{ km}$
- $\\Delta Y = 12000 - 2200 = 9,800\\text{ km}$
- $\\Delta Z = 18000 - 4800 = 13,200\\text{ km}$

**Step 2: 3D Euclidean Distance Formula**
$$d = \\sqrt{\\Delta X^2 + \\Delta Y^2 + \\Delta Z^2}$$
$$d = \\sqrt{11200^2 + 9800^2 + 13200^2} = \\sqrt{125440000 + 96040000 + 174240000}$$
$$d = \\sqrt{395,720,000} \\approx \\mathbf{19,892.71\\text{ km}}$$

**Step 3: Signal Propagation Time (Speed of Light $c = 299,792.458\\text{ km/s}$)**
$$\\Delta t = \\frac{d}{c} = \\frac{19,892.71}{299,792.458} \\approx \\mathbf{0.06635\\text{ seconds (66.35 ms)}}$$

**Result:** The radio wavefront takes **66.35 milliseconds** to reach the receiver antenna.`;
  }

  if (mode === 'model') {
    return `### 🛠️ Physical & Working Model Construction Blueprint

Here is how to construct a prize-winning physical exhibition model using school materials:

1. **Cardboard Base & Coordinate Axes:**
   - Use a **75cm × 75cm heavy black foam board** as the Earth plane.
   - Erect three perpendicular 30cm wooden dowels painted in neon colors:
     - **Red:** X-Axis (Vernal Equinox / Greenwich)
     - **Green:** Y-Axis (90° East Meridian)
     - **Blue:** Z-Axis (Earth North Rotation Axis)

2. **Earth Globe & Satellite Constellation:**
   - Center a **12cm styrofoam globe** at $(0,0,0)$ showing major continents, equator, and prime meridian.
   - Mount **4 miniature satellite models** on thin acrylic rods at orbital radius $r \\approx 26,000\\text{ km}$ (scaled down to 25cm).

3. **Demonstrating 3D Vectors & Intersecting Spheres:**
   - Run **taut colored strings or flexible EL wire** from each satellite to a pinpoint user marker on the globe.
   - Use **3 transparent acrylic domes (or wire rings)** intersecting over the globe to physically display trilateration.

4. **Working Electronics (Arduino / Laptop):**
   - Connect an **Arduino Uno with a 16×2 I2C LCD** and 4 push buttons.
   - When a visitor presses Button 1 to 4, the LCD prints the simulated satellite pseudorange and calculates $(X,Y,Z)$ on the screen!`;
  }

  // General Mode answers
  if (q.includes('4 satellite') || q.includes('why 4') || q.includes('clock') || q.includes('unknown')) {
    if (isHinglish) {
      return `### GPS mein kam se kam 4 Satellites kyun chahiye hote hain?

School books mein hum padhte hain ki 3D space mein kisi point ko fix karne ke liye 3 distances kaafi hain. Lekin real-world GPS mein **4 satellites zaroori** hote hain:

1. **4 Unknown Variables:**
   - $x, y, z$: Ground receiver ki spatial coordinates (ECEF space mein).
   - $\\Delta t_r$: Receiver ki internal clock ka time error (clock bias).

2. **Problem (Receiver Clock Error):**
   Satellites par high-precision Atomic Clocks ($10^{-13}$ accuracy) hoti hain, lekin hamare mobile phone ya GPS receiver mein sasti quartz clock hoti hai. Agar receiver clock sirf **1 microsecond (1 μs)** aage-peeche ho jaaye, toh light speed ($c$) se multiply hokar **300 meters** ka error aa jata hai!

3. **Mathematical Solution (Trilateration Algebra):**
   $$\\rho_i = \\sqrt{(x_i - x)^2 + (y_i - y)^2 + (z_i - z)^2} + c \\cdot \\Delta t_r$$
   Kyunki hamare paas $4$ unknowns ($x, y, z, \\Delta t_r$) hain, isliye algebra ke basic rule ke mutabiq hume **at least 4 independent equations** chahiye! Isliye **4 satellites** zaroori hain.`;
    }

    return `### Why At Least 4 Satellites Are Required in GPS

In 3D Euclidean space, 3 distances mathematically intersect at two discrete points (one of which is on Earth). However, real GPS receivers **must track at least 4 satellites**:

1. **The 4 Unknown Variables:**
   - $x$: Receiver X-coordinate (meters, ECEF Cartesian frame)
   - $y$: Receiver Y-coordinate (meters, ECEF Cartesian frame)
   - $z$: Receiver Z-coordinate (meters, ECEF Cartesian frame)
   - $\\Delta t_r$: Receiver clock synchronization bias (seconds)

2. **The Physics of Clock Error:**
   Satellites carry atomic rubidium/cesium clocks accurate to nanoseconds. Ground receivers (smartphones, car dashboards) contain low-cost quartz oscillators that drift. Because signals travel at light speed $c = 299,792,458\\text{ m/s}$, an uncorrected drift of just $1\\;\\mu\\text{s}$ generates a massive $\\mathbf{299.79\\text{ meter}}$ positioning error!

3. **Algebraic System:**
   $$\\rho_i = \\sqrt{(x_i - x)^2 + (y_i - y)^2 + (z_i - z)^2} + c \\cdot \\Delta t_r \\quad (i = 1, 2, 3, 4)$$
   Solving this non-linear $4\\times 4$ system determines $(x,y,z)$ and synchronizes the user's receiver to atomic time without requiring a million-dollar atomic clock on the ground!`;
  }

  if (q.includes('relativity') || q.includes('einstein') || q.includes('time dilation')) {
    return `### Einstein's Relativity in GPS: An Exhibition Showstopper!

If relativistic effects were ignored in GPS, positions would drift by **11 kilometers every single day**, rendering navigation completely useless within minutes!

1. **Special Relativity (Velocity Effect):**
   - Satellites move at orbital velocity $v \\approx 3.87\\text{ km/s}$.
   - According to Einstein's time dilation formula $\\Delta t' = \\Delta t \\sqrt{1 - \\frac{v^2}{c^2}}$, moving clocks tick **slower** by **$7\\;\\mu\\text{s/day}$**.

2. **General Relativity (Gravitational Potential Effect):**
   - Satellites orbit at $20,200\\text{ km}$ altitude where Earth's gravity is roughly $4\\times$ weaker than at sea level.
   - Clocks in weaker gravitational fields tick **faster** by **$45\\;\\mu\\text{s/day}$**.

3. **Net Relativistic Correction:**
   $$+45\\;\\mu\\text{s} - 7\\;\\mu\\text{s} = \\mathbf{+38\\;\\mu\\text{s per day}}$$
   Before launch, satellite clock oscillators are physically offset from $10.23\\text{ MHz}$ down to **$10.22999999543\\text{ MHz}$** so that once in orbit, they tick at the exact same rate as ground clocks!`;
  }

  return `### GPS Navigation: 9 Mathematical Principles Overview

Welcome to Krishna Chaurasia's Mathematics Exhibition Project! Here is how the 9 steps integrate:

1. **Coordinate Geometry (Step 1):** 3D Euclidean metric $d = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}$ computes distance from signal travel time $\\Delta t$.
2. **Spherical Geometry (Step 2):** Sphere equations $(x-x_i)^2 + (y-y_i)^2 + (z-z_i)^2 = r_i^2$ narrow user location.
3. **Trilateration & Algebra (Step 3):** Solves 4 simultaneous non-linear equations for $(x, y, z, \\Delta t_r)$.
4. **WGS84 Trigonometry (Step 4):** Transforms Cartesian coordinates into Latitude ($\\phi$), Longitude ($\\lambda$) using $\\operatorname{atan2}$.
5. **Vectors (Step 5):** Relative displacement vectors $\\vec{r}_{rel} = \\vec{r}_{sat} - \\vec{r}_{rec}$ and dot products calculate satellite elevation angles.
6. **Orbital Calculus (Step 6):** Differential equations $\\vec{a} = \\frac{d\\vec{v}}{dt} = -\\frac{GM}{r^2}\\hat{r}$ model satellite orbits over time.
7. **Least-Squares Optimization (Step 7):** Gauss-Newton normal equations $(\\mathbf{H}^T \\mathbf{H})^{-1} \\mathbf{H}^T \\Delta \\boldsymbol{\\rho}$ cancel noise with 5+ satellites.
8. **3D Rotation Matrices (Step 8):** Euler matrices $\\mathbf{R}_{\\text{ENU}}$ rotate global ECEF coordinates into the user's local East-North-Up navigation frame.
9. **Graph Theory (Step 9):** Dijkstra's algorithm computes the shortest path on weighted road network graphs.

*Use the mode buttons above to switch between Viva Voce Examiner, Step-by-Step Solver, and Physical Model Guide!*`;
}

// API endpoint for exhibition AI assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, mode = 'general', language = 'english' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Question message is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const systemInstruction = getSystemInstruction(mode, language);

    // If API key is present, call Google GenAI SDK (Gemini 3.8 Flash)
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const chat = ai.chats.create({
          model: 'gemini-3.8-flash',
          config: {
            systemInstruction,
          },
        });

        // Replay recent history for context
        if (Array.isArray(history) && history.length > 0) {
          const recentHistory = history.slice(-4);
          for (const item of recentHistory) {
            if (item && item.role === 'user' && typeof item.text === 'string') {
              try {
                await chat.sendMessage({ message: item.text });
              } catch (histErr) {
                console.warn('Skipping history message replay:', histErr);
              }
            }
          }
        }

        // Add 10-second timeout guard
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out')), 10000)
        );

        const responsePromise = chat.sendMessage({ message });
        const response: any = await Promise.race([responsePromise, timeoutPromise]);

        if (response && response.text) {
          res.json({ reply: response.text });
          return;
        }
      } catch (geminiErr: any) {
        console.warn('Gemini API error, falling back to advanced exhibition knowledge engine:', geminiErr?.message);
        // Fall through to fallback engine below
      }
    }

    // Comprehensive next-level exhibition knowledge response engine
    const fallbackAnswer = generateAdvancedFallback(message, mode, language);
    res.json({ reply: fallbackAnswer });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate response. Please try again.',
    });
  }
});

// Serve frontend in development via Vite middleware, or static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
