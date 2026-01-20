// hooks/usePointsTicker.ts
"use client";

import { useEffect, useState } from "react";

export function usePointsTicker(points: number, rate: number) {
  const [display, setDisplay] = useState(points);

  useEffect(() => {
    const start = Date.now();
    const base = points;

    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setDisplay(base + elapsed * rate);
    }, 100);

    return () => clearInterval(id);
  }, [points, rate]);

  return display;
}
