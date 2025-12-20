import { z } from 'zod';

/**
 * Validation schemas for the E-Commerce Conversion Toolkit
 */

// Store Settings Schema
export const storeSettingsSchema = z.object({
  name: z.string()
    .min(1, 'Store name is required')
    .max(100, 'Store name must be less than 100 characters'),

  platform: z.enum(['shopify', 'woocommerce', 'magento', 'custom'], {
    message: 'Please select a valid platform',
  }),

  webhook_secret: z.string().optional(),

  api_key: z.string().optional(),

  cart_reminder_enabled: z.boolean().default(true),

  cart_reminder_delay_hours: z.number()
    .min(1, 'Delay must be at least 1 hour')
    .max(168, 'Delay cannot exceed 7 days (168 hours)')
    .default(24),
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

// Customer Schema
export const customerSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),

  name: z.string()
    .min(1, 'Customer name is required')
    .max(200, 'Name is too long'),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// Review Schema
export const reviewSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),

  product_name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name is too long'),

  customer_name: z.string()
    .max(200, 'Customer name is too long')
    .optional(),

  rating: z.number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),

  review_text: z.string()
    .max(2000, 'Review text is too long')
    .optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// Authentication Schema
export const authSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),

  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type AuthInput = z.infer<typeof authSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Cart Item Schema
export const cartItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),

  product_name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name is too long'),

  product_image: z.string().url('Invalid image URL').optional().or(z.literal('')),

  quantity: z.number()
    .min(1, 'Quantity must be at least 1')
    .int('Quantity must be a whole number'),

  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price is too high'),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

// Abandoned Cart Schema
export const abandonedCartSchema = z.object({
  customer_email: z.string().email('Please enter a valid email address'),

  customer_name: z.string()
    .max(200, 'Customer name is too long')
    .optional(),

  cart_token: z.string().min(1, 'Cart token is required'),

  cart_url: z.string().url('Invalid cart URL').optional().or(z.literal('')),

  total_price: z.number()
    .min(0, 'Total price cannot be negative'),

  currency: z.string()
    .length(3, 'Currency code must be 3 characters (e.g., USD, EUR)')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters'),

  items: z.array(cartItemSchema).min(1, 'Cart must have at least one item'),
});

export type AbandonedCartInput = z.infer<typeof abandonedCartSchema>;

// AI Copywriter Schema
export const aiCopywriterSchema = z.object({
  context: z.string()
    .min(10, 'Context must be at least 10 characters')
    .max(500, 'Context is too long (max 500 characters)'),

  tone: z.enum(['professional', 'casual', 'urgent', 'friendly'], {
    message: 'Please select a valid tone',
  }),

  type: z.enum(['subject_line', 'body', 'cta'], {
    message: 'Please select a content type',
  }),
});

export type AICopywriterInput = z.infer<typeof aiCopywriterSchema>;

// Export validation
export const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'json', 'xlsx'], {
    message: 'Please select a valid export format',
  }),

  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).refine(
    (data) => data.end >= data.start,
    { message: 'End date must be after start date' }
  ).optional(),
});

export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;
