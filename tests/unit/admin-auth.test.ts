import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../mocks/prisma'
import { mockPrisma } from '../mocks/prisma'

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
    })
  ),
}))

import { requireAdmin } from '@/lib/admin-auth'

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 error if no user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await requireAdmin()

    expect(result).toEqual({
      error: 'Nicht authentifiziert',
      status: 401,
    })
  })

  it('returns 403 error if user is not an admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'user@example.com' } },
    })
    mockPrisma.adminUser.findUnique.mockResolvedValue(null)

    const result = await requireAdmin()

    expect(result).toEqual({
      error: 'Keine Admin-Berechtigung',
      status: 403,
    })
    expect(mockPrisma.adminUser.findUnique).toHaveBeenCalledWith({
      where: { supabaseId: 'user-1' },
    })
  })

  it('returns user and adminUser on success', async () => {
    const supabaseUser = { id: 'user-1', email: 'admin@example.com' }
    const adminRecord = { id: 'admin-1', supabaseId: 'user-1', role: 'ADMIN' }

    mockGetUser.mockResolvedValue({ data: { user: supabaseUser } })
    mockPrisma.adminUser.findUnique.mockResolvedValue(adminRecord)

    const result = await requireAdmin()

    expect(result).toEqual({
      user: supabaseUser,
      adminUser: adminRecord,
    })
    expect(result).not.toHaveProperty('error')
    expect(result).not.toHaveProperty('status')
  })

  it('queries adminUser by the correct supabaseId', async () => {
    const supabaseUser = { id: 'specific-id-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({ data: { user: supabaseUser } })
    mockPrisma.adminUser.findUnique.mockResolvedValue(null)

    await requireAdmin()

    expect(mockPrisma.adminUser.findUnique).toHaveBeenCalledWith({
      where: { supabaseId: 'specific-id-123' },
    })
  })

  it('does not query adminUser if no user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    await requireAdmin()

    expect(mockPrisma.adminUser.findUnique).not.toHaveBeenCalled()
  })

  it('returns the full adminUser record including all fields', async () => {
    const supabaseUser = { id: 'user-2', email: 'boss@shop.de' }
    const adminRecord = {
      id: 'admin-2',
      supabaseId: 'user-2',
      role: 'SUPER_ADMIN',
      createdAt: new Date('2025-01-01'),
    }

    mockGetUser.mockResolvedValue({ data: { user: supabaseUser } })
    mockPrisma.adminUser.findUnique.mockResolvedValue(adminRecord)

    const result = await requireAdmin()

    expect(result).toHaveProperty('adminUser')
    expect((result as any).adminUser.role).toBe('SUPER_ADMIN')
    expect((result as any).adminUser.createdAt).toEqual(new Date('2025-01-01'))
  })
})
