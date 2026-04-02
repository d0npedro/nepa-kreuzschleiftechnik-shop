import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => import('../mocks/prisma').then((m) => ({ prisma: m.mockPrisma })))
import { mockPrisma } from '../mocks/prisma'

describe('Finder API — /api/finder/machines', () => {
  let GET: typeof import('@/app/api/finder/machines/route').GET

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ GET } = await import('@/app/api/finder/machines/route'))
  })

  it('returns 400 if no manufacturer param is provided', async () => {
    const request = new NextRequest(new URL('http://localhost/api/finder/machines'))
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 if manufacturer param is empty', async () => {
    const request = new NextRequest(new URL('http://localhost/api/finder/machines?manufacturer='))
    const response = await GET(request)

    // Empty string is falsy, so the route returns 400
    expect(response.status).toBe(400)
  })

  it('returns machines for a valid manufacturer', async () => {
    const mockMachines = [
      { id: 'mach-1', name: 'MBB-1200', slug: 'mbb-1200' },
      { id: 'mach-2', name: 'MBB-1600', slug: 'mbb-1600' },
    ]
    mockPrisma.machine.findMany.mockResolvedValue(mockMachines)

    const request = new NextRequest(
      new URL('http://localhost/api/finder/machines?manufacturer=Sunnen')
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual(mockMachines)
    expect(mockPrisma.machine.findMany).toHaveBeenCalledWith({
      where: { manufacturer: 'Sunnen' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })
  })

  it('returns empty array for unknown manufacturer', async () => {
    mockPrisma.machine.findMany.mockResolvedValue([])

    const request = new NextRequest(
      new URL('http://localhost/api/finder/machines?manufacturer=UnknownCorp')
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual([])
  })

  it('passes URL-encoded manufacturer names correctly', async () => {
    mockPrisma.machine.findMany.mockResolvedValue([])

    const request = new NextRequest(
      new URL('http://localhost/api/finder/machines?manufacturer=M%C3%BCller%20%26%20Sohn')
    )
    await GET(request)

    expect(mockPrisma.machine.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { manufacturer: 'Müller & Sohn' },
      })
    )
  })
})

describe('Finder API — /api/finder/products', () => {
  let GET: typeof import('@/app/api/finder/products/route').GET

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ GET } = await import('@/app/api/finder/products/route'))
  })

  it('returns 400 if no machine param is provided', async () => {
    const request = new NextRequest(new URL('http://localhost/api/finder/products'))
    const response = await GET(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('returns 404 if machine is not found', async () => {
    mockPrisma.machine.findUnique.mockResolvedValue(null)

    const request = new NextRequest(
      new URL('http://localhost/api/finder/products?machine=nonexistent-slug')
    )
    const response = await GET(request)

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('returns products for a valid machine slug', async () => {
    const mockMachine = {
      id: 'mach-1',
      name: 'MBB-1200',
      slug: 'mbb-1200',
      products: [
        {
          product: {
            id: 'prod-1',
            name: 'Honleiste CBN K-200',
            slug: 'honleiste-cbn-k-200',
            sku: 'HL-CBN-200',
            price: 189.0,
            stock: 14,
            images: [],
            category: { name: 'Honleisten', slug: 'honleisten' },
          },
        },
      ],
    }
    mockPrisma.machine.findUnique.mockResolvedValue(mockMachine)

    const request = new NextRequest(
      new URL('http://localhost/api/finder/products?machine=mbb-1200')
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveLength(1)
    expect(body[0]).toEqual({
      id: 'prod-1',
      name: 'Honleiste CBN K-200',
      slug: 'honleiste-cbn-k-200',
      sku: 'HL-CBN-200',
      price: 189.0,
      stock: 14,
      images: [],
      category: { name: 'Honleisten', slug: 'honleisten' },
    })
  })

  it('returns empty array when machine has no products', async () => {
    mockPrisma.machine.findUnique.mockResolvedValue({
      id: 'mach-2',
      name: 'MBB-1600',
      slug: 'mbb-1600',
      products: [],
    })

    const request = new NextRequest(
      new URL('http://localhost/api/finder/products?machine=mbb-1600')
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual([])
  })

  it('calls prisma with correct include structure', async () => {
    mockPrisma.machine.findUnique.mockResolvedValue({
      id: 'mach-1',
      slug: 'mbb-1200',
      products: [],
    })

    const request = new NextRequest(
      new URL('http://localhost/api/finder/products?machine=mbb-1200')
    )
    await GET(request)

    expect(mockPrisma.machine.findUnique).toHaveBeenCalledWith({
      where: { slug: 'mbb-1200' },
      include: {
        products: {
          include: {
            product: {
              include: { category: { select: { name: true, slug: true } } },
            },
          },
        },
      },
    })
  })
})
