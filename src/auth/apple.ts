import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

export interface AppleIdentity {
  sub: string;
  email: string | null;
}

export interface AppleVerifierOptions {
  bundleId: string;
  issuer: string;
  jwksUrl: string;
  /** Injectable key resolver for tests; defaults to Apple's remote JWKS. */
  getKey?: JWTVerifyGetKey;
}

export class AppleTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppleTokenError";
  }
}

/**
 * Verifies a Sign in with Apple identity token (ES256, Apple JWKS)
 * and returns the stable subject + email claim.
 */
export function createAppleVerifier(opts: AppleVerifierOptions) {
  const getKey = opts.getKey ?? createRemoteJWKSet(new URL(opts.jwksUrl));

  return async function verifyIdentityToken(
    identityToken: string,
  ): Promise<AppleIdentity> {
    try {
      const { payload } = await jwtVerify(identityToken, getKey, {
        issuer: opts.issuer,
        audience: opts.bundleId,
        maxTokenAge: "10m",
      });
      if (typeof payload.sub !== "string" || payload.sub.length === 0) {
        throw new AppleTokenError("identity token missing sub");
      }
      return {
        sub: payload.sub,
        email: typeof payload.email === "string" ? payload.email : null,
      };
    } catch (err) {
      if (err instanceof AppleTokenError) throw err;
      // Never include the token in the error surface.
      throw new AppleTokenError("identity token verification failed");
    }
  };
}
