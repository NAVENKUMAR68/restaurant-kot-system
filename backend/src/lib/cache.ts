/**
 * Simple in-memory cache utility for short-lived data (e.g., menu items).
 * Invalidate on any create/update/delete operation.
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Get a cached value. Returns null if missing or expired.
 */
export function cacheGet<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

/**
 * Store a value in cache with a TTL in milliseconds.
 * Default TTL: 5 minutes.
 */
export function cacheSet<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Invalidate (delete) a specific cache key.
 */
export function cacheInvalidate(key: string): void {
    store.delete(key);
}

// Cache key constants
export const CACHE_KEYS = {
    MENU: 'menu:all',
};
