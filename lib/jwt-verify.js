import jwt from 'jsonwebtoken';

/**
 * Verify a JWT signature using the supplied SUPABASE_JWT_SECRET.
 * Returns decoded payload on success or throws on failure.
 */
export function verifyJwt(token) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET not configured');
  }

  // jsonwebtoken will throw on invalid signature or expired token
  const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
  return payload;
}
