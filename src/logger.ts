import pino from "pino";

/**
 * Standalone logger for code that runs outside a Fastify request context
 * (e.g. the ingestion worker), where `app.log` isn't available. Keeps the
 * same "no raw console.*" discipline as the rest of the codebase.
 */
export const logger = pino({ level: process.env.NODE_ENV === "test" ? "silent" : "info" });
