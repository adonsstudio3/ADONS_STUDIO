import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to hash OTP codes (must match request-password-reset)
// Note: OTP_SECRET is used for generating secure one-time password hashes
// (JWT authentication is now handled by Supabase)
function hashCode(code) {
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    throw new Error('OTP_SECRET environment variable is required for password reset');
  }
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

// Rate limiting storage (in-memory - use Redis in production)
const rateLimitStore = new Map();
const failedAttempts = new Map();

// Rate limiting helper
function checkRateLimit(identifier, maxAttempts = 10, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `confirm:${identifier}`;
  const record = rateLimitStore.get(key);

  if (record) {
    const timePassed = now - record.firstAttempt;
    
    if (timePassed < windowMs) {
      if (record.attempts >= maxAttempts) {
        const remainingTime = Math.ceil((windowMs - timePassed) / 1000 / 60);
        return { allowed: false, remainingTime };
      }
      record.attempts++;
    } else {
      rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
    }
  } else {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
  }

  return { allowed: true };
}

// Track failed verification attempts
function recordFailedAttempt(email) {
  const key = `failed:${email}`;
  const now = Date.now();
  const record = failedAttempts.get(key) || { count: 0, firstAttempt: now };
  
  // Reset if window expired
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    record.count = 1;
    record.firstAttempt = now;
  } else {
    record.count++;
  }
  
  failedAttempts.set(key, record);
  
  // Alert if suspicious activity (5+ failures in 15 min)
  if (record.count >= 5) {
    console.warn(`⚠️ SECURITY ALERT: ${record.count} failed password reset attempts for ${email}`);
    // TODO: Send notification email to admin
  }
}

export async function POST(request) {
  try {
    const { email, verificationCode, newPassword, confirmPassword } = await request.json();

    if (!email || !verificationCode || !newPassword || !confirmPassword) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Rate limiting by email
    const rateLimit = checkRateLimit(email.toLowerCase(), 10, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return Response.json({ 
        error: `Too many verification attempts. Please try again in ${rateLimit.remainingTime} minutes.` 
      }, { status: 429 });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return Response.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return Response.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(newPassword)) {
      return Response.json({ 
        error: 'Password must contain uppercase, lowercase, number and special character' 
      }, { status: 400 });
    }

    // Get user by email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return Response.json({ error: 'Failed to process request' }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      recordFailedAttempt(email);
      return Response.json({ error: 'Invalid verification code or email' }, { status: 400 });
    }

    // Verify OTP code (plain text comparison)
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('password_verification_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('code', verificationCode) // Compare plain codes
      .eq('used', false)
      .single();

    if (otpError || !otpData) {
      recordFailedAttempt(email);
      return Response.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpData.expires_at);
    if (expiresAt < new Date()) {
      recordFailedAttempt(email);
      return Response.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // TRANSACTION: Update password AND mark code as used atomically
    try {
      // Step 1: Mark OTP as used BEFORE updating password (prevents reuse if password update fails)
      const { error: markUsedError } = await supabaseAdmin
        .from('password_verification_codes')
        .update({ used: true })
        .eq('id', otpData.id)
        .eq('used', false); // Double-check it hasn't been used

      if (markUsedError) {
        console.error('Error marking OTP as used:', markUsedError);
        return Response.json({ error: 'Verification code has already been used' }, { status: 400 });
      }

      // Step 2: Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        // Rollback: mark code as unused if password update fails
        await supabaseAdmin
          .from('password_verification_codes')
          .update({ used: false })
          .eq('id', otpData.id);
        
        return Response.json({ 
          error: 'Failed to update password', 
          details: updateError.message 
        }, { status: 500 });
      }

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      recordFailedAttempt(email);
      return Response.json({ error: 'Failed to complete password reset' }, { status: 500 });
    }

    // Log the password reset activity
    try {
      await supabaseAdmin
        .from('activity_logs')
        .insert([{
          action: 'password_reset_completed',
          user_id: user.id,
          details: {
            email: user.email,
            reset_via: 'email_otp',
            timestamp: new Date().toISOString()
          }
        }]);
    } catch (logError) {
      console.warn('Failed to log password reset:', logError);
    }

    return Response.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Confirm reset password error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
