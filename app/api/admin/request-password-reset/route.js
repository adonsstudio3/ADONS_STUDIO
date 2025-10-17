import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to hash OTP codes before storing
function hashCode(code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production';
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

    // Rate limiting by email
    const rateLimit = checkRateLimit(email.toLowerCase(), 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return Response.json({ 
        error: `Too many password reset requests. Please try again in ${rateLimit.remainingTime} minutes.` 
      }, { status: 429 });
    }

    // Check if user exists
    let userData;
    try {
      const { data, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        console.error('Error fetching users:', userError);
        return Response.json({ 
          success: true, 
          message: 'If an account exists with this email, you will receive a password reset code.' 
        });
      }
      userData = data;
    } catch (err) {
      console.error('Supabase auth error:', err);
      return Response.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset code.' 
      });
    }

    const user = userData.users.find(u => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return Response.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive a password reset code.' 
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = hashCode(otp); // Hash before storing
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for password reset

    // Delete any existing unused password reset codes for this user
    await supabaseAdmin
      .from('password_verification_codes')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false);

    // Store hashed OTP in database
    const { error: insertError } = await supabaseAdmin
      .from('password_verification_codes')
      .insert({
        user_id: user.id,
        code: hashedOtp, // Store hashed version
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
          from: 'ADONS Studio <noreply@adons.studio>',
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
