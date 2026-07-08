import { Redis } from 'ioredis';
import type { Kv } from '../types.js';

export function createKv(redisUrl: string): Kv & { close(): Promise<void> } {
  const redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });
  return {
    async get(key) {
      return redis.get(key);
    },
    async setNx(key, value, ttlSeconds) {
      const res = await redis.set(key, value, 'EX', ttlSeconds, 'NX');
      return res === 'OK';
    },
    async set(key, value, ttlSeconds) {
      await redis.set(key, value, 'EX', ttlSeconds);
    },
    async ping() {
      await redis.ping();
    },
    async close() {
      await redis.quit();
    },
  };
}
