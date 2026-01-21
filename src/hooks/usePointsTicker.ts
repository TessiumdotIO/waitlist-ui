import { useState, useEffect, useRef } from "react";

export function usePointsTicker(basePoints: number, pointsRate: number) {
  const [displayPoints, setDisplayPoints] = useState(basePoints);
  const startTimeRef = useRef(Date.now());
  const basePointsRef = useRef(basePoints);

  // Update refs when base points change (from database sync)
  useEffect(() => {
    basePointsRef.current = basePoints;
    startTimeRef.current = Date.now();
    setDisplayPoints(basePoints);
  }, [basePoints]);

  // Ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const newPoints = basePointsRef.current + elapsed * pointsRate;
      setDisplayPoints(newPoints);
    }, 100);

    return () => clearInterval(interval);
  }, [pointsRate]);

  return displayPoints;
}
