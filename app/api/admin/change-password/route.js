import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateRequest, handleError, createResponse } from '@/lib/api-security';
import crypto from 'crypto';

// Helper to hash OTP codes
function hashCode(code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  return crypto.createHmac('sha256', secret).update(code).digest('hex');
}

export async function POST(request) {
  try {
    // Validate request
    const validation = await validateRequest(request, ['verificationCode', 'newPassword', 'confirmPassword']);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { verificationCode, newPassword, confirmPassword } = validation.data;
    
    // Get user from request headers (set by middleware)
    const userId = request.headers.get('x-supabase-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(newPassword)) {
      return NextResponse.json({ 
        error: 'Password must contain uppercase, lowercase, number and special character' 
      }, { status: 400 });
    }

    // Verify OTP code (compare hashed version)
    const hashedCode = hashCode(verificationCode);
    
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('password_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', hashedCode) // Compare hashed codes
      .eq('used', false)
      .single();

    if (otpError || !otpData) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Get user info
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TRANSACTION: Update password AND mark code as used atomically
    try {
      // Step 1: Mark OTP as used BEFORE updating password
      const { error: markUsedError } = await supabaseAdmin
        .from('password_verification_codes')
        .update({ used: true })
        .eq('id', otpData.id)
        .eq('used', false); // Double-check it hasn't been used

      if (markUsedError) {
        console.error('Error marking OTP as used:', markUsedError);
        return NextResponse.json({ error: 'Verification code has already been used' }, { status: 400 });
      }

      // Step 2: Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        // Rollback: mark code as unused if password update fails
        await supabaseAdmin
          .from('password_verification_codes')
          .update({ used: false })
          .eq('id', otpData.id);
        
        return NextResponse.json({ 
          error: 'Failed to update password', 
          details: updateError.message 
        }, { status: 500 });
      }

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json({ error: 'Failed to complete password change' }, { status: 500 });
    }

    // Log the password change activity
    try {
      await supabaseAdmin
        .from('activity_logs')
        .insert([{
          action: 'password_changed',
          admin_id: userId,
          details: {
            email: user.email,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown'
          }
        }]);
    } catch (logError) {
      console.warn('Failed to log password change:', logError);
    }

    return createResponse({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return handleError(error, 'Failed to change password');
  }
}