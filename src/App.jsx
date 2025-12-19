// src/App.jsx
import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import { generatePuzzle } from './utils/generator';
import confetti from 'canvas-confetti'; 

function App() {
  const [level, setLevel] = useState(1);       
  const [question, setQuestion] = useState(1); 
  const [puzzle, setPuzzle] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameComplete, setGameComplete] = useState(false); 

  useEffect(() => {
    if (!gameComplete) {
        const newPuzzle = generatePuzzle(level, question);
        setPuzzle(newPuzzle);
    }
  }, [level, question, gameComplete]);

  // --- TIMER LOGIC ---
  const getTimeLimit = (lvl) => {
      switch(lvl) {
          case 1: return 30;
          case 2: return 40;
          case 3: return 60;
          case 4: return 90;
          case 5: return 120;
          default: return 30;
      }
  };

  const handleNext = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setStreak(prev => prev + 1);
    goToNextQuestion();
  };

  const handleCheat = () => {
      setStreak(0); // Penalty for Reveal OR Time Up
  };

  const handleSkip = () => {
      goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (question < 5) {
        setQuestion(prev => prev + 1);
    } else {
        if (level < 5) {
            setShowLevelUp(true);
        } else {
            setGameComplete(true);
            confetti({ particleCount: 500, spread: 100, startVelocity: 60 });
        }
    }
  };

  const advanceLevel = () => {
      setShowLevelUp(false);
      setLevel(prev => prev + 1);
      setQuestion(1);
  };

  const restartGame = () => {
      setGameComplete(false);
      setLevel(1);
      setQuestion(1);
      setStreak(0);
  };

  if (gameComplete) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl shadow-2xl text-center border border-slate-700">
                <div className="text-6xl mb-6">🏆</div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">Challenge Conquered!</h1>
                <p className="text-slate-400 mb-8 font-medium">You solved every logic puzzle.</p>
                <div className="bg-slate-700/50 p-6 rounded-2xl mb-8 border border-slate-600">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Final Streak</div>
                    <div className="text-5xl font-black text-blue-400">{streak}</div>
                </div>
                <button onClick={restartGame} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-lg hover:shadow-lg transition-all">Play Again</button>
            </div>
        </div>
      );
  }

  if (!puzzle) return <div className="p-10 text-center font-bold text-indigo-600">Generating Puzzle...</div>;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-indigo-50 p-4 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">M</div>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 leading-tight">Logic Cross</h1>
                    <div className="text-xs text-indigo-500 font-medium tracking-wide">Level {level} • {getTimeLimit(level)}s Timer</div>
                </div>
              </div>

              <div className="flex gap-3 md:gap-8">
                  <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Streak</div>
                      <div className="text-xl font-black text-orange-500 flex items-center justify-center gap-1">{streak} <span className="text-sm">🔥</span></div>
                  </div>
                  <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</div>
                      <div className="text-xl font-black text-slate-700">{level}<span className="text-slate-300 text-sm">/5</span></div>
                  </div>
              </div>
          </div>
      </div>

      <div className="flex-grow flex items-center justify-center py-6 px-4">
          <Game 
            key={puzzle.id} 
            puzzle={puzzle} 
            initialTime={getTimeLimit(level)} // Pass the time limit
            onComplete={handleNext}
            onCheat={handleCheat}
            onSkip={handleSkip}
          />
      </div>

      {showLevelUp && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full animate-bounce-in border-4 border-indigo-50">
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Level {level} Done!</h2>
                  <p className="text-slate-500 mb-8 font-medium">Next Timer: {getTimeLimit(level+1)} Seconds</p>
                  <button onClick={advanceLevel} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-95">Start Level {level + 1}</button>
              </div>
          </div>
      )}
    </div>
  );
}

export default App;