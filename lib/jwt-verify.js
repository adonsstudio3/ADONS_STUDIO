/**
 * DEPRECATED: JWT verification is now handled by Supabase internally.
 * 
 * With Supabase's new JWT Signing Keys system, you no longer need to:
 * - Manually verify JWTs
 * - Manage JWT_SECRET or SUPABASE_JWT_SECRET
 * 
 * Instead:
 * 1. Use Supabase client libraries (they verify JWTs automatically)
 * 2. For server-side operations, use supabaseAdmin with SERVICE_ROLE_KEY
 * 3. For session validation, use getSession() from Supabase Auth
 * 
 * This file is kept for reference only. Do not use.
 * 
 * Migration guide:
 * - Replace jwt.verify() calls with Supabase Auth methods
 * - Use verifySupabaseAuth() middleware for API route protection
 * - See: frontend/lib/supabase.js for examples
 * 
 * @deprecated Use Supabase Auth methods instead
 */

// Example of the OLD approach (DO NOT USE):
// import jwt from 'jsonwebtoken';
// export function verifyJwt(token) {
//   const secret = process.env.SUPABASE_JWT_SECRET; // NO LONGER NEEDED
//   const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
//   return payload;
// }
