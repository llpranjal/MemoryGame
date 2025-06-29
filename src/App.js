import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Play, RotateCcw, Home } from 'lucide-react';
import { Button } from './components/Button';
import { cn } from './lib/utils';

/**
 * Memory Game - A React-based memory game where players memorize flashing squares
 * Features progressive difficulty, lives system, and modern dark gray responsive design
 */
const App = () => {
  // Game state management
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState('start'); // 'start', 'showing', 'playing', 'gameOver', 'levelComplete'
  const [gridSize, setGridSize] = useState(4); // 4x4 grid initially
  const [targetSquares, setTargetSquares] = useState(new Set());
  const [selectedSquares, setSelectedSquares] = useState(new Set());
  const [flashingSquares, setFlashingSquares] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);

  // Calculate number of squares to flash based on level
  const getSquaresToFlash = useCallback((currentLevel) => {
    return Math.min(2 + currentLevel, gridSize * gridSize - 1);
  }, [gridSize]);

  // Generate random squares to flash
  const generateTargetSquares = useCallback(() => {
    const totalSquares = gridSize * gridSize;
    const squaresToFlash = getSquaresToFlash(level);
    const squares = new Set();
    
    while (squares.size < squaresToFlash) {
      squares.add(Math.floor(Math.random() * totalSquares));
    }
    
    return squares;
  }, [level, gridSize, getSquaresToFlash]);

  // Start a new level
  const startLevel = useCallback(() => {
    setGameState('showing');
    setSelectedSquares(new Set());
    setMistakes(0);
    
    const targets = generateTargetSquares();
    setTargetSquares(targets);
    setFlashingSquares(targets);
    
    // Show pattern for 0.6 seconds (matching CSS animation), then start playing phase
    setTimeout(() => {
      setFlashingSquares(new Set());
      setGameState('playing');
    }, 600);
  }, [generateTargetSquares]);

  // Handle square click during playing phase
  const handleSquareClick = (squareIndex) => {
    if (gameState !== 'playing') return;
    
    const newSelected = new Set(selectedSquares);
    
    if (newSelected.has(squareIndex)) {
      // Deselect if already selected
      newSelected.delete(squareIndex);
    } else {
      // Select square
      newSelected.add(squareIndex);
      
      // Check if this square should be selected
      if (!targetSquares.has(squareIndex)) {
        setMistakes(prev => prev + 1);
      }
    }
    
    setSelectedSquares(newSelected);
  };

  // Check win/lose conditions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Check if player lost a life (3 mistakes)
    if (mistakes >= 3) {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setGameState('gameOver');
      } else {
        // Reset level but keep progress
        setTimeout(() => {
          startLevel();
        }, 600);
      }
      return;
    }
    
    // Check if level is complete (all correct squares selected, no wrong ones)
    if (selectedSquares.size === targetSquares.size) {
      let allCorrect = true;
      for (const square of selectedSquares) {
        if (!targetSquares.has(square)) {
          allCorrect = false;
          break;
        }
      }
      
      if (allCorrect) {
        setGameState('levelComplete');
        
        // Advance to next level after delay
        setTimeout(() => {
          const nextLevel = level + 1;
          setLevel(nextLevel);
          
          // Increase grid size every 3 levels
          if (nextLevel % 3 === 1 && nextLevel > 1) {
            setGridSize(prev => Math.min(prev + 1, 6));
          }
          
          startLevel();
        }, 800);
      }
    }
  }, [selectedSquares, targetSquares, mistakes, lives, gameState, level, startLevel]);

  // Start new game
  const startNewGame = () => {
    setLevel(1);
    setLives(3);
    setGridSize(4);
    setMistakes(0);
    startLevel();
  };

  // Reset game
  const resetGame = () => {
    setLevel(1);
    setLives(3);
    setGridSize(4);
    setGameState('start');
    setTargetSquares(new Set());
    setSelectedSquares(new Set());
    setFlashingSquares(new Set());
    setMistakes(0);
  };

  // Heart icon component with modern styling
  const HeartIcon = ({ filled = true }) => (
    <Heart
      className={cn(
        "w-7 h-7 md:w-9 md:h-9 transition-all duration-300",
        filled 
          ? "text-red-500 fill-red-500 heart-beat drop-shadow-lg" 
          : "text-gray-600 hover:text-gray-500"
      )}
    />
  );

  // Calculate square size based on grid size to maintain consistent total area
  const getSquareSize = useCallback(() => {
    // Base size starts large for 4x4, gets smaller as grid grows
    const baseSizes = {
      4: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32', // Large squares for 4x4
      5: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-26 lg:h-26', // Medium squares for 5x5
      6: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-22 lg:h-22', // Smaller squares for 6x6
    };
    return baseSizes[gridSize] || baseSizes[6];
  }, [gridSize]);

  // Render game grid with improved responsive design
  const renderGrid = () => {
    const squares = [];
    const totalSquares = gridSize * gridSize;
    
    for (let i = 0; i < totalSquares; i++) {
      const isFlashing = flashingSquares.has(i);
      const isSelected = selectedSquares.has(i);
      const isTarget = targetSquares.has(i);
      const isWrongSelection = isSelected && !isTarget && gameState === 'playing';
      
      squares.push(
        <button
          key={i}
          onClick={() => handleSquareClick(i)}
          disabled={gameState !== 'playing'}
          className={cn(
            "game-square aspect-square rounded-xl border-2 square-transition transform",
            "shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50",
            // Base styling
            isFlashing 
              ? "bg-primary border-primary shadow-primary/25" 
              : "bg-secondary border-border",
            // Selection states
            isSelected && !isWrongSelection && "bg-green-600 border-green-500 shadow-green-500/25",
            isWrongSelection && "bg-red-600 border-red-500 shadow-red-500/25",
            // Interactive states
            gameState === 'playing' && !isSelected && "hover:bg-accent hover:border-accent-foreground/20 hover:scale-105 active:scale-95",
            gameState !== 'playing' && "cursor-not-allowed opacity-60",
            // Responsive sizing
            getSquareSize()
          )}
        >
          {/* Optional: Add subtle inner glow for better visual feedback */}
          <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </button>
      );
    }
    
    return squares;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-background to-gray-950 opacity-90" />
      
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Memory Game
          </h1>
          
          {/* Game stats */}
          <div className="flex justify-center items-center space-x-12 mb-8">
            <div className="text-center">
              <p className="text-muted-foreground text-sm md:text-base mb-1">Level</p>
              <p className="text-3xl md:text-4xl font-bold text-primary">{level}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map(heart => (
                <HeartIcon key={heart} filled={heart <= lives} />
              ))}
            </div>
          </div>
        </div>

        {/* Game area - directly on background */}
        <div className="animate-fade-in">
          {gameState === 'start' && (
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Welcome to Memory Game!
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Watch the squares flash white, then click on the ones you remember!
              </p>
              <Button
                onClick={startNewGame}
                size="lg"
                className="text-xl font-bold px-12 py-6 bg-primary hover:bg-primary/90"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Game
              </Button>
            </div>
          )}

          {(gameState === 'showing' || gameState === 'playing' || gameState === 'levelComplete') && (
            <div className="space-y-6">
              {/* Game instructions */}
              <div className="text-center">
                {gameState === 'showing' && (
                  <p className="text-foreground text-lg md:text-xl font-semibold animate-pulse">
                    Watch carefully! Memorize the flashing squares...
                  </p>
                )}
                {gameState === 'playing' && (
                  <div className="space-y-2">
                    <p className="text-foreground text-lg md:text-xl font-semibold">
                      Click on the squares that flashed white!
                    </p>
                    <div className="flex justify-center space-x-8 text-sm md:text-base text-muted-foreground">
                      <span>Mistakes: {mistakes}/3</span>
                      <span>Need to find: {targetSquares.size} squares</span>
                    </div>
                  </div>
                )}
                {gameState === 'levelComplete' && (
                  <p className="text-green-400 text-lg md:text-xl font-semibold animate-bounce">
                    Level Complete! Moving to next level...
                  </p>
                )}
              </div>

              {/* Game grid - clean layout without background box */}
              <div className="flex justify-center">
                <div 
                  className={cn(
                    "grid gap-3 md:gap-4 mx-auto"
                  )}
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {renderGrid()}
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={resetGame}
                  variant="destructive"
                  size="lg"
                  className="font-semibold"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset Game
                </Button>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Game Over!
              </h2>
              <p className="text-xl mb-2 text-muted-foreground">
                You reached level {level}
              </p>
              <p className="text-lg mb-8 text-muted-foreground">
                Better luck next time!
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={startNewGame}
                  size="lg"
                  className="text-xl font-bold px-8 py-6"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Play Again
                </Button>
                <Button
                  onClick={resetGame}
                  variant="secondary"
                  size="lg"
                  className="text-xl font-bold px-8 py-6"
                >
                  <Home className="w-6 h-6 mr-2" />
                  Main Menu
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 text-muted-foreground animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
              <div className="bg-secondary/20 rounded-lg p-4 backdrop-blur-sm border border-border/30">
                <p className="font-semibold mb-2">How to Play</p>
                <ul className="text-left space-y-1">
                  <li>• Watch squares flash white</li>
                  <li>• Click remembered squares</li>
                  <li>• 3 mistakes = lose a life</li>
                </ul>
              </div>
              <div className="bg-secondary/20 rounded-lg p-4 backdrop-blur-sm border border-border/30">
                <p className="font-semibold mb-2">Game Features</p>
                <ul className="text-left space-y-1">
                  <li>• Progressive difficulty</li>
                  <li>• Expanding grid sizes</li>
                  <li>• Modern responsive design</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
