import { SignJWT, jwtVerify } from 'jose';

const SESSION_TTL = '30d';
const ALG = 'HS256';

export interface SessionClaims {
  userId: string;
}

export function createSessionService(jwtSecret: string) {
  const key = new TextEncoder().encode(jwtSecret);
  return {
    async issue(claims: SessionClaims): Promise<string> {
      return new SignJWT({ uid: claims.userId })
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime(SESSION_TTL)
        .sign(key);
    },
    async verify(token: string): Promise<SessionClaims | null> {
      try {
        const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
        return typeof payload.uid === 'string' ? { userId: payload.uid } : null;
      } catch {
        return null;
      }
    },
  };
}
