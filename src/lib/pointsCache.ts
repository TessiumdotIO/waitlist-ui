// lib/pointsCache.ts
export class PointsCache {
  private static CACHE_KEY = "user_points_cache";

  static save(userId: string, points: number, pointsRate: number) {
    try {
      sessionStorage.setItem(
        PointsCache.CACHE_KEY,
        JSON.stringify({
          userId,
          basePoints: points,
          pointsRate,
          lastUpdate: Date.now(),
        })
      );
    } catch (e) {
      console.warn("Failed to save points cache:", e);
    }
  }

  static load(userId: string): { points: number; pointsRate: number } | null {
    try {
      const cached = sessionStorage.getItem(PointsCache.CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      if (data.userId !== userId) return null;

      const elapsedSeconds = (Date.now() - data.lastUpdate) / 1000;
      const currentPoints = data.basePoints + elapsedSeconds * data.pointsRate;

      return {
        points: currentPoints,
        pointsRate: data.pointsRate,
      };
    } catch {
      return null;
    }
  }

  static clear() {
    try {
      sessionStorage.removeItem(PointsCache.CACHE_KEY);
    } catch (e) {
      console.warn("Failed to clear points cache:", e);
    }
  }
}
