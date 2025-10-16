-- Create password_verification_codes table for OTP storage
CREATE TABLE IF NOT EXISTS password_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_verification_user_id ON password_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_password_verification_code ON password_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_verification_expires_at ON password_verification_codes(expires_at);

-- Enable RLS
ALTER TABLE password_verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read their own verification codes (for checking status if needed)
CREATE POLICY "Users can view their own verification codes"
  ON password_verification_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Note: No INSERT/UPDATE/DELETE policies needed
-- The service_role key (used in API routes) bypasses RLS entirely
-- This ensures ONLY the backend API can write/modify verification codes
-- Regular users and anonymous clients cannot insert, update, or delete codes

-- Auto-cleanup expired codes (runs daily)
-- This will delete verification codes older than 1 day
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_verification_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a cron job to run cleanup daily
-- Note: Requires pg_cron extension (available in Supabase)
-- SELECT cron.schedule('cleanup-expired-verification-codes', '0 0 * * *', 'SELECT cleanup_expired_verification_codes()');
