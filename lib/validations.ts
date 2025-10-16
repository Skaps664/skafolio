/**
 * Validation Schemas using Zod
 * Fast runtime validation for all API inputs
 */

import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Card Schemas
export const createCardSchema = z.object({
  title: z.string().optional(),
  data: z.object({
    personal: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      jobTitle: z.string().optional(),
      company: z.string().optional(),
      website: z.string().url().optional().or(z.literal('')),
      bio: z.string().optional(),
      profileImage: z.string().optional(),
      email: z.string().email().optional().or(z.literal('')),
      phone: z.string().optional(),
      address: z.object({
        city: z.string().optional(),
        country: z.string().optional(),
      }).optional(),
    }).optional(),
    social: z.array(z.object({
      platform: z.string(),
      url: z.string().url(),
      icon: z.string().optional(),
    })).optional(),
    links: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().url(),
      description: z.string().optional(),
      icon: z.string().optional(),
      visible: z.boolean().default(true),
      order: z.number(),
    })).optional(),
    stats: z.object({
      projects: z.string().optional(),
      awards: z.string().optional(),
      experience: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const updateCardSchema = createCardSchema.partial();

export const publishCardSchema = z.object({
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaImage: z.string().optional(),
});

// Order Schemas
export const createOrderSchema = z.object({
  cardId: z.string().optional(),
  productType: z.enum(['NFC_CARD', 'QR_STICKER', 'SUBSCRIPTION', 'REMAP']),
  quantity: z.number().min(1).max(100),
  material: z.enum(['plastic', 'metal', 'wood']).optional(),
  customDesign: z.string().optional(),
  paymentMethod: z.enum(['PAYFAST', 'COD']),
  shippingInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
    notes: z.string().optional(),
  }),
});

// Theme Schemas
export const createThemeSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  previewUrl: z.string().url().optional(),
  isPremium: z.boolean().default(false),
  price: z.number().min(0).optional(),
  config: z.object({
    colors: z.object({
      primary: z.string(),
      accent: z.string(),
      background: z.string(),
      text: z.string(),
    }),
    fonts: z.object({
      heading: z.string(),
      body: z.string(),
    }),
    layout: z.enum(['centered', 'left', 'compact']),
  }),
});

// Analytics Schemas
export const analyticsEventSchema = z.object({
  cardId: z.string(),
  eventType: z.enum(['view', 'link_click', 'qr_scan', 'share']),
  metadata: z.object({
    source: z.string().optional(),
    userAgent: z.string().optional(),
    linkId: z.string().optional(),
    referrer: z.string().optional(),
  }).optional(),
});

// Admin Schemas
export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  trackingNo: z.string().optional(),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type PublishCardInput = z.infer<typeof publishCardSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateThemeInput = z.infer<typeof createThemeSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
