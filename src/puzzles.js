// src/puzzles.js
export const puzzles = [
  {
    id: 1,
    name: "Level 1: The Warmup",
    rows: 5,
    cols: 5,
    grid: [
      // Row 1
      { type: "static", value: "2", display: "2" },
      { type: "static", value: "+", display: "+" },
      { type: "input", correctValue: "4" }, 
      { type: "static", value: "=", display: "=" },
      { type: "static", value: "6", display: "6" },

      // Row 2 (Vertical connectors)
      { type: "static", value: "+", display: "+" },
      { type: "block" },
      { type: "static", value: "+", display: "+" },
      { type: "block" },
      { type: "block" },

      // Row 3
      { type: "input", correctValue: "5" }, 
      { type: "static", value: "+", display: "+" },
      { type: "input", correctValue: "3" }, 
      { type: "static", value: "=", display: "=" },
      { type: "static", value: "8", display: "8" },

      // Row 4
      { type: "static", value: "=", display: "=" },
      { type: "block" },
      { type: "static", value: "=", display: "=" },
      { type: "block" },
      { type: "block" },

      // Row 5
      { type: "static", value: "7", display: "7" },
      { type: "block" },
      { type: "static", value: "7", display: "7" },
      { type: "block" },
      { type: "block" },
    ]
  }
];