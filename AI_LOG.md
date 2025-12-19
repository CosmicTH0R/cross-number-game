# AI Interaction Log

**Overview:**
I utilized AI tools (Gemini) as a pair programmer to accelerate the development of complex algorithms. I guided the AI on the specific game mechanics I observed in the reference activity.

### Phase 1: Architecture & Pivot
**My Prompt:**
> "I played the reference game and realized the assignment description is slightly misleading. It's not a math equation game; it's a Logic Constraint puzzle involving 'Greatest' and 'Smallest' numbers with intersections. Help me design a data schema that supports these logic constraints."

**Outcome:**
AI suggested pivoting from a standard arithmetic grid to a Constraint Satisfaction model. We defined a schema that separates `grid indices` from `logical rules` (Max/Min).

### Phase 2: The Procedural Generator
**My Prompt:**
> "I don't want to use hardcoded levels. Write a JavaScript function that generates a random crossword-like grid. It should start with one vertical or horizontal line, and then 'grow' new intersecting lines from it without overlapping invalidly."

**Outcome:**
We developed the `createProceduralTemplate` function in `generator.js`. This allows for infinite level variety. I refined the prompt to include a "collision detection" set to prevent numbers from overwriting each other.

### Phase 3: Logic Validation
**My Prompt:**
> "Write a validation function for a 'Smallest Number' rule. It needs to handle the edge case where sorting digits ascending results in a leading zero (e.g., 0, 2, 5). It should swap the zero with the next non-zero digit."

**Outcome:**
AI provided the `formatDigits` helper function. I integrated this into both the Generator (to ensure solvability) and the Game Validator (to check user input correctly).

### Phase 4: UI Polish
**My Prompt:**
> "Style this React component using Tailwind CSS to look like a modern mobile game. Use a glassmorphism effect for the container and 3D-style buttons for the number tiles."

**Outcome:**
Generated the polished `Game.jsx` UI with shadows, rounded corners, and the amber/indigo color palette.