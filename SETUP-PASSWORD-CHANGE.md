# Quick Setup Guide - Password Change with Email OTP

## Step 1: Apply Database Migration

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase-migrations/password_verification_codes.sql`
5. Click **Run** to create the table

## Step 2: Configure Resend Email Service

1. Go to https://resend.com and sign up (free tier available)
2. Verify your domain OR use Resend's test domain for development
3. Get your API key from the Resend dashboard
4. Add to your `.env.local` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

5. Restart your dev server: `npm run dev`

## Step 3: Test the Feature

1. **Log in to admin panel**: http://localhost:3000/admin
2. **Go to Change Password**: Click "Settings" → "Change Password"
3. **Enter current password**: Your existing Supabase auth password
4. **Click "Send Verification Code"**
5. **Check your email**: Look for email from "ADONS Studio <noreply@adons.studio>"
6. **Enter the 6-digit code** from the email
7. **Enter new password** (must meet requirements):
   - At least 8 characters
   - Contains uppercase letter
   - Contains lowercase letter
   - Contains number
   - Contains special character (@$!%*?&)
8. **Confirm new password**
9. **Click "Change Password"**
10. **Verify success**: Log out and log back in with the new password

## Step 4: Verify Email Template (Optional)

If you want to customize the email template:
1. Open `app/api/admin/send-password-otp/route.js`
2. Find the email HTML (lines 55-100)
3. Customize colors, text, or layout
4. Save and restart server

## Troubleshooting

### Email not sending?
- Check `RESEND_API_KEY` is set correctly in `.env.local`
- Verify your domain is verified in Resend (or use test domain)
- Check server logs for error messages
- Ensure you restarted the dev server after adding the env variable

### Database error?
- Run the SQL migration in Supabase SQL Editor
- Check the `password_verification_codes` table exists
- Verify RLS policies are enabled

### OTP expired?
- OTPs expire in 5 minutes
- Request a new code if expired
- Old codes will still be valid until they expire

### Password not changing?
- Verify OTP code is correct (6 digits)
- Check new password meets requirements
- Ensure passwords match (new and confirm)
- Check console for error messages

## Production Checklist

Before deploying to production:

- [ ] Add `RESEND_API_KEY` to production environment variables
- [ ] Verify domain in Resend for production emails
- [ ] Update email "from" address to your domain
- [ ] Test complete flow in production
- [ ] Monitor activity logs for security audit
- [ ] Consider adding rate limiting (optional)
- [ ] Set up email monitoring/alerts (optional)

## Email Configuration for Production

Update the email sender in `app/api/admin/send-password-otp/route.js`:

```javascript
from: 'ADONS Studio <noreply@yourdomain.com>', // Change this
to: userEmail,
subject: 'Password Change Verification Code',
```

## Support

If you encounter issues:
1. Check server console logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure database migration was applied
5. Test with Resend's test domain first

---

**Implementation Complete! 🎉**

Your password change system now requires:
1. Current password verification
2. Email OTP verification
3. Strong password requirements

All test/debug components have been removed from the admin panel.
