import { SignJWT, exportJWK, generateKeyPair, createLocalJWKSet } from "jose";
import type { JWTVerifyGetKey } from "jose";

export interface FakeApple {
  getKey: JWTVerifyGetKey;
  sign(claims: {
    sub?: string;
    email?: string;
    iss?: string;
    aud?: string;
    iat?: number;
  }): Promise<string>;
}

/** Local stand-in for Apple's JWKS: real ES256 keys, controllable claims. */
export async function createFakeApple(): Promise<FakeApple> {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  const jwk = await exportJWK(publicKey);
  jwk.kid = "test-key";
  jwk.alg = "ES256";
  const getKey = createLocalJWKSet({ keys: [jwk] });

  return {
    getKey,
    async sign(claims) {
      const jwt = new SignJWT({
        ...(claims.email ? { email: claims.email } : {}),
      })
        .setProtectedHeader({ alg: "ES256", kid: "test-key" })
        .setSubject(claims.sub ?? "apple-sub-123")
        .setIssuer(claims.iss ?? "https://appleid.apple.com")
        .setAudience(claims.aud ?? "com.fundrage.app")
        .setIssuedAt(claims.iat ?? Math.floor(Date.now() / 1000))
        .setExpirationTime("5m");
      return jwt.sign(privateKey);
    },
  };
}
