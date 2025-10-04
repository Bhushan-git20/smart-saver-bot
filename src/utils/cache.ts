/**
 * In-Memory Cache Utility
 * Simple caching layer to reduce repeated API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheUtils {
  private static cache = new Map<string, CacheEntry<unknown>>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data if valid
   */
  static get<T>(key: string, ttl = this.DEFAULT_TTL): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cache entry
   */
  static set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear specific cache entry
   */
  static clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  static clearAll(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  static clearExpired(ttl = this.DEFAULT_TTL): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }
}
