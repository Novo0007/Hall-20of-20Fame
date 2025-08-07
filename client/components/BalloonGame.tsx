import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import { Database } from "../lib/supabase";

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedY: number;
  isPopping: boolean;
  isMissed: boolean;
}

interface BalloonGameProps {
  onShowLeaderboard: () => void;
}

const BALLOON_EMOJI_COLORS = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];

export const BalloonGame: React.FC<BalloonGameProps> = ({ onShowLeaderboard }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "paused">("waiting");
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });
  const [showScoreSubmitted, setShowScoreSubmitted] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  const { user, getUserBestScore } = useUser();
  const { isDark } = useTheme();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const balloonIdCounter = useRef(0);
  const spawnTimerRef = useRef<NodeJS.Timeout>();

  // Load personal best on mount
  useEffect(() => {
    if (user) {
      setPersonalBest(getUserBestScore("balloon_pop"));
    }
  }, [user, getUserBestScore]);

  // Set up game area dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setGameArea({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Create a new balloon (only from top)
  const createBalloon = useCallback((): Balloon => {
    const x = 50 + Math.random() * (gameArea.width - 100); // Random X position with margins
    const y = -50; // Always start from top
    const speedY = 1.5 + Math.random() * 2; // Smooth consistent speed downward

    return {
      id: balloonIdCounter.current++,
      x,
      y,
      color: BALLOON_EMOJI_COLORS[Math.floor(Math.random() * BALLOON_EMOJI_COLORS.length)],
      size: 35 + Math.random() * 15,
      speedY,
      isPopping: false,
      isMissed: false,
    };
  }, [gameArea]);

  // Continuous balloon spawning
  const startBalloonSpawning = useCallback(() => {
    const spawnInterval = () => {
      if (gameState === "playing") {
        setBalloons(prev => [...prev, createBalloon()]);
        
        // Schedule next spawn with slight randomness (1-3 seconds)
        const nextSpawnTime = 1000 + Math.random() * 2000;
        spawnTimerRef.current = setTimeout(spawnInterval, nextSpawnTime);
      }
    };
    
    // Initial spawn
    spawnInterval();
  }, [gameState, createBalloon]);

  // Game animation loop
  const animate = useCallback(() => {
    setBalloons(prevBalloons => {
      return prevBalloons
        .map(balloon => {
          const newBalloon = {
            ...balloon,
            y: balloon.y + balloon.speedY,
          };
          
          // Check if balloon missed (went past bottom)
          if (newBalloon.y > gameArea.height + 50 && !newBalloon.isPopping && !newBalloon.isMissed) {
            newBalloon.isMissed = true;
            // Penalty: -1 point for missing a balloon
            setScore(prev => Math.max(0, prev - 1));
          }
          
          return newBalloon;
        })
        .filter(balloon => 
          balloon.y < gameArea.height + 100 && // Remove balloons that are way off screen
          !balloon.isPopping
        );
    });

    if (gameState === "playing") {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [gameArea, gameState]);

  // Start game
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setBalloons([]);
    setShowScoreSubmitted(false);
    balloonIdCounter.current = 0;
  };

  // End game manually
  const endGame = async () => {
    setGameState("paused");
    
    // Clear spawn timer
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }
    
    if (user && score > 0) {
      const success = await Database.submitScore(user.id, score, "balloon_pop");
      if (success) {
        setShowScoreSubmitted(true);
        // Update personal best if this score is higher
        if (score > personalBest) {
          setPersonalBest(score);
        }
      }
    }
  };

  // Pop balloon
  const popBalloon = (balloonId: number) => {
    setBalloons(prev => 
      prev.map(balloon => 
        balloon.id === balloonId 
          ? { ...balloon, isPopping: true }
          : balloon
      )
    );
    setScore(prev => prev + 1); // 1 point per balloon
    
    // Remove popped balloon after animation
    setTimeout(() => {
      setBalloons(prev => prev.filter(balloon => balloon.id !== balloonId));
    }, 200);
  };

  // Start balloon spawning when game starts
  useEffect(() => {
    if (gameState === "playing") {
      startBalloonSpawning();
    } else {
      // Clear spawn timer when game stops
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    }
    
    return () => {
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    };
  }, [gameState, startBalloonSpawning]);

  // Animation loop
  useEffect(() => {
    if (gameState === "playing") {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, animate]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Game Header */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4 ${
            isDark
              ? "bg-gradient-to-r from-red-800/30 to-pink-800/30"
              : "bg-gradient-to-r from-red-100 to-pink-100"
          }`}
        >
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span
            className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            Smooth Balloon Challenge
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
          🎈 Balloon Pop
        </h1>
        <p
          className={`text-base sm:text-lg ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          Pop balloons as they fall! Miss one and lose a point.
        </p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center space-x-6 mb-8">
        <div
          className={`relative px-6 py-4 rounded-2xl ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
          } border shadow-lg`}
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-red-500 mb-1">{score}</div>
            <div className="text-sm font-medium text-slate-500">Current Score</div>
          </div>
          {score > personalBest && score > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              NEW BEST!
            </div>
          )}
        </div>
        
        {personalBest > 0 && (
          <div
            className={`px-6 py-4 rounded-2xl ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
            } border shadow-lg`}
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-1">{personalBest}</div>
              <div className="text-sm font-medium text-slate-500">Personal Best</div>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div
        className={`relative w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-3xl border-2 border-dashed overflow-hidden touch-none ${
          isDark 
            ? "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-600" 
            : "bg-gradient-to-br from-sky-50 to-blue-100 border-blue-300"
        }`}
        ref={gameAreaRef}
      >
        {/* Balloons */}
        {balloons.map((balloon) => (
          <button
            key={balloon.id}
            className={`absolute transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation ${
              balloon.isPopping ? "animate-ping opacity-50" : "hover:shadow-lg"
            } ${balloon.isMissed ? "opacity-30" : ""}`}
            style={{
              left: balloon.x - balloon.size / 2,
              top: balloon.y - balloon.size / 2,
              width: balloon.size,
              height: balloon.size,
              fontSize: balloon.size * 0.8,
            }}
            onClick={() => popBalloon(balloon.id)}
            onTouchStart={(e) => {
              e.preventDefault();
              popBalloon(balloon.id);
            }}
            disabled={balloon.isPopping || balloon.isMissed || gameState !== "playing"}
          >
            {balloon.color}
          </button>
        ))}

        {/* Game State Overlay */}
        {gameState === "waiting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="text-center bg-white rounded-3xl p-8 mx-4 shadow-2xl max-w-sm">
              <div className="text-6xl mb-4">🎈</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Pop?</h3>
              <p className="text-slate-600 mb-6">Balloons fall from the top. Don't let them escape!</p>
              <button
                onClick={startGame}
                className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
              >
                Start Popping!
              </button>
            </div>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="text-center bg-white rounded-3xl p-8 mx-4 shadow-2xl max-w-sm">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Game Finished!</h3>
              <p className="text-4xl font-bold text-red-500 mb-2">{score} Points</p>
              {score > personalBest && score > 0 && (
                <p className="text-orange-600 font-semibold mb-4">🎉 New Personal Best!</p>
              )}
              {showScoreSubmitted && (
                <p className="text-green-600 text-sm mb-4">✅ Score saved to Hall of Fame!</p>
              )}
              <div className="space-y-3">
                <button
                  onClick={startGame}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                >
                  Play Again
                </button>
                <button
                  onClick={onShowLeaderboard}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                >
                  View Hall of Fame
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimal Game Controls (only during play) */}
        {gameState === "playing" && (
          <div className="absolute top-2 right-2">
            <button
              onClick={endGame}
              className="px-3 py-1 bg-red-500/80 text-white rounded-lg text-xs font-medium hover:bg-red-500 transition-all duration-200"
            >
              End
            </button>
          </div>
        )}
      </div>

      {/* Game Instructions */}
      <div className={`mt-8 p-6 rounded-2xl ${isDark ? "bg-gray-800" : "bg-slate-50"}`}>
        <h4 className="font-semibold mb-3 flex items-center text-lg">
          <span className="mr-2">🎯</span>
          How to Play
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Balloons fall smoothly from the top</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Tap/click balloons to pop them</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Each popped balloon = +1 point</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠</span>
              <span>Each missed balloon = -1 point</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
