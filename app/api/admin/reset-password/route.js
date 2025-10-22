import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to hash OTP codes (must match request-password-reset)
function hashCode(code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('OTP_SECRET or JWT_SECRET environment variable is required for password reset');
  }
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

// Rate limiting storage (in-memory - use Redis in production)
const rateLimitStore = new Map();

// Rate limiting helper for verification attempts
function checkRateLimit(identifier, maxAttempts = 10, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `verify:${identifier}`;
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

  // Cleanup old entries
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

    // Check if user exists
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return Response.json({ error: 'Failed to process request' }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return Response.json({ 
        success: true, 
        message: 'If this email is registered, you will receive a password reset code'
      });
    }

    // Check if user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (!adminData) {
      // Don't reveal if it's not an admin email
      return Response.json({ 
        success: true, 
        message: 'If this email is registered, you will receive a password reset code'
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for password reset

    // Delete any existing reset codes for this user
    await supabase
      .from('password_verification_codes')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('password_verification_codes')
      .insert({
        user_id: user.id,
        code: otp,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('Error storing OTP:', insertError);
      return Response.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // Send OTP via email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        console.error('RESEND_API_KEY not configured');
        return Response.json({ error: 'Email service not configured' }, { status: 500 });
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ADONS Studio <onboarding@resend.dev>',
          to: email,
          subject: 'Password Reset Verification Code',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #dc2626; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔓 Password Reset Request</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>You have requested to reset your password for your ADONS Studio admin account. Please use the verification code below to complete the reset process:</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Password Reset Code</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 10 minutes</p>
                  </div>

                  <div class="alert">
                    <strong>⚠️ IMPORTANT SECURITY NOTICE:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                      <li>If you did NOT request this password reset, <strong>DO NOT use this code</strong></li>
                      <li>Someone may be trying to access your account</li>
                      <li>Please contact support immediately if you didn't initiate this</li>
                    </ul>
                  </div>

                  <div class="warning">
                    <strong>🔐 Security Tips:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                      <li>This code expires in <strong>10 minutes</strong></li>
                      <li>Never share this code with anyone</li>
                      <li>ADONS staff will never ask for this code</li>
                      <li>Use a strong, unique password</li>
                    </ul>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    This password reset was requested from the ADONS Studio admin panel. If you have any concerns, please contact support.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} ADONS Studio. All rights reserved.</p>
                  <p style="font-size: 12px; color: #9ca3af;">This is an automated message, please do not reply.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('Resend API error:', errorData);
        return Response.json({ error: 'Failed to send verification email' }, { status: 500 });
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'password_reset_otp_sent',
        details: { email: email }
      });

      return Response.json({ 
        success: true, 
        message: 'If this email is registered, you will receive a password reset code',
        expiresIn: 600 // 10 minutes in seconds
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return Response.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
