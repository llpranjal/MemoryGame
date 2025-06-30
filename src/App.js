import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [gridSize, setGridSize] = useState(3); // 3x3 grid initially for level 1
  const [targetSquares, setTargetSquares] = useState(new Set());
  const [selectedSquares, setSelectedSquares] = useState(new Set());
  const [flashingSquares, setFlashingSquares] = useState(new Set());
  const [mistakes, setMistakes] = useState(0);
  
  // Animation state management
  const [flippingSquares, setFlippingSquares] = useState(new Set());
  const [selectingSquares, setSelectingSquares] = useState(new Set());
  const [errorSquares, setErrorSquares] = useState(new Set()); // For red flash on 3 mistakes

  // Ref to track active timeouts for cleanup
  const timeoutsRef = useRef([]);

  // Clear all active timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  }, []);

  // Helper function to create tracked timeouts
  const createTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
      // Remove from tracking array when completed
      timeoutsRef.current = timeoutsRef.current.filter(id => id !== timeoutId);
    }, delay);
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  }, []);

  // Game progression
  const getSquaresToFlash = useCallback((currentLevel) => {
    return Math.min(2 + currentLevel, 25); // Start with 3, max 25
  }, []);

  const getGridSize = useCallback((currentLevel) => {
    if (currentLevel <= 2) return 3;
    if (currentLevel <= 5) return 4;
    if (currentLevel <= 8) return 5;
    if (currentLevel <= 13) return 6;
    return 7;
  }, []);

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
    clearAllTimeouts();
    
    // Clear states
    setFlashingSquares(new Set());
    setFlippingSquares(new Set());
    setSelectingSquares(new Set());
    setSelectedSquares(new Set());
    setErrorSquares(new Set());
    setMistakes(0);
    
    const targets = generateTargetSquares();
    setTargetSquares(targets);
    setGameState('showing');
    
    // Show pattern with animation
    createTimeout(() => {
      // First flip - start of reveal
      setFlippingSquares(targets);
      createTimeout(() => setFlashingSquares(targets), 50);
      createTimeout(() => setFlippingSquares(new Set()), 250);
      
      // Second flip - end of reveal (same duration as start)
      createTimeout(() => {
        setFlippingSquares(targets);
        createTimeout(() => setFlippingSquares(new Set()), 250);
        createTimeout(() => {
          setFlashingSquares(new Set());
          setGameState('playing');
        }, 50);
      }, 1000); // Start second flip 1 second into the reveal
    }, level === 1 ? 800 : 300);
  }, [generateTargetSquares, level, clearAllTimeouts, createTimeout]);

  // Handle square click
  const handleSquareClick = useCallback((squareIndex) => {
    if (gameState !== 'playing') return;
    
    // Add selection animation
    setSelectingSquares(prev => new Set(prev).add(squareIndex));
    createTimeout(() => {
      setSelectingSquares(prev => {
        const updated = new Set(prev);
        updated.delete(squareIndex);
        return updated;
      });
    }, 200);
    
    // Toggle selection with mistake tracking
    setSelectedSquares(prev => {
      const newSelected = new Set(prev);
      const wasSelected = newSelected.has(squareIndex);
      
      if (wasSelected) {
        // Deselecting - just remove it
        newSelected.delete(squareIndex);
      } else {
        // Selecting - add it and check if it's wrong (but don't increment here)
        newSelected.add(squareIndex);
      }
      return newSelected;
    });
    
    // Handle mistake increment separately to avoid double increment
    if (!selectedSquares.has(squareIndex) && !targetSquares.has(squareIndex)) {
      setMistakes(prev => {
        console.log('Incrementing mistakes from', prev, 'to', prev + 1);
        return prev + 1;
      });
    }
  }, [gameState, selectedSquares, targetSquares, createTimeout]);

  // Check win/lose conditions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Check if player lost a life (3 mistakes)
    if (mistakes >= 3) {
      // Flash all wrong selections red
      const wrongSelections = [...selectedSquares].filter(square => !targetSquares.has(square));
      setErrorSquares(new Set(wrongSelections));
      
      // Clear red flash after animation
      createTimeout(() => setErrorSquares(new Set()), 500);
      
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setGameState('gameOver');
      } else {
        // Retry the same level, reset mistakes to 0
        setGameState('showing');
        createTimeout(() => {
          setMistakes(0); // Reset mistakes when losing a life
          startLevel();
        }, 600);
      }
      return;
    }
    
    // Check level complete - all target squares must be selected (regardless of wrong selections)
    if (selectedSquares.size > 0) {
      const allTargetsSelected = [...targetSquares].every(square => selectedSquares.has(square));
      if (allTargetsSelected) {
        setGameState('levelComplete');
        createTimeout(() => {
          setLevel(prev => prev + 1);
          setGridSize(getGridSize(level + 1));
          setMistakes(0); // Reset mistakes when passing a round
          [setFlashingSquares, setSelectedSquares, setTargetSquares, setFlippingSquares, setSelectingSquares, setErrorSquares]
            .forEach(setter => setter(new Set()));
          startLevel();
        }, 800);
      }
    }
  }, [selectedSquares, targetSquares, mistakes, lives, gameState, level, startLevel, getGridSize, createTimeout]);

  // Cleanup effect to clear timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  // Game controls
  const startNewGame = () => {
    clearAllTimeouts();
    setLevel(1);
    setLives(3);
    setGridSize(3);
    setMistakes(0);
    [setFlashingSquares, setSelectedSquares, setTargetSquares, setFlippingSquares, setSelectingSquares, setErrorSquares]
      .forEach(setter => setter(new Set()));
    startLevel();
  };

  const resetGame = () => {
    clearAllTimeouts();
    // Reset all game state to initial values
    setLevel(1);
    setLives(3);
    setGridSize(3); // 3x3 grid for level 1
    setGameState('start'); // Back to start screen
    setMistakes(0);
    // Clear all square states
    [setTargetSquares, setSelectedSquares, setFlashingSquares, setFlippingSquares, setSelectingSquares, setErrorSquares]
      .forEach(setter => setter(new Set()));
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

  // Calculate square size based on grid size
  const getSquareSize = useCallback(() => {
    const sizes = {
      3: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36', // Large for 3x3
      4: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32', // Medium for 4x4
      5: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-26 lg:h-26', // Small for 5x5
      6: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-22 lg:h-22', // Smaller for 6x6
      7: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18', // Smallest for 7x7
    };
    return sizes[gridSize] || sizes[7];
  }, [gridSize]);

  // Render game grid
  const renderGrid = () => {
    const squares = [];
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      const isFlashing = flashingSquares.has(i);
      const isSelected = selectedSquares.has(i);
      const isTarget = targetSquares.has(i);
      const isWrongSelection = isSelected && !isTarget;
      const isCorrectSelection = isSelected && isTarget;
      const isFlipping = flippingSquares.has(i);
      const isSelecting = selectingSquares.has(i);
      const isError = errorSquares.has(i);
      
      squares.push(
        <button
          key={i}
          onClick={() => handleSquareClick(i)}
          disabled={gameState !== 'playing'}
          className={cn(
            "game-square aspect-square rounded-xl border-2 transition-all duration-150",
            "shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50",
            // Animations
            isFlipping && "square-flip",
            isSelecting && "square-select-flip",
            // Base styling
            isFlashing ? "bg-primary border-primary shadow-primary/25" : "bg-secondary border-border",
            // Selection states - only show green if ALL targets are selected and no wrong selections
            isCorrectSelection && mistakes === 0 && "bg-green-600 border-green-500 shadow-green-500/25",
            isWrongSelection && !isError && "bg-gray-200 border-gray-300 shadow-gray-200/25", // Sort of white for incorrect
            isError && "bg-red-500 border-red-400 shadow-red-500/25", // Red flash for mistakes
            // Interactive states
            gameState === 'playing' && !isSelected && "hover:bg-accent hover:border-accent-foreground/20 hover:scale-105",
            gameState !== 'playing' && "cursor-not-allowed opacity-60",
            getSquareSize()
          )}
        />
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
              {/* Game instructions - fixed height container to prevent board jumping */}
              <div className="text-center h-20 flex flex-col justify-center">
                {gameState === 'showing' && (
                  <div className="space-y-2">
                    <p className="text-foreground text-lg md:text-xl font-semibold animate-pulse">
                      Watch carefully! Memorize the flashing squares...
                    </p>
                    <div className="flex justify-center space-x-8 text-sm md:text-base text-muted-foreground">
                      <span>Mistakes: {mistakes}/3</span>
                      <span>Need to find: {targetSquares.size} squares</span>
                    </div>
                  </div>
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
                  <div className="space-y-2">
                    <p className="text-green-400 text-lg md:text-xl font-semibold animate-bounce">
                      Level Complete! Moving to next level...
                    </p>
                    <div className="flex justify-center space-x-8 text-sm md:text-base text-muted-foreground">
                      <span>Mistakes: {mistakes}/3</span>
                      <span>Need to find: {targetSquares.size} squares</span>
                    </div>
                  </div>
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
