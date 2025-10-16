/**
 * Enhanced Validation Schemas
 * Production-Ready Input Validation
 */

import { z } from 'zod';

// File upload validation
const fileValidation = z.object({
  file_type: z.enum(['image', 'video', 'document']),
  file_size: z.number().min(1).max(104857600), // 100MB max
  original_filename: z.string().min(1).max(255),
  mime_type: z.string().regex(/^[a-z]+\/[a-z0-9][a-z0-9\!#\$&\-\^_]*$/),
});

// Enhanced project validation
const projectValidation = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).optional(),
  category: z.enum(['branding', 'advertising', 'web-design', 'video-production', 'social-media', 'general']),
  thumbnail_url: z.string().url().optional(),
  preview_images: z.array(z.string().url()).max(10).default([]),
  project_url: z.string().url().optional(),
  platform: z.enum(['youtube', 'vimeo', 'website', 'instagram', 'custom']).default('custom'),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).default({}),
  seo: z.object({
    meta_title: z.string().max(60).optional(),
    meta_description: z.string().max(160).optional(),
    keywords: z.array(z.string()).max(10).optional(),
  }).optional(),
});

// Enhanced hero section validation
const heroSectionValidation = z.object({
  title: z.string().min(1).max(200).trim(),
  subtitle: z.string().max(300).optional(),
  description: z.string().max(500).optional(),
  background_type: z.enum(['image', 'video', 'gradient']),
  background_value: z.string().min(1),
  background_image_fallback: z.string().url().optional(),
  cta_primary_text: z.string().max(50).optional(),
  cta_primary_link: z.string().url().optional(),
  cta_secondary_text: z.string().max(50).optional(),
  cta_secondary_link: z.string().url().optional(),
  overlay_opacity: z.number().min(0).max(1).default(0.3),
  text_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#ffffff'),
  text_alignment: z.enum(['left', 'center', 'right']).default('center'),
  order_index: z.number().int().min(0).optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  metadata: z.record(z.any()).default({}),
});

// Enhanced showreel validation
const showreelValidation = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).optional(),
  video_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  duration: z.number().int().min(1).max(3600).optional(), // 1 second to 1 hour
  category: z.enum(['main', 'corporate', 'creative', 'commercial']).default('main'),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).optional(),
  metadata: z.record(z.any()).default({}),
  seo: z.object({
    meta_title: z.string().max(60).optional(),
    meta_description: z.string().max(160).optional(),
    keywords: z.array(z.string()).max(10).optional(),
  }).optional(),
});

// Media upload validation
const mediaUploadValidation = z.object({
  original_filename: z.string().min(1).max(255),
  file_type: z.enum(['image', 'video', 'document']),
  file_size: z.number().int().min(1),
  category: z.enum(['hero', 'projects', 'showreel', 'general', 'thumbnails', 'previews']).default('general'),
  alt_text: z.string().max(200).optional(),
  metadata: z.record(z.any()).default({}),
});

// Authentication validation
const authValidation = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
});

// User creation validation
const userValidation = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  full_name: z.string().min(1).max(100).trim(),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
});

// Export validation functions
export const validator = {
  validateProject: (data) => projectValidation.safeParse(data),
  validateHeroSection: (data) => heroSectionValidation.safeParse(data),
  validateShowreel: (data) => showreelValidation.safeParse(data),
  validateMediaUpload: (data) => mediaUploadValidation.safeParse(data),
  validateFile: (data) => fileValidation.safeParse(data),
  validateAuth: (data) => authValidation.safeParse(data),
  validateUser: (data) => userValidation.safeParse(data),
};

// Sanitization helpers
export const sanitizer = {
  filename: (filename) => {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase()
      .substring(0, 100);
  },
  
  html: (input) => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  sql: (input) => {
    return input.replace(/[';\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f]/g, '');
  },
};