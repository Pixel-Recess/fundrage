import { loadConfig } from "./config.js";
import { createDb } from "./infra/postgres.js";
import { createKv } from "./infra/redis.js";
import { createQueue } from "./infra/queue.js";
import { runIngestion } from "./ingestion/ingest.js";
import { logger } from "./logger.js";

const config = loadConfig();
const db = createDb(config.databaseUrl);
const kv = createKv(config.redisUrl);
const queue = createQueue(config.redisUrl);

async function tick(): Promise<void> {
  try {
    const result = await runIngestion({ db, kv, queue, config });
    logger.info(result, "ingestion tick complete");
  } catch (err) {
    logger.error({ err }, "ingestion tick failed");
  }
}

void tick();
const interval = setInterval(tick, config.ingestion.intervalMinutes * 60_000);

const shutdown = async () => {
  clearInterval(interval);
  await Promise.allSettled([db.close(), kv.close(), queue.close()]);
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
