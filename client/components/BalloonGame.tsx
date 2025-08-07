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
  speedX: number;
  speedY: number;
  isPopping: boolean;
}

interface BalloonGameProps {
  onShowLeaderboard: () => void;
}

const GAME_TIME = 30; // 30 seconds
const BALLOON_COLORS = ["🎈", "🎈", "🎈", "🎈", "🎈"];
const BALLOON_EMOJI_COLORS = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];

export const BalloonGame: React.FC<BalloonGameProps> = ({ onShowLeaderboard }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "finished">("waiting");
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });
  const [showScoreSubmitted, setShowScoreSubmitted] = useState(false);
  const { user } = useUser();
  const { isDark } = useTheme();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const balloonIdCounter = useRef(0);

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

  // Create a new balloon
  const createBalloon = useCallback((): Balloon => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y, speedX, speedY;

    switch (side) {
      case 0: // top
        x = Math.random() * gameArea.width;
        y = -50;
        speedX = (Math.random() - 0.5) * 2;
        speedY = 1 + Math.random() * 2;
        break;
      case 1: // right
        x = gameArea.width + 50;
        y = Math.random() * gameArea.height;
        speedX = -(1 + Math.random() * 2);
        speedY = (Math.random() - 0.5) * 2;
        break;
      case 2: // bottom
        x = Math.random() * gameArea.width;
        y = gameArea.height + 50;
        speedX = (Math.random() - 0.5) * 2;
        speedY = -(1 + Math.random() * 2);
        break;
      default: // left
        x = -50;
        y = Math.random() * gameArea.height;
        speedX = 1 + Math.random() * 2;
        speedY = (Math.random() - 0.5) * 2;
        break;
    }

    return {
      id: balloonIdCounter.current++,
      x,
      y,
      color: BALLOON_EMOJI_COLORS[Math.floor(Math.random() * BALLOON_EMOJI_COLORS.length)],
      size: 30 + Math.random() * 20,
      speedX,
      speedY,
      isPopping: false,
    };
  }, [gameArea]);

  // Game animation loop
  const animate = useCallback(() => {
    setBalloons(prevBalloons => {
      return prevBalloons
        .map(balloon => ({
          ...balloon,
          x: balloon.x + balloon.speedX,
          y: balloon.y + balloon.speedY,
        }))
        .filter(balloon => 
          balloon.x > -100 && 
          balloon.x < gameArea.width + 100 && 
          balloon.y > -100 && 
          balloon.y < gameArea.height + 100 &&
          !balloon.isPopping
        );
    });

    // Add new balloons randomly
    if (Math.random() < 0.03) {
      setBalloons(prev => [...prev, createBalloon()]);
    }

    if (gameState === "playing") {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [gameArea, createBalloon, gameState]);

  // Start game
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(GAME_TIME);
    setBalloons([]);
    setShowScoreSubmitted(false);
    balloonIdCounter.current = 0;
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
    setScore(prev => prev + 1);
    
    // Remove popped balloon after animation
    setTimeout(() => {
      setBalloons(prev => prev.filter(balloon => balloon.id !== balloonId));
    }, 200);
  };

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("finished");
      if (user) {
        Database.submitScore(user.id, score, "balloon_pop").then(success => {
          if (success) {
            setShowScoreSubmitted(true);
          }
        });
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, user, score]);

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
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full mb-4 ${
            isDark
              ? "bg-gradient-to-r from-red-800/30 to-pink-800/30"
              : "bg-gradient-to-r from-red-100 to-pink-100"
          }`}
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          <span
            className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            Balloon Popping Challenge
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
          🎈 Balloon Pop
        </h1>
        <p
          className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          Pop as many balloons as you can in {GAME_TIME} seconds!
        </p>
      </div>

      {/* Game Stats */}
      <div className="flex justify-center space-x-4 mb-6">
        <div
          className={`px-4 py-2 rounded-xl ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
          } border shadow-sm`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{score}</div>
            <div className="text-xs text-slate-500">Score</div>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-xl ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
          } border shadow-sm`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{timeLeft}</div>
            <div className="text-xs text-slate-500">Time</div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        className={`relative w-full h-96 sm:h-[500px] rounded-3xl border-2 border-dashed overflow-hidden touch-none ${
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
            className={`absolute transition-all duration-200 hover:scale-110 active:scale-95 ${
              balloon.isPopping ? "animate-ping opacity-50" : ""
            }`}
            style={{
              left: balloon.x - balloon.size / 2,
              top: balloon.y - balloon.size / 2,
              width: balloon.size,
              height: balloon.size,
              fontSize: balloon.size * 0.8,
            }}
            onClick={() => popBalloon(balloon.id)}
            disabled={balloon.isPopping || gameState !== "playing"}
          >
            {balloon.color}
          </button>
        ))}

        {/* Game State Overlay */}
        {gameState === "waiting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-6xl mb-4">🎈</div>
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Pop?</h3>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="text-center bg-white rounded-3xl p-8 mx-4 shadow-2xl">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Game Over!</h3>
              <p className="text-4xl font-bold text-red-500 mb-4">{score} Balloons</p>
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

        {/* Instructions */}
        {gameState === "waiting" && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Tap balloons to pop them! 📱👆
            </p>
          </div>
        )}
      </div>

      {/* Game Instructions */}
      <div className={`mt-6 p-4 rounded-2xl ${isDark ? "bg-gray-800" : "bg-slate-50"}`}>
        <h4 className="font-semibold mb-2 flex items-center">
          <span className="mr-2">🎯</span>
          How to Play
        </h4>
        <ul className="text-sm space-y-1">
          <li>• Balloons appear from all sides of the screen</li>
          <li>• Tap/click balloons to pop them and score points</li>
          <li>• You have {GAME_TIME} seconds to pop as many as possible</li>
          <li>• Your highest score gets saved to the Hall of Fame</li>
        </ul>
      </div>
    </div>
  );
};
