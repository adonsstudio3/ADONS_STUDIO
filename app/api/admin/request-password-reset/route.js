import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to hash OTP codes before storing
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

// Rate limiting helper
function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `reset:${identifier}`;
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
      // Reset window
      rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
    }
  } else {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
  }

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.firstAttempt > windowMs) {
        rateLimitStore.delete(k);
      }
    }
  }

  return { allowed: true };
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`🔑 Password reset request for email: ${email}`);

    // Rate limiting by email
    const rateLimit = checkRateLimit(email.toLowerCase(), 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return Response.json({
        error: `Too many password reset requests. Please try again in ${rateLimit.remainingTime} minutes.`
      }, { status: 429 });
    }

    // Check if user exists by attempting to get user by email
    let user;
    try {
      console.log('🔍 Attempting to fetch user from Supabase...');

      // Try to get user by email using admin API
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();

      if (userError) {
        console.error('❌ Supabase error fetching users:', userError);
        console.error('Error details:', {
          status: userError.status,
          message: userError.message,
          code: userError.code
        });
        return Response.json({
          error: 'Authentication service error. Please check admin credentials and try again.'
        }, { status: 503 });
      }

      if (!users || !Array.isArray(users)) {
        console.error('❌ Invalid response from Supabase - users not found');
        return Response.json({
          error: 'Service error. Please try again later.'
        }, { status: 503 });
      }

      user = users.find(u => u.email === email);
      console.log(`🔍 User lookup result: ${user ? 'found' : 'not found'}`);
    } catch (err) {
      console.error('❌ Supabase auth error:', err);
      return Response.json({
        error: 'Service error. Please try again later.'
      }, { status: 503 });
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      console.log(`ℹ️ Email not found in system: ${email}`);
      return Response.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.'
      });
    }

    console.log(`✅ User found: ${email} (ID: ${user.id})`);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for password reset

    // Delete any existing unused password reset codes for this user
    await supabaseAdmin
      .from('password_verification_codes')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false);

    // Store OTP in database (plain text is acceptable for short-lived, one-time codes)
    const { error: insertError } = await supabaseAdmin
      .from('password_verification_codes')
      .insert({
        user_id: user.id,
        code: otp, // Store plain OTP (6 digits)
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return Response.json({ error: 'Failed to generate reset code' }, { status: 500 });
    }

    // Send OTP via email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.error('⚠️ Email Service Error: RESEND_API_KEY not configured');
        return Response.json({ error: 'Email service not configured. Please contact administrator.' }, { status: 500 });
      }

      console.log(`📧 Sending password reset OTP to ${email} for user ${user.id}`);

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ADONS Studio <onboarding@resend.dev>',
          to: email,
          subject: 'Password Reset Code - ADONS Studio',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 10px; font-family: 'Courier New', monospace; }
                .warning { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
                .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔓 Password Reset Request</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>You have requested to reset your password for your ADONS Studio admin account. Please use the verification code below:</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Password Reset Code</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 10 minutes</p>
                  </div>

                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                      <li>This code expires in <strong>10 minutes</strong></li>
                      <li>Never share this code with anyone</li>
                      <li>If you didn't request this, please ignore this email</li>
                      <li>Your current password remains active until reset is completed</li>
                    </ul>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If you didn't request a password reset, no action is needed. Your account remains secure.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} ADONS Studio. All rights reserved.</p>
                  <p style="font-size: 12px; color: #9ca3af;">This is an automated security message.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('❌ Resend API Error:', {
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          error: errorData
        });
        return Response.json({ error: 'Failed to send reset email. Please try again.' }, { status: 500 });
      }

      console.log(`✅ Password reset OTP sent successfully to ${email}`);

      // Log activity
      await supabaseAdmin.from('activity_logs').insert({
        user_id: user.id,
        action: 'password_reset_requested',
        details: { email: email }
      });

      return Response.json({ 
        success: true, 
        message: 'Password reset code sent to your email',
        expiresIn: 600 // 10 minutes in seconds
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return Response.json({ error: 'Failed to send reset email' }, { status: 500 });
    }

  } catch (error) {
    console.error('Request password reset error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
