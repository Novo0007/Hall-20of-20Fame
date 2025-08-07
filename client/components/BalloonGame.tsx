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

export const BalloonGame: React.FC<BalloonGameProps> = ({
  onShowLeaderboard,
}) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "paused">(
    "waiting",
  );
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });
  const [showScoreSubmitted, setShowScoreSubmitted] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  const [missedBalloons, setMissedBalloons] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const { user, getUserBestScore } = useUser();
  const { isDark } = useTheme();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const balloonIdCounter = useRef(0);
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const totalBalloonsRef = useRef(0);

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

  // Create a new balloon (only from top) - Professional speed scaling
  const createBalloon = useCallback((): Balloon => {
    const x = 50 + Math.random() * (gameArea.width - 100);
    const y = -50;
    // Professional speed scaling: starts moderate, increases with score
    const baseSpeed = 2.5 + score * 0.1; // Speed increases with score
    const speedY = baseSpeed + Math.random() * 2;

    totalBalloonsRef.current += 1;

    return {
      id: balloonIdCounter.current++,
      x,
      y,
      color:
        BALLOON_EMOJI_COLORS[
          Math.floor(Math.random() * BALLOON_EMOJI_COLORS.length)
        ],
      size: 35 + Math.random() * 15,
      speedY: Math.min(speedY, 8), // Cap max speed for fairness
      isPopping: false,
      isMissed: false,
    };
  }, [gameArea, score]);

  // Professional spawning logic: dynamic intervals based on score
  const startBalloonSpawning = useCallback(() => {
    const spawnInterval = () => {
      if (gameState === "playing") {
        setBalloons((prev) => [...prev, createBalloon()]);

        // Professional spawning: faster as score increases
        const baseInterval = 1500; // 1.5 seconds base
        const speedIncrease = Math.max(0, score * 50); // Decrease by 50ms per point
        const nextSpawnTime =
          Math.max(500, baseInterval - speedIncrease) + Math.random() * 500;

        spawnTimerRef.current = setTimeout(spawnInterval, nextSpawnTime);
      }
    };

    spawnInterval();
  }, [gameState, createBalloon, score]);

  // Game animation loop - Professional: smooth and consistent
  const animate = useCallback(() => {
    setBalloons((prevBalloons) => {
      return prevBalloons
        .map((balloon) => {
          const newBalloon = {
            ...balloon,
            y: balloon.y + balloon.speedY,
          };

          // Track missed balloons for analytics (no penalty)
          if (
            newBalloon.y > gameArea.height + 50 &&
            !newBalloon.isPopping &&
            !newBalloon.isMissed
          ) {
            newBalloon.isMissed = true;
            setMissedBalloons((prev) => prev + 1);

            // Update accuracy calculation
            const newMissed = missedBalloons + 1;
            const newAccuracy =
              totalBalloonsRef.current > 0
                ? Math.round(
                    ((totalBalloonsRef.current - newMissed) /
                      totalBalloonsRef.current) *
                      100,
                  )
                : 100;
            setAccuracy(newAccuracy);
          }

          return newBalloon;
        })
        .filter(
          (balloon) => balloon.y < gameArea.height + 100 && !balloon.isPopping,
        );
    });

    if (gameState === "playing") {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [gameArea, gameState, missedBalloons]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setMissedBalloons(0);
    setAccuracy(100);
    setBalloons([]);
    setShowScoreSubmitted(false);
    balloonIdCounter.current = 0;
    totalBalloonsRef.current = 0;
  };

  const endGame = async () => {
    setGameState("paused");

    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
    }

    if (user && score > 0) {
      const success = await Database.submitScore(user.id, score, "balloon_pop");
      if (success) {
        setShowScoreSubmitted(true);
        if (score > personalBest) {
          setPersonalBest(score);
        }
      }
    }
  };

  const popBalloon = (balloonId: number) => {
    setBalloons((prev) =>
      prev.map((balloon) =>
        balloon.id === balloonId ? { ...balloon, isPopping: true } : balloon,
      ),
    );
    setScore((prev) => prev + 1);

    // Update accuracy on successful pop
    const newAccuracy =
      totalBalloonsRef.current > 0
        ? Math.round(((score + 1) / totalBalloonsRef.current) * 100)
        : 100;
    setAccuracy(newAccuracy);

    setTimeout(() => {
      setBalloons((prev) => prev.filter((balloon) => balloon.id !== balloonId));
    }, 200);
  };

  useEffect(() => {
    if (gameState === "playing") {
      startBalloonSpawning();
    } else {
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
      {/* Claymorphism Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full mb-6 bg-gradient-to-r from-pink-200 to-purple-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] border border-white/20">
          <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg"></span>
          <span className="text-sm font-semibold text-purple-800">
            Professional Balloon Challenge
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
          🎈 Balloon Pop
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 font-medium">
          Professional balloon popping challenge! Speed increases with your
          score.
        </p>
      </div>

      {/* Enhanced Professional Stats Cards */}
      <div className="flex justify-center flex-wrap gap-4 mb-8">
        <div className="relative px-6 py-4 rounded-3xl bg-gradient-to-br from-red-200 to-pink-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.15)] border border-red-300/30">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-1 drop-shadow-sm">
              {score}
            </div>
            <div className="text-xs font-semibold text-red-800/80">Score</div>
          </div>
          {score > personalBest && score > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-300 to-orange-400 text-orange-900 text-xs font-bold px-2 py-1 rounded-full animate-pulse shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-yellow-200">
              NEW BEST!
            </div>
          )}
        </div>

        <div className="px-6 py-4 rounded-3xl bg-gradient-to-br from-blue-200 to-indigo-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.15)] border border-blue-300/30">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1 drop-shadow-sm">
              {accuracy}%
            </div>
            <div className="text-xs font-semibold text-blue-800/80">
              Accuracy
            </div>
          </div>
        </div>

        {personalBest > 0 && (
          <div className="px-6 py-4 rounded-3xl bg-gradient-to-br from-purple-200 to-violet-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.15)] border border-purple-300/30">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1 drop-shadow-sm">
                {personalBest}
              </div>
              <div className="text-xs font-semibold text-purple-800/80">
                Personal Best
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Claymorphism Game Area */}
      <div
        className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-[2rem] overflow-hidden touch-none bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-200 shadow-[inset_0_4px_8px_rgba(0,0,0,0.1),0_12px_32px_rgba(0,0,0,0.15)] border-2 border-blue-200/50"
        ref={gameAreaRef}
      >
        {/* Balloons with Claymorphism */}
        {balloons.map((balloon) => (
          <button
            key={balloon.id}
            className={`absolute transition-all duration-150 hover:scale-110 active:scale-95 touch-manipulation rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)] ${
              balloon.isPopping ? "animate-ping opacity-50" : ""
            } ${balloon.isMissed ? "opacity-20" : ""}`}
            style={{
              left: balloon.x - balloon.size / 2,
              top: balloon.y - balloon.size / 2,
              width: balloon.size,
              height: balloon.size,
              fontSize: balloon.size * 0.8,
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.1))",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            onClick={() => popBalloon(balloon.id)}
            onTouchStart={(e) => {
              e.preventDefault();
              popBalloon(balloon.id);
            }}
            disabled={
              balloon.isPopping || balloon.isMissed || gameState !== "playing"
            }
          >
            {balloon.color}
          </button>
        ))}

        {/* Game State Overlays with Claymorphism */}
        {gameState === "waiting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/80 to-blue-100/80 backdrop-blur-sm">
            <div className="text-center bg-gradient-to-br from-white to-pink-50 rounded-[2rem] p-10 mx-4 shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-white/50 max-w-sm">
              <div className="text-7xl mb-6 drop-shadow-lg">🎈</div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">
                Ready to Pop?
              </h3>
              <p className="text-slate-600 mb-8 text-lg">
                Professional challenge! Speed increases as you score!
              </p>
              <button
                onClick={startGame}
                className="w-full px-8 py-5 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl font-bold text-xl hover:from-red-500 hover:to-pink-600 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)] border border-red-300/30"
              >
                Start Popping!
              </button>
            </div>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/80 to-purple-100/80 backdrop-blur-sm">
            <div className="text-center bg-gradient-to-br from-white to-purple-50 rounded-[2rem] p-10 mx-4 shadow-[0_16px_40px_rgba(0,0,0,0.15)] border border-white/50 max-w-sm">
              <div className="text-7xl mb-6 drop-shadow-lg">🏆</div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">
                Game Finished!
              </h3>
              <p className="text-5xl font-bold text-red-500 mb-2 drop-shadow-sm">
                {score}
              </p>
              <p className="text-lg font-semibold text-blue-600 mb-4">
                Accuracy: {accuracy}%
              </p>
              {score > personalBest && score > 0 && (
                <p className="text-orange-600 font-bold mb-6 text-lg">
                  🎉 New Personal Best!
                </p>
              )}
              {showScoreSubmitted && (
                <p className="text-green-600 text-sm mb-6 font-semibold">
                  ✅ Score saved to Hall of Fame!
                </p>
              )}
              <div className="space-y-4">
                <button
                  onClick={startGame}
                  className="w-full px-6 py-4 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-2xl font-bold hover:from-red-500 hover:to-pink-600 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-red-300/30"
                >
                  Play Again
                </button>
                <button
                  onClick={onShowLeaderboard}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-400 to-blue-500 text-white rounded-2xl font-bold hover:from-purple-500 hover:to-blue-600 transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-purple-300/30"
                >
                  View Hall of Fame
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimal End Button with Claymorphism */}
        {gameState === "playing" && (
          <div className="absolute top-4 right-4">
            <button
              onClick={endGame}
              className="px-4 py-2 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-red-500 hover:to-pink-600 transition-all duration-200 shadow-[0_6px_16px_rgba(0,0,0,0.2)] border border-red-300/30"
            >
              End
            </button>
          </div>
        )}
      </div>

      {/* Professional Instructions */}
      <div className="mt-8 p-8 rounded-[2rem] bg-gradient-to-br from-green-100 to-blue-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.1)] border border-green-200/50">
        <h4 className="font-bold mb-4 flex items-center text-xl text-green-800">
          <span className="mr-3 text-2xl">🎯</span>
          Professional Rules
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium text-green-800">
                Balloons fall from the top with increasing speed
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium text-green-800">
                Tap/click balloons to pop them
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-xl">✓</span>
              <span className="font-medium text-green-800">
                Each popped balloon = +1 point
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-blue-500 text-xl">📊</span>
              <span className="font-medium text-blue-800">
                Track your accuracy percentage
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
