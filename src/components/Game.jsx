// src/components/Game.jsx
import React, { useState, useEffect, useMemo } from 'react';

const Game = ({ puzzle, initialTime, onComplete, onCheat, onSkip }) => {
  const [placedItems, setPlacedItems] = useState({});
  const [feedback, setFeedback] = useState(null); 
  const [message, setMessage] = useState("");
  const [isRevealed, setIsRevealed] = useState(false); 
  
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimerActive, setIsTimerActive] = useState(false); 

  useEffect(() => {
    setPlacedItems({});
    setFeedback(null);
    setMessage("");
    setIsRevealed(false);
    setHasStarted(false); 
    setTimeLeft(initialTime);
    setIsTimerActive(false); 
  }, [puzzle, initialTime]);

  // --- TIMER ---
  useEffect(() => {
    if (!hasStarted || !isTimerActive || timeLeft <= 0) return;
    const timerId = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                clearInterval(timerId);
                handleTimeUp();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timerId);
  }, [hasStarted, isTimerActive, timeLeft]);

  // --- DYNAMIC CENTERING LOGIC (THE FIX) ---
  // We calculate the "Bounding Box" of the active puzzle cells
  // This removes the empty invisible rows/cols that were making it look off-center
  const viewLayout = useMemo(() => {
      if (!puzzle) return null;
      
      const allIndices = puzzle.numbers.flatMap(n => n.indices);
      const rows = allIndices.map(idx => Math.floor(idx / puzzle.cols));
      const cols = allIndices.map(idx => idx % puzzle.cols);

      const minR = Math.min(...rows);
      const maxR = Math.max(...rows);
      const minC = Math.min(...cols);
      const maxC = Math.max(...cols);

      return {
          minR, maxR, minC, maxC,
          width: maxC - minC + 1,
          height: maxR - minR + 1
      };
  }, [puzzle]);

  // --- HANDLERS ---
  const handleStartGame = () => {
      setHasStarted(true);
      setIsTimerActive(true);
  };

  const handleTimeUp = () => {
      setIsTimerActive(false);
      handleReveal(true); 
      setMessage("Time's Up! Streak lost.");
      if (onCheat) onCheat(); 
  };

  const handleReveal = (isTimeUp = false) => {
      if (!isTimeUp && onCheat) onCheat(); 
      setIsRevealed(true);
      setIsTimerActive(false);

      const solutionItems = {};
      const availableInventory = [...puzzle.inventory];
      Object.keys(puzzle.solution).forEach(gridIndex => {
          const correctVal = puzzle.solution[gridIndex];
          const tileIndex = availableInventory.findIndex(t => t.value === correctVal);
          if (tileIndex !== -1) {
              const tile = availableInventory[tileIndex];
              solutionItems[gridIndex] = { value: tile.value, id: tile.id };
              availableInventory.splice(tileIndex, 1);
          }
      });
      setPlacedItems(solutionItems);
      setFeedback(null);
      if (!isTimeUp) setMessage("Answer Revealed. Streak reset to 0.");
  };

  const handleDragStart = (e, val, id) => {
    if (isRevealed) return; 
    e.dataTransfer.setData("text", val);
    e.dataTransfer.setData("id", id);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (isRevealed) return;
    const value = e.dataTransfer.getData("text");
    const id = e.dataTransfer.getData("id");
    if (!value || !id) return;
    setPlacedItems(prev => {
      const newItems = { ...prev };
      const oldIndex = Object.keys(newItems).find(key => newItems[key].id === id);
      if (oldIndex) delete newItems[oldIndex];
      newItems[targetIndex] = { value, id };
      return newItems;
    });
  };

  const handleRemove = (index) => {
      if (isRevealed) return;
      setPlacedItems(prev => {
          const newItems = { ...prev };
          delete newItems[index];
          return newItems;
      });
  };

  const checkAnswers = () => {
    if (isRevealed) return;
    let allValid = true;
    let errorMsg = "";

    Object.keys(puzzle.rules).forEach((key) => {
        const rule = puzzle.rules[key];
        const values = rule.indices.map(idx => placedItems[idx]?.value);
        if (values.some(v => !v)) {
            allValid = false;
            errorMsg = "Fill all empty boxes first!";
            return;
        }
        const numValues = values.map(v => parseInt(v));

        if (rule.type === 'max') {
            const sorted = [...numValues].sort((a,b) => b-a);
            if (JSON.stringify(numValues) !== JSON.stringify(sorted)) {
                allValid = false;
                errorMsg = `Number ${key} is not the greatest possible!`;
            }
        }
        if (rule.type === 'min') {
            let sorted = [...numValues].sort((a,b) => a-b);
            if (sorted[0] === 0 && sorted.length > 1) {
                const firstNonZeroIndex = sorted.findIndex(d => d > 0);
                if (firstNonZeroIndex > -1) {
                    const val = sorted[firstNonZeroIndex];
                    sorted.splice(firstNonZeroIndex, 1);
                    sorted.unshift(val);
                }
            }
            if (parseInt(numValues.join('')) !== parseInt(sorted.join(''))) {
                 allValid = false;
                 if (numValues[0] === 0 && numValues.length > 1) errorMsg = `Number ${key} cannot start with 0!`;
                 else errorMsg = `Number ${key} is not the smallest possible!`;
            }
        }
    });

    if (errorMsg) {
        setFeedback('wrong');
        setMessage(errorMsg);
    } else if (allValid) {
        setFeedback('correct');
        setMessage("Perfect Logic! 🎉");
        setIsTimerActive(false); 
        setTimeout(() => onComplete(), 1500);
    }
  };

  const usedIds = Object.values(placedItems).map(item => item.id);

  const Tile = ({ value, dragging }) => (
    <div className={`
        w-14 h-14 flex items-center justify-center rounded-xl text-2xl font-black select-none transition-all
        ${dragging ? 'opacity-50 scale-95' : 'hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-none'}
        bg-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-md cursor-grab active:cursor-grabbing
    `}>
        {value}
    </div>
  );

  let timerColor = "bg-green-500";
  if (timeLeft < 20) timerColor = "bg-yellow-500";
  if (timeLeft < 10) timerColor = "bg-red-500 animate-pulse";
  const progressPercent = (timeLeft / initialTime) * 100;

  // Helper to Render the Cropped Grid
  const renderCroppedGrid = () => {
      if (!viewLayout) return null;
      const cells = [];
      
      // Iterate ONLY through the bounding box
      for (let r = viewLayout.minR; r <= viewLayout.maxR; r++) {
          for (let c = viewLayout.minC; c <= viewLayout.maxC; c++) {
              const i = r * puzzle.cols + c; // Calculate original index
              const cellData = puzzle.grid[i] || { type: 'block' }; // Fallback
              
              if (cellData.type === 'block') {
                  cells.push(<div key={i} className="w-16 h-16"></div>); // Transparent spacer
              } else {
                  // Render Active Cell
                  const item = placedItems[i];
                  const startNum = puzzle.numbers.find(n => n.indices[0] === i);
                  let boxStyle = "bg-white border-2 border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]";
                  if (feedback === 'correct') boxStyle = "bg-green-100 border-green-400";
                  if (feedback === 'wrong') boxStyle = "bg-red-50 border-red-300";

                  cells.push(
                    <div key={i} className="relative w-16 h-16">
                        {startNum && (
                            <div className="absolute -top-3 -left-3 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm z-10">
                                {startNum.id}
                            </div>
                        )}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, i)}
                            onClick={() => handleRemove(i)}
                            className={`w-full h-full rounded-xl flex items-center justify-center transition-colors ${boxStyle}`}
                        >
                            {item ? (
                                <div 
                                    draggable={!isRevealed}
                                    onDragStart={(e) => handleDragStart(e, item.value, item.id)}
                                    className={`cursor-grab active:cursor-grabbing ${isRevealed ? 'cursor-default' : ''}`}
                                >
                                    <Tile value={item.value} />
                                </div>
                            ) : (
                                <div className="w-2 h-2 bg-slate-200 rounded-full"></div> 
                            )}
                        </div>
                    </div>
                  );
              }
          }
      }
      return cells;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start relative">
      
      {/* LEFT COLUMN */}
      <div className="flex-1 w-full flex flex-col items-center">
          
          <div className={`w-full h-8 mb-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300 relative transition-opacity duration-500 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
              <div 
                 className={`h-full transition-all duration-1000 ease-linear ${timerColor}`} 
                 style={{ width: `${progressPercent}%` }}
              ></div>
              <div className="absolute top-0 w-full h-full flex items-center justify-center font-black text-slate-600 text-xs tracking-wider z-10">
                  {timeLeft}s REMAINING
              </div>
          </div>

          <div className="w-full bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Logic Constraints</h2>
              <div className="space-y-3">
                  {puzzle.clues.map((clue) => (
                      <div key={clue.id} className="flex gap-3 text-slate-700 font-semibold items-start">
                          <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold shrink-0 mt-0.5">
                              {clue.id}
                          </span>
                          <p className="leading-tight">{clue.text}</p>
                      </div>
                  ))}
              </div>
              {hasStarted && !isRevealed && (
                  <button 
                     onClick={() => handleReveal(false)}
                     className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 border border-slate-200 px-3 py-1 rounded-full hover:border-red-200"
                  >
                      <span>Reveal</span> 👁️
                  </button>
              )}
          </div>

          {!hasStarted ? (
              <div className="w-full bg-white/50 backdrop-blur-sm p-10 rounded-3xl border-4 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center animate-bounce-in">
                  <div className="text-5xl mb-4">⏱️</div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Ready to Solve?</h2>
                  <p className="text-slate-500 mb-6 font-medium max-w-xs">
                      You have <b>{initialTime} seconds</b> to arrange the numbers correctly according to the rules above.
                  </p>
                  <button 
                      onClick={handleStartGame}
                      className="px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all text-lg"
                  >
                      Start Challenge
                  </button>
              </div>
          ) : (
              <div className="animate-bounce-in w-full flex flex-col items-center">
                  {/* CROPPED GRID CONTAINER */}
                  <div className="bg-indigo-50/50 p-6 rounded-3xl border-4 border-indigo-100 shadow-inner inline-block">
                      <div 
                        className="grid gap-2 relative"
                        style={{ 
                            // Use dynamic width from bounding box logic
                            gridTemplateColumns: `repeat(${viewLayout?.width || 5}, minmax(0, 1fr))` 
                        }}
                      >
                        {renderCroppedGrid()}
                      </div>
                  </div>

                  <div className="h-20 mt-6 flex items-center justify-center w-full">
                    {isRevealed ? (
                        <div className="flex flex-col items-center gap-2 animate-bounce-in">
                            <span className="text-red-500 font-bold text-sm">
                                {timeLeft <= 0 ? "Time's Up!" : "Streak Lost"}
                            </span>
                            <button 
                                onClick={onSkip}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all"
                            >
                                Next Question ➡️
                            </button>
                        </div>
                    ) : (
                        message ? (
                            <div className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 animate-bounce-in shadow-sm ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                <span>{feedback === 'correct' ? '✅' : '❌'}</span>
                                {message}
                            </div>
                        ) : (
                            <button 
                                onClick={checkAnswers}
                                className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 hover:-translate-y-1 transition-all active:translate-y-0"
                            >
                                Verify Solution
                            </button>
                        )
                    )}
                  </div>
              </div>
          )}
      </div>

      {hasStarted && (
          <div className="w-full md:w-80 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 sticky top-24 animate-bounce-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-800 font-black text-lg">Number Tray</h3>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md">
                    {puzzle.inventory.length - usedIds.length} Left
                </span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 min-h-[200px]">
                  {usedIds.length === puzzle.inventory.length && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm font-medium py-10">
                          <span className="text-2xl mb-2">👍</span>
                          All tiles placed!
                      </div>
                  )}
                  <div className="flex flex-wrap gap-3 justify-center">
                      {puzzle.inventory.map((item) => {
                          const isUsed = usedIds.includes(item.id);
                          if (isUsed) return null; 
                          return (
                            <div
                                key={item.id}
                                draggable={!isRevealed}
                                onDragStart={(e) => handleDragStart(e, item.value, item.id)}
                                className={`${isRevealed ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <Tile value={item.value} />
                            </div>
                          )
                      })}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Game;