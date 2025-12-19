// src/utils/generator.js

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (array) => array.sort(() => Math.random() - 0.5);

// --- 1. PROCEDURAL GRID ARCHITECT ---
// This replaces the hardcoded TEMPLATES. 
// It builds a unique crossword shape every time.

const GRID_SIZE = 9; // 9x9 Grid is safe for up to 5 numbers

const createProceduralTemplate = (numCount) => {
    let attempts = 0;
    
    // Retry loop in case we corner ourselves
    while (attempts < 100) {
        attempts++;
        
        // 1. Initialize Empty Grid map
        // Map "row-col" -> true if occupied
        const occupied = new Set();
        const numbers = [];
        const activeCells = new Set();
        
        // Helper to check bounds
        const isValid = (r, c) => r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
        
        // Helper to get array of indices from start + length + direction
        const getIndices = (r, c, len, isVert) => {
            const idxs = [];
            for (let i = 0; i < len; i++) {
                let nr = isVert ? r + i : r;
                let nc = isVert ? c : c + i;
                if (!isValid(nr, nc)) return null; // Out of bounds
                idxs.push(nr * GRID_SIZE + nc);
            }
            return idxs;
        };

        // --- STEP 1: Place Number 1 (The Root) ---
        // Place vertically or horizontally in the center-ish
        const startLen = getRandomInt(3, 5); // Length 3 to 5
        const isVert = Math.random() > 0.5;
        const startR = getRandomInt(2, 6);
        const startC = getRandomInt(2, 6);
        
        const indices = getIndices(startR, startC, startLen, isVert);
        if (!indices) continue; // Bad placement, retry
        
        numbers.push({ 
            id: 1, 
            name: "Number 1", 
            indices: indices, 
            type: isVert ? "vertical" : "horizontal",
            r: startR, c: startC, len: startLen // Store raw data for collision logic
        });
        
        indices.forEach(idx => { occupied.add(idx); activeCells.add(idx); });

        // --- STEP 2: Grow the rest ---
        let failCount = 0;
        while (numbers.length < numCount && failCount < 50) {
            // Pick a random existing number to branch off from
            const targetNum = numbers[Math.floor(Math.random() * numbers.length)];
            
            // Pick a random index within that number to intersect
            // We want to avoid the very edges if possible to look nice, but it's not strictly required
            const intersectIdxGlobal = targetNum.indices[Math.floor(Math.random() * targetNum.indices.length)];
            const intersectR = Math.floor(intersectIdxGlobal / GRID_SIZE);
            const intersectC = intersectIdxGlobal % GRID_SIZE;
            
            // The new number must be perpendicular
            const newIsVert = targetNum.type === "horizontal";
            const newLen = getRandomInt(3, 5);
            
            // Where does the new number start?
            // If it intersects at index `k` of itself, start is `intersect - k`
            // We randomize `k` (where along the new number the intersection happens)
            const intersectAt = getRandomInt(0, newLen - 1);
            
            const startRNew = newIsVert ? intersectR - intersectAt : intersectR;
            const startCNew = newIsVert ? intersectC : intersectC - intersectAt;
            
            const newIndices = getIndices(startRNew, startCNew, newLen, newIsVert);
            
            if (!newIndices) { failCount++; continue; }
            
            // --- COLLISION CHECK ---
            // We allow overlap ONLY at the specific intersection point.
            // If it touches/overlaps any OTHER number anywhere else, it's risky for logic generation.
            // For stability, we enforce: New cells must NOT be in occupied set EXCEPT the intersection point.
            
            let collision = false;
            for (let idx of newIndices) {
                if (idx !== intersectIdxGlobal && occupied.has(idx)) {
                    collision = true;
                    break;
                }
                // Optional: Check adjacent cells to avoid "clusters" that look ugly?
                // Left out for simplicity.
            }
            
            if (collision) { failCount++; continue; }
            
            // Success! Add Number
            const newId = numbers.length + 1;
            numbers.push({
                id: newId,
                name: `Number ${newId}`,
                indices: newIndices,
                type: newIsVert ? "vertical" : "horizontal",
                r: startRNew, c: startCNew, len: newLen
            });
            
            newIndices.forEach(idx => { occupied.add(idx); activeCells.add(idx); });
        }
        
        if (numbers.length === numCount) {
            // Successfully built a grid!
            return {
                name: "Procedural",
                rows: GRID_SIZE,
                cols: GRID_SIZE,
                numbers: numbers,
                activeCells: Array.from(activeCells)
            };
        }
    }
    
    // Fallback if procedural fails 100 times (should not happen)
    // Return a safe static one just in case
    return {
        rows: 5, cols: 5,
        numbers: [{ id: 1, indices: [6,7,8], type: 'horizontal' }, { id: 2, indices: [2,7,12], type: 'vertical' }],
        activeCells: [6,7,8,2,12]
    };
};


// --- 2. LOGIC SOLVER (Standard) ---

const formatDigits = (digits, type) => {
  let sorted = [...digits];
  if (type === 'max') {
    sorted.sort((a, b) => b - a);
  } else {
    sorted.sort((a, b) => a - b);
    if (sorted[0] === 0 && sorted.length > 1) {
      const firstNonZeroIndex = sorted.findIndex(d => d > 0);
      if (firstNonZeroIndex > -1) {
        const val = sorted[firstNonZeroIndex];
        sorted.splice(firstNonZeroIndex, 1);
        sorted.unshift(val);
      }
    }
  }
  return sorted;
};

const generateSingleNumber = (length, ruleType, constraints) => {
  for (let attempt = 0; attempt < 1000; attempt++) { 
    let pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const constraintValues = constraints.map(c => c.value);
    pool = pool.filter(d => !constraintValues.includes(d));
    const countNeeded = length - constraints.length;
    if (pool.length < countNeeded) continue;

    const picked = shuffle(pool).slice(0, countNeeded);
    let candidate = [...picked, ...constraintValues];
    const formatted = formatDigits(candidate, ruleType);
    
    let valid = true;
    for (let c of constraints) {
      if (formatted[c.localIndex] !== c.value) {
        valid = false; 
        break;
      }
    }
    if (valid) return formatted;
  }
  return null; 
};


// --- 3. MAIN EXPORT ---

export const generatePuzzle = (level, questionIndex = 1) => {
  // 1. Determine Difficulty
  let numCount = 2;
  if (level === 3) numCount = 3;
  if (level === 4) numCount = 4;
  if (level >= 5) numCount = 5;

  // 2. BUILD THE GRID (Procedural)
  const template = createProceduralTemplate(numCount);

  // 3. Assign Rules
  const rulesMap = {};
  template.numbers.forEach(n => {
    rulesMap[n.id] = Math.random() > 0.5 ? 'max' : 'min';
  });

  // 4. Solve Math
  const solution = {}; 
  const numberSolutions = {}; 

  for (let i = 0; i < template.numbers.length; i++) {
    const numDef = template.numbers[i];
    const ruleType = rulesMap[numDef.id];
    
    const constraints = [];
    
    // Check intersection with PREVIOUS numbers
    for (let prevId in numberSolutions) {
      const prevDef = template.numbers.find(n => n.id == prevId);
      const intersectIdx = numDef.indices.find(idx => prevDef.indices.includes(idx));
      
      if (intersectIdx !== undefined) {
        const existingValue = parseInt(solution[intersectIdx]);
        const localIndex = numDef.indices.indexOf(intersectIdx);
        constraints.push({ localIndex, value: existingValue });
      }
    }

    const digits = generateSingleNumber(numDef.indices.length, ruleType, constraints);
    
    if (!digits) {
      // If we built a grid shape that is mathematically unsolvable (rare but possible),
      // just recurse and build a NEW shape.
      return generatePuzzle(level, questionIndex + 1); 
    }

    numberSolutions[numDef.id] = digits;
    numDef.indices.forEach((idx, k) => {
      solution[idx] = digits[k].toString();
    });
  }

  // 5. Output
  const allValues = Object.values(solution);
  const inventory = allValues.map((val, i) => ({
      id: `tile-${i}`,
      value: val
  }));

  const grid = Array(template.rows * template.cols).fill({ type: 'block' });
  template.activeCells.forEach(idx => {
      grid[idx] = { type: 'target', value: null, indices: [idx] };
  });

  const clues = template.numbers.map(n => ({
    id: n.id,
    text: `Make the ${rulesMap[n.id] === 'max' ? 'greatest' : 'smallest'} ${n.indices.length}-digit number.`
  }));

  const rules = {};
  template.numbers.forEach(n => {
    rules[n.id] = { type: rulesMap[n.id], indices: n.indices };
  });

  return {
      id: Date.now() + Math.random(), // Unique ID for React Key
      level: level,
      ...template, 
      grid: grid,
      inventory: shuffle(inventory),
      clues: clues,
      rules: rules,
      solution: solution
  };
};