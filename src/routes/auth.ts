import type { FastifyInstance } from 'fastify';
import { AppleTokenError, type AppleIdentity } from '../auth/apple.js';
import type { createSessionService } from '../auth/session.js';
import type { Db, UserRow } from '../types.js';

interface AuthAppleBody {
  identity_token?: string;
}

export interface AuthDeps {
  db: Db;
  verifyAppleToken: (token: string) => Promise<AppleIdentity>;
  sessions: ReturnType<typeof createSessionService>;
}

export function registerAuthRoutes(app: FastifyInstance, deps: AuthDeps): void {
  app.post<{ Body: AuthAppleBody }>(
    '/auth/apple',
    {
      schema: {
        body: {
          type: 'object',
          required: ['identity_token'],
          properties: { identity_token: { type: 'string', minLength: 1 } },
        },
      },
    },
    async (req, reply) => {
      let identity: AppleIdentity;
      try {
        identity = await deps.verifyAppleToken(req.body.identity_token as string);
      } catch (err) {
        if (err instanceof AppleTokenError) {
          return reply.code(401).send({ error: 'invalid_identity_token' });
        }
        throw err;
      }

      const { rows } = await deps.db.query<UserRow>(
        `INSERT INTO users (apple_sub, email)
         VALUES ($1, $2)
         ON CONFLICT (apple_sub)
         DO UPDATE SET email = COALESCE(EXCLUDED.email, users.email)
         RETURNING id, apple_sub, email`,
        [identity.sub, identity.email],
      );
      const user = rows[0];
      if (!user) {
        return reply.code(500).send({ error: 'user_upsert_failed' });
      }

      const token = await deps.sessions.issue({ userId: user.id });
      return reply.code(200).send({ session_token: token, user_id: user.id });
    },
  );
}
