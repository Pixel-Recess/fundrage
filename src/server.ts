import { loadConfig } from './config.js';
import { buildApp } from './app.js';
import { createDb } from './infra/postgres.js';
import { createKv } from './infra/redis.js';

const config = loadConfig();
const db = createDb(config.databaseUrl);
const kv = createKv(config.redisUrl);
const app = buildApp(config, { db, kv });

const shutdown = async () => {
  await app.close();
  await Promise.allSettled([db.close(), kv.close()]);
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
