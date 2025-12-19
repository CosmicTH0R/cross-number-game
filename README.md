# Cross Numbers Game (MathAI SDE Assignment)

A procedurally generated logic puzzle game built with **React**, designed to replicate the specific constraint-satisfaction mechanics observed in the MathAI reference activity.

## 🚀 Live Demo
[Link to Live Game](https://your-project-url.vercel.app)

## 🎯 Objective & Pivot
The assignment text mentioned "Cross Number" (typically arithmetic equations). However, upon deeply analyzing the gameplay mechanics from the provided reference link, I identified that the core challenge was actually **Logic Constraints** (e.g., "Make the smallest 4-digit number", "Digits must not repeat") rather than simple calculation.

**Technical Decision:**
I chose to build a **Logic Constraint Engine** rather than a simple arithmetic calculator. This ensures the product matches the actual User Experience (UX) of the target platform, demonstrating attention to product details.

## 🛠️ Key Features
* **Infinite Procedural Levels:**
    Unlike a static list of puzzles, I engineered a **Procedural Grid Architect**. It generates unique grid layouts and mathematically valid number combinations on the fly. No two games are ever the same.
* **Constraint Solver Algorithm:**
    The generator uses a backtracking-inspired approach to ensure that intersecting numbers (e.g., a vertical "Greatest Number" crossing a horizontal "Smallest Number") are mathematically solvable.
* **Dynamic Difficulty Scaling:**
    * **Level 1-2:** 2-Number intersections.
    * **Level 3:** 3-Number chains.
    * **Level 5:** Complex 5-number "weaves".
* **Interactive UI:** Full Drag-and-Drop support with a "Glassmorphism" design, timer-based urgency, and reactive animations.

## ⚙️ Technical Stack
* **Frontend:** React (Vite)
* **Styling:** Tailwind CSS
* **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`)
* **Effects:** `canvas-confetti`

## 🧠 Engineering Decisions
### 1. The "Grid Architect" (Generator)
Instead of hardcoding templates, I wrote an algorithm (`src/utils/generator.js`) that:
1.  Places a root number.
2.  Randomly "grows" perpendicular numbers from valid intersection points.
3.  Checks for collisions to prevent invalid grid shapes.
4.  Solves the digit constraints (Min/Max sorting) to ensure the puzzle is solvable before rendering.

### 2. Dynamic Grid Cropping
To handle random grid shapes, I implemented a `useMemo` calculation in `Game.jsx` that determines the "Bounding Box" of the active cells. This crops the 9x9 internal matrix to only show the relevant puzzle area, keeping the UI centered and clean regardless of the shape generated.

### 3. Edge Case Handling
Implemented specific logic for "Smallest Number" generation to handle leading zeros (e.g., automatically swapping `0123` to `1023` to maintain valid number formatting).

## 🏃 How to Run Locally
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```