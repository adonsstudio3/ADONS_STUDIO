import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to hash OTP codes
function hashCode(code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

// Rate limiting storage
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `otp:${identifier}`;
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

export async function POST(request) {
  try {
    const { currentPassword } = await request.json();
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userId || !userEmail) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!currentPassword) {
      return Response.json({ error: 'Current password is required' }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Rate limiting by user ID
    const rateLimit = checkRateLimit(userId, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return Response.json({ 
        error: `Too many OTP requests. Please try again in ${rateLimit.remainingTime} minutes.` 
      }, { status: 429 });
    }

    // Verify current password by attempting to sign in
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    });

    if (authError || !authData.user) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = hashCode(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Delete old unused codes for this user
    await supabaseAdmin
      .from('password_verification_codes')
      .delete()
      .eq('user_id', userId)
      .eq('used', false);

    // Store hashed OTP in database
    const { error: insertError } = await supabaseAdmin
      .from('password_verification_codes')
      .insert({
        user_id: userId,
        code: hashedOtp, // Store hashed version
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
        console.error('⚠️ Email Service Error: RESEND_API_KEY not configured');
        return Response.json({ error: 'Email service not configured. Please contact administrator.' }, { status: 500 });
      }

      console.log(`📧 Sending password change OTP to ${userEmail} for user ${userId}`);

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'ADONS Studio <noreply@adons.studio>',
          to: userEmail,
          subject: 'Password Change Verification Code',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Password Change Verification</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>You have requested to change your password for your ADONS Studio admin account. Please use the verification code below to complete the process:</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Verification Code</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 5 minutes</p>
                  </div>

                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                      <li>This code expires in <strong>5 minutes</strong></li>
                      <li>Never share this code with anyone</li>
                      <li>If you didn't request this, please ignore this email</li>
                    </ul>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If you didn't initiate this password change request, please contact support immediately.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} ADONS Studio. All rights reserved.</p>
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
        return Response.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 });
      }

      console.log(`✅ Password change OTP sent successfully to ${userEmail}`);

      // Log activity
      await supabaseAdmin.from('activity_logs').insert({
        user_id: userId,
        action: 'password_change_otp_sent',
        details: { email: userEmail }
      });

      return Response.json({ 
        success: true, 
        message: 'Verification code sent to your email',
        expiresIn: 300 // 5 minutes in seconds
      });

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return Response.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
