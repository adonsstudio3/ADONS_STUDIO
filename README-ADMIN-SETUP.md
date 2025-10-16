# Adons Studio - Complete Admin System Setup

## 🚀 Overview

This is a comprehensive Next.js 15.5.2 application with a complete admin panel system featuring:

- **Media Library Management** (Upload, organize, delete media files)
- **Dynamic Project Cards** (Portfolio management with categories, tags, and gallery)
- **Hero Sections Management** (Dynamic homepage content)
- **Contact Form & Email Service** (Lead management with automated responses)
- **Email Templates System** (Customizable notification templates)
- **Analytics Dashboard** (Usage statistics and activity monitoring)
- **Secure Authentication** (Admin access control)
- **Activity Logging** (Complete audit trail)

## 📋 Prerequisites

- Node.js 18+ 
- Supabase Account
- VS Code (recommended)

## 🛠️ Setup Instructions

### 1. Database Setup

1. **Execute SQL Scripts in Supabase SQL Editor:**

   ```sql
   -- First, run the main schema
   -- Copy and paste content from: scripts/complete-schema.sql
   ```

   ```sql
   -- Then, run the storage and security setup
   -- Copy and paste content from: scripts/storage-and-rls.sql
   ```

   ```sql
   -- Finally, add default email templates
   -- Copy and paste content from: scripts/default-email-templates.sql
   ```

2. **Verify Tables Created:**
   - `admin_users`
   - `media_files`
   - `hero_sections`
   - `projects`
   - `showreels`
   - `contact_submissions`
   - `activity_logs`
   - `email_templates`
   - `analytics_consent`

### 2. Storage Buckets

Storage buckets have been created with the following structure:

- **hero-media** (50MB limit) - Hero section backgrounds
- **project-media** (100MB limit) - Project thumbnails and galleries
- **showreel-media** (100MB limit) - Video content
- **general-uploads** (50MB limit) - General media files
- **avatars** (10MB limit) - User profile images

### 3. Environment Variables

Your `.env.local` is already configured with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bpbueyqynmmeudopwemq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Configuration (Optional - for enhanced security)
ADMIN_PASSWORD_HASH=your-hashed-password
JWT_SECRET=your-jwt-secret
```

## 🔌 API Endpoints

### Public APIs

- **GET /api/projects** - Fetch published projects
- **GET /api/hero** - Fetch active hero sections
- **POST /api/contact** - Submit contact form

### Admin APIs

- **Media Management:**
  - `GET/POST/DELETE /api/admin/media` - Full CRUD for media files

- **Project Management:**
  - `GET/POST/PUT/DELETE /api/admin/projects` - Full CRUD for projects

- **Hero Sections:**
  - `GET/POST/PUT/DELETE /api/admin/hero` - Hero content management

- **Contact Management:**
  - `GET/PUT/DELETE /api/admin/contact` - Contact form submissions

- **Email Templates:**
  - `GET/POST/PUT/DELETE /api/admin/email-templates` - Email template management

- **Analytics:**
  - `GET /api/admin/analytics` - Dashboard statistics
  - `GET/DELETE /api/admin/logs` - Activity logs

## 📊 Database Schema

### Core Tables

1. **media_files** - File storage metadata
2. **projects** - Portfolio projects with galleries
3. **hero_sections** - Dynamic homepage content
4. **contact_submissions** - Lead management
5. **email_templates** - Notification templates
6. **activity_logs** - Audit trail
7. **admin_users** - Authentication
8. **analytics_consent** - GDPR compliance
9. **showreels** - Video showcase

## 🔐 Security Features

- **Rate Limiting** - Prevents API abuse
- **Row Level Security (RLS)** - Database-level security
- **Input Validation** - Sanitized data handling
- **Activity Logging** - Complete audit trail
- **IP Tracking** - Request monitoring
- **File Type Validation** - Safe file uploads
- **Size Limits** - Prevent storage abuse

## 📧 Email Integration

### Default Templates

1. **contact_notification** - New contact form alerts
2. **contact_auto_reply** - Automated responses (disabled by default)
3. **welcome_email** - User welcome messages (disabled by default)

### Email Service Setup

The contact form is ready for email integration. To enable:

1. **Choose an email service:**
   - Resend (recommended)
   - SendGrid
   - AWS SES
   - Nodemailer

2. **Update `/api/contact/route.js`:**
   ```javascript
   // Uncomment and configure your preferred service
   const resend = new Resend(process.env.RESEND_API_KEY);
   await resend.emails.send(emailData);
   ```

3. **Add environment variables:**
   ```env
   RESEND_API_KEY=your-api-key
   # or
   SENDGRID_API_KEY=your-api-key
   ```

## 🎨 Frontend Integration

### Example: Fetch Projects

```javascript
// Get published projects
const response = await fetch('/api/projects?category=vfx&limit=6');
const { projects } = await response.json();
```

### Example: Submit Contact Form

```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello from your website!'
  })
});
```

### Example: Get Hero Sections

```javascript
// Get hero sections for homepage
const response = await fetch('/api/hero?page=home');
const { heroSections } = await response.json();
```

## 📱 Admin Panel Usage

### Media Library
- Upload images, videos, and documents
- Organize by categories
- Bulk operations
- Storage usage monitoring

### Project Management
- Create project cards with galleries
- Set featured projects
- Category organization
- SEO-friendly URLs

### Contact Management
- View all submissions
- Update status (new → read → replied → resolved)
- Add admin notes
- Export functionality

### Analytics Dashboard
- View submission statistics
- Monitor storage usage
- Track recent activity
- Performance metrics

## 🚀 Deployment

1. **Test Locally:**
   ```bash
   npm run dev
   ```

2. **Test Admin Functions:**
   - Upload a test image
   - Create a test project
   - Submit a contact form
   - Check analytics dashboard

3. **Deploy to Production:**
   - Vercel (recommended)
   - Netlify
   - Your preferred hosting

## 🔧 Troubleshooting

### Common Issues

1. **Upload Errors:**
   - Check storage bucket policies
   - Verify file size limits
   - Ensure RLS policies are correct

2. **Database Errors:**
   - Verify all SQL scripts executed
   - Check table relationships
   - Confirm RLS policies

3. **Email Issues:**
   - Check email service configuration
   - Verify environment variables
   - Test email templates

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
```

## 📞 Support

For issues or questions:
- Check the activity logs in admin panel
- Review browser console for errors
- Verify API responses in Network tab

## 🎯 Next Steps

1. **Execute SQL scripts** in Supabase dashboard
2. **Test upload functionality** in admin panel
3. **Configure email service** for notifications
4. **Customize email templates** as needed
5. **Deploy to production**

---

**Your comprehensive admin system is ready to go! 🎉**

## SUPABASE_JWT_SECRET (optional but recommended)

When running server-side JWT signature verification you need the Supabase JWT secret. This secret is used only on the server to verify that incoming access_tokens (JWTs) were issued by your Supabase project and have not been tampered with.

Where to get it:
- Open your Supabase project → Settings → API
- Look for the "JWT Secret" (sometimes called "Service JWT Secret" or similar). Copy the value.

How to set it locally (development):
1. Add the secret to your `frontend/.env.local` (do NOT commit this file):

```env
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
```

2. Restart your Next dev server so the env var is picked up.

How to set it in production (recommended):
- Use your hosting provider's secret manager / environment settings (Vercel, Netlify, AWS, etc.).
- Add `SUPABASE_JWT_SECRET` there — do not check secrets into source control.

Why to provide it:
- If present the app will verify JWT signatures locally (HS256) before accepting admin API requests. This improves security by validating token integrity without always calling Supabase.

If you prefer not to store the secret, the server will fall back to Supabase token introspection (`supabaseAdmin.auth.getUser(token)`) to validate tokens. That still works but requires a network call to Supabase for each verification.