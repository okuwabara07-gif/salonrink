import { z } from 'zod'

// ========================================
// Database schema (Supabase salon_menus table)
// ========================================

export const MenuRow = z.object({
  id: z.string().uuid(),
  salon_id: z.string().uuid(),
  name: z.string(),
  price: z.number().int(),
  duration: z.number().int(),
  category: z.string().nullable(),
  sort_order: z.number().int(),
  created_at: z.string(),
})

export type MenuRow = z.infer<typeof MenuRow>

// ========================================
// Request/Response schemas
// ========================================

// POST /api/menus - Create menu
export const CreateMenuRequest = z.object({
  name: z.string().min(1, 'Menu name is required').max(200, 'Menu name too long'),
  price: z.number().int().min(0, 'Price must be non-negative'),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes'),
  category: z.string().max(50).optional(),
})

export type CreateMenuRequest = z.infer<typeof CreateMenuRequest>

// PATCH /api/menus/[id] - Update menu
export const UpdateMenuRequest = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().int().min(0).optional(),
  duration: z.number().int().min(15).optional(),
  category: z.string().max(50).optional(),
})

export type UpdateMenuRequest = z.infer<typeof UpdateMenuRequest>

// ========================================
// Response schema
// ========================================

export const ApiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    error: z.string().nullable(),
  })

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}

// Success response helper
export function successResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null }
}

// Error response helper
export function errorResponse<T>(error: string): ApiResponse<T> {
  return { data: null, error }
}
