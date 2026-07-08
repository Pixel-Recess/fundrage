/**
 * Minimal dependency interfaces so routes/plugins can be unit-tested
 * without a live Postgres/Redis. Real implementations wrap `pg` and `ioredis`.
 */

export interface Db {
  query<R = unknown>(text: string, values?: unknown[]): Promise<{ rows: R[] }>;
  ping(): Promise<void>;
}

export interface Kv {
  get(key: string): Promise<string | null>;
  /** Set if not exists, with TTL in seconds. Returns true if the key was set. */
  setNx(key: string, value: string, ttlSeconds: number): Promise<boolean>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  ping(): Promise<void>;
}

export interface UserRow {
  id: string;
  apple_sub: string;
  email: string | null;
}
