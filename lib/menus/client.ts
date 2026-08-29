'use client'

import { MenuRow, CreateMenuRequest, UpdateMenuRequest, ApiResponse } from './schema'

/**
 * UI-side API client wrapper for menu operations.
 * Handles authentication via LIFF, error handling, and response parsing.
 * All requests assume LIFF context (user authenticated via LINE).
 */

// ========================================
// Type definitions
// ========================================

export interface MenuListResponse {
  items: MenuRow[]
  total: number
  groupedByCategory: Record<string, MenuRow[]>
}

export interface MenuOperationResponse {
  success: boolean
  message: string
}

// ========================================
// GET: Fetch all menus for current salon
// ========================================

export async function fetchMenus(): Promise<MenuListResponse | null> {
  try {
    const res = await fetch('/api/menus', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json()
      console.error(`GET /api/menus failed: ${error.error}`)
      return null
    }

    const { data, error } = (await res.json()) as ApiResponse<MenuRow[]>

    if (error || !data) {
      console.error(`API error: ${error}`)
      return null
    }

    // Group by category for tab filtering
    const grouped: Record<string, MenuRow[]> = {}
    data.forEach((menu) => {
      const cat = menu.category || 'その他'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(menu)
    })

    return {
      items: data,
      total: data.length,
      groupedByCategory: grouped,
    }
  } catch (err) {
    console.error('fetchMenus exception:', err)
    return null
  }
}

// ========================================
// POST: Create new menu
// ========================================

export async function createMenu(
  payload: CreateMenuRequest
): Promise<MenuRow | null> {
  try {
    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error(`POST /api/menus failed: ${error.error}`)
      return null
    }

    const { data, error } = (await res.json()) as ApiResponse<MenuRow>

    if (error || !data) {
      console.error(`API error: ${error}`)
      return null
    }

    return data
  } catch (err) {
    console.error('createMenu exception:', err)
    return null
  }
}

// ========================================
// PATCH: Update existing menu
// ========================================

export async function updateMenu(
  id: string,
  payload: UpdateMenuRequest
): Promise<MenuRow | null> {
  try {
    const res = await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error(`PATCH /api/menus/${id} failed: ${error.error}`)
      return null
    }

    const { data, error } = (await res.json()) as ApiResponse<MenuRow>

    if (error || !data) {
      console.error(`API error: ${error}`)
      return null
    }

    return data
  } catch (err) {
    console.error('updateMenu exception:', err)
    return null
  }
}

// ========================================
// DELETE: Remove menu
// ========================================

export async function deleteMenu(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/menus/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!res.ok) {
      const error = await res.json()
      console.error(`DELETE /api/menus/${id} failed: ${error.error}`)
      return false
    }

    const { data, error } = (await res.json()) as ApiResponse<{ deleted: boolean }>

    if (error || !data) {
      console.error(`API error: ${error}`)
      return false
    }

    return data.deleted === true
  } catch (err) {
    console.error('deleteMenu exception:', err)
    return false
  }
}

// ========================================
// Error handling helper
// ========================================

export function getErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  return 'Unknown error occurred'
}
