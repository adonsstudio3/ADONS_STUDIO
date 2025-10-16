-- Create verification_codes table for password reset/change OTP
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('password_change', 'password_reset', 'email_verification')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- Add RLS policies
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DROP POLICY IF EXISTS "Service role full access to verification_codes" ON verification_codes;
CREATE POLICY "Service role full access to verification_codes"
  ON verification_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a cron job to run cleanup daily
-- You'll need to enable pg_cron extension first:
-- SELECT cron.schedule('cleanup-verification-codes', '0 2 * * *', 'SELECT cleanup_expired_verification_codes()');

COMMENT ON TABLE verification_codes IS 'Stores temporary verification codes for password changes, resets, and email verification';
COMMENT ON COLUMN verification_codes.code IS '6-digit numeric code';
COMMENT ON COLUMN verification_codes.type IS 'Type of verification: password_change, password_reset, or email_verification';
COMMENT ON COLUMN verification_codes.expires_at IS 'Code expiration time (typically 5-10 minutes from creation)';
COMMENT ON COLUMN verification_codes.used_at IS 'Timestamp when code was used (null if unused)';
