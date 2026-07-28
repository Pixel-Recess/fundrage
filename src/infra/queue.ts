import { Queue as BullQueue } from "bullmq";
import { Redis } from "ioredis";

export interface Queue {
  addJob(name: string, data: Record<string, unknown>): Promise<void>;
}

export function createQueue(
  redisUrl: string,
): Queue & { close(): Promise<void> } {
  // BullMQ requires this on any connection it manages, even for a Queue
  // producer with no Worker attached.
  const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
  const queue = new BullQueue("ingestion", { connection });
  return {
    async addJob(name, data) {
      await queue.add(name, data);
    },
    async close() {
      await queue.close();
      connection.disconnect();
    },
  };
}
