import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { Database } from '../lib/supabase';

interface Point {
  x: number;
  y: number;
}

interface PerfectCircleProps {
  onShowLeaderboard?: () => void;
}

export const PerfectCircle: React.FC<PerfectCircleProps> = ({ onShowLeaderboard }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [centerPoint, setCenterPoint] = useState<Point>({ x: 0, y: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  const { user, userBestScore, refreshUserBestScore } = useUser();

  const calculateCircleAccuracy = useCallback((drawnPoints: Point[], center: Point): number => {
    if (drawnPoints.length < 5) {
      console.log('Not enough points:', drawnPoints.length);
      return 0;
    }

    // Calculate the actual center of the drawn points (centroid)
    const actualCenter = {
      x: drawnPoints.reduce((sum, p) => sum + p.x, 0) / drawnPoints.length,
      y: drawnPoints.reduce((sum, p) => sum + p.y, 0) / drawnPoints.length,
    };

    // Calculate the average radius from the actual center
    const radii = drawnPoints.map(point =>
      Math.sqrt(Math.pow(point.x - actualCenter.x, 2) + Math.pow(point.y - actualCenter.y, 2))
    );
    const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;

    // Calculate how much each point deviates from the average radius
    const deviations = radii.map(radius => Math.abs(radius - avgRadius));
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;

    // More forgiving scoring system
    const relativeDeviation = avgDeviation / avgRadius; // 0 = perfect, 1 = very bad

    console.log('Debug info:', {
      pointCount: drawnPoints.length,
      avgRadius: avgRadius.toFixed(2),
      avgDeviation: avgDeviation.toFixed(2),
      relativeDeviation: relativeDeviation.toFixed(3),
    });

    // Convert to percentage (more generous curve)
    let accuracy;
    if (relativeDeviation <= 0.05) { // Very good (within 5%)
      accuracy = 100 - (relativeDeviation / 0.05) * 10; // 90-100%
    } else if (relativeDeviation <= 0.15) { // Good (5-15%)
      accuracy = 90 - ((relativeDeviation - 0.05) / 0.10) * 30; // 60-90%
    } else if (relativeDeviation <= 0.30) { // Okay (15-30%)
      accuracy = 60 - ((relativeDeviation - 0.15) / 0.15) * 40; // 20-60%
    } else { // Poor (30%+)
      accuracy = Math.max(0, 20 - ((relativeDeviation - 0.30) / 0.20) * 20); // 0-20%
    }

    console.log('Final accuracy:', accuracy.toFixed(1));
    return Math.min(100, Math.max(0, accuracy));
  }, []);

  const getEventPosition = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getEventPosition(e);
    setCenterPoint(point);
    setIsDrawing(true);
    setPoints([point]);
    setScore(null);
    setShowResult(false);
  }, [getEventPosition]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getEventPosition(e);
    setPoints(prev => [...prev, point]);
  }, [isDrawing, getEventPosition]);

  const stopDrawing = useCallback(async () => {
    if (!isDrawing || points.length < 5) {
      setIsDrawing(false);
      return;
    }

    const accuracy = calculateCircleAccuracy(points, centerPoint);
    setScore(accuracy);
    setIsDrawing(false);
    setShowResult(true);

    // Submit score if user is available
    if (user && accuracy > 0) {
      setIsSubmittingScore(true);
      try {
        const isNewBestScore = accuracy > userBestScore;
        setIsNewBest(isNewBestScore);

        const success = await Database.submitScore(user.id, accuracy);
        if (success && isNewBestScore) {
          await refreshUserBestScore();
        }
      } catch (error) {
        console.error('Error submitting score:', error);
      } finally {
        setIsSubmittingScore(false);
      }
    }
  }, [isDrawing, points, centerPoint, calculateCircleAccuracy, user, userBestScore, refreshUserBestScore]);

  const resetCanvas = useCallback(() => {
    setPoints([]);
    setScore(null);
    setIsDrawing(false);
    setShowResult(false);
    setIsSubmittingScore(false);
    setIsNewBest(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the path
    if (points.length > 1) {
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }

    // Draw perfect circle comparison if we have a score
    if (showResult && points.length > 0) {
      // Calculate the actual center of the drawn points
      const actualCenter = {
        x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
      };

      const radii = points.map(point =>
        Math.sqrt(Math.pow(point.x - actualCenter.x, 2) + Math.pow(point.y - actualCenter.y, 2))
      );
      const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(actualCenter.x, actualCenter.y, avgRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [points, showResult, centerPoint]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 95) return 'Perfect! 🎯';
    if (score >= 90) return 'Excellent! 🌟';
    if (score >= 80) return 'Great! 👍';
    if (score >= 70) return 'Good! 👌';
    if (score >= 60) return 'Not bad! 🙂';
    if (score >= 50) return 'Keep trying! 💪';
    return 'Practice more! 📈';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-slate-700 text-sm font-medium">Challenge Your Precision</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-4">
          Perfect Circle
        </h1>
        <p className="text-slate-600 text-xl md:text-2xl mb-2">
          Test your drawing skills with the ultimate precision challenge
        </p>
        <p className="text-slate-500 text-base md:text-lg">
          Draw the most perfect circle you can and compete with players worldwide
        </p>
      </div>

      {/* Game Canvas */}
      <div className="relative mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="rounded-2xl bg-slate-50 cursor-crosshair touch-none shadow-inner border-2 border-slate-100"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {!isDrawing && points.length === 0 && (
            <div className="absolute inset-8 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <span className="text-white text-2xl">⭕</span>
                </div>
                <p className="text-slate-600 font-medium">Click and drag to draw</p>
                <p className="text-slate-400 text-sm mt-1">Create the most perfect circle you can</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showResult && score !== null && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 mb-8 max-w-md mx-auto">
          <div className="text-center">
            <div className={`text-7xl font-bold mb-4 ${getScoreColor(score)}`}>
              {score.toFixed(1)}%
            </div>

            {/* Rating Bar 0-100% */}
            <div className="w-full mb-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>0%</span>
                <span className="font-medium">Accuracy Rate</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-1000 ease-out shadow-sm ${
                    score >= 90 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                    score >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    score >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Poor</span>
                <span>Good</span>
                <span>Perfect</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-2xl font-semibold text-slate-800">
                {getScoreMessage(score)}
                {isNewBest && (
                  <span className="block mt-2">
                    <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      <span>🎉</span>
                      <span>New Personal Best!</span>
                    </span>
                  </span>
                )}
              </p>

              {isSubmittingScore && (
                <p className="text-slate-600 text-sm flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving score...</span>
                </p>
              )}

              <p className="text-slate-500 text-sm">
                Green dashed line shows perfect circle
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={resetCanvas}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          {showResult ? 'Try Again' : 'Clear'}
        </button>

        {onShowLeaderboard && (
          <button
            onClick={onShowLeaderboard}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
          >
            🏆 View Leaderboard
          </button>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
        <p>
          <strong>Tips:</strong> Use steady movements, draw with your whole arm, 
          and try to maintain consistent speed around the circle.
        </p>
      </div>
    </div>
  );
};
