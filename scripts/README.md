# ADONS Studio - Scripts Directory

## 🗄️ **Production Database Scripts**

### **Core Schema Files**
- **`complete-schema.sql`** - Main database schema with all 9 tables and functions
- **`storage-and-rls.sql`** - Row Level Security policies and storage bucket policies  
- **`default-email-templates.sql`** - Email templates for contact form notifications

### **Setup Scripts**
- **`setup-supabase-complete.mjs`** - Automated storage bucket creation and verification
- **`create-hero-bucket.mjs`** - Fix for hero-media bucket size limit (50MB)

## 🔧 **Utility Scripts**

### **Development Tools**
- **`check-buckets.mjs`** - Verify storage bucket configuration and permissions
- **`setup-supabase-simple.mjs`** - Simple Supabase connection test
- **`seo-check.js`** - SEO analysis and optimization checker
- **`convert-all-images.js`** - Image optimization and format conversion

## 📋 **Deployment Order**

### **1. Database Setup:**
```sql
-- Run in Supabase SQL Editor (in this order):
1. complete-schema.sql          -- Creates all tables and functions
2. storage-and-rls.sql         -- Sets up security and storage policies  
3. default-email-templates.sql -- Adds email templates
```

### **2. Storage Setup:**
```bash
# Run in terminal:
node scripts/setup-supabase-complete.mjs  # Creates storage buckets
node scripts/create-hero-bucket.mjs       # Fixes hero bucket if needed
```

### **3. Verification:**
```bash
# Optional - verify everything works:
node scripts/check-buckets.mjs    # Check storage buckets
```

## 🗂️ **File Status**

### **✅ Production Ready**
- `complete-schema.sql` - Complete database schema
- `storage-and-rls.sql` - Security policies
- `default-email-templates.sql` - Email system
- `setup-supabase-complete.mjs` - Storage setup

### **🔧 Utility/Optional**
- `check-buckets.mjs` - Debugging tool
- `create-hero-bucket.mjs` - Backup bucket creator
- `setup-supabase-simple.mjs` - Connection tester
- `seo-check.js` - SEO analyzer
- `convert-all-images.js` - Image optimizer

## 🧹 **Cleaned Up (Removed)**

The following old/duplicate files have been removed:
- ❌ `fresh-start-fixed.sql` - Old schema with custom auth
- ❌ `setup-rls-policies.sql` - Duplicate of storage-and-rls.sql
- ❌ `change-admin-password.sql` - Not needed with Supabase Auth
- ❌ `setup-supabase.js` - Replaced by .mjs versions
- ❌ `deploy-*.js` - Old deployment scripts
- ❌ `cleanup-*.js` - Temporary cleanup scripts
- ❌ `test-*.mjs` - Development test scripts
- ❌ `upload-direct.mjs` - Development upload tester

---

**Your scripts directory is now clean and production-ready! 🎉**