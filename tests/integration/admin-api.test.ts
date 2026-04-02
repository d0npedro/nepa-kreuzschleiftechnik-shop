import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---

vi.mock('@/lib/prisma', () => import('../mocks/prisma').then((m) => ({ prisma: m.mockPrisma })))
import { mockPrisma } from '../mocks/prisma'

const mockRequireAdmin = vi.fn()
vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}))

const mockAdjustStock = vi.fn()
vi.mock('@/actions/inventory', () => ({
  adjustStock: (...args: unknown[]) => mockAdjustStock(...args),
}))

// --- Helpers ---

const validAdminAuth = {
  user: { id: 'user-1' },
  adminUser: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN', supabaseId: 'user-1' },
}

const unauthResponse = { error: 'Nicht authentifiziert', status: 401 }
const forbiddenResponse = { error: 'Keine Admin-Berechtigung', status: 403 }

function makeJsonRequest(body: unknown, url = 'http://localhost/api/admin') {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ============================================================
// Products API
// ============================================================

describe('Admin API — /api/admin/products', () => {
  let GET: typeof import('@/app/api/admin/products/route').GET
  let POST: typeof import('@/app/api/admin/products/route').POST

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ GET, POST } = await import('@/app/api/admin/products/route'))
  })

  it('GET returns product list for authenticated admin', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Honleiste CBN',
        sku: 'HL-CBN',
        price: 189,
        category: { id: 'cat-1', name: 'Honleisten' },
        compatibleMachines: [],
        createdAt: new Date(),
      },
    ]
    mockPrisma.product.findMany.mockResolvedValue(mockProducts)

    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe('Honleiste CBN')
  })

  it('GET rejects unauthenticated requests with 401', async () => {
    mockRequireAdmin.mockResolvedValue(unauthResponse)

    const response = await GET()

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Nicht authentifiziert')
  })

  it('GET rejects non-admin users with 403', async () => {
    mockRequireAdmin.mockResolvedValue(forbiddenResponse)

    const response = await GET()

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Keine Admin-Berechtigung')
  })

  it('POST creates a product with valid data', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const createdProduct = {
      id: 'prod-new',
      name: 'Neues Produkt',
      sku: 'NP-001',
      slug: 'neues-produkt',
      price: 99.99,
      stock: 10,
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Honleisten' },
      compatibleMachines: [],
    }

    // The route uses $transaction, which our mock passes the mockPrisma as tx
    mockPrisma.product.create.mockResolvedValue({ id: 'prod-new' })
    mockPrisma.product.findUniqueOrThrow.mockResolvedValue(createdProduct)

    const request = makeJsonRequest({
      name: 'Neues Produkt',
      sku: 'NP-001',
      slug: 'neues-produkt',
      price: 99.99,
      stock: 10,
      categoryId: 'cat-1',
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.name).toBe('Neues Produkt')
  })

  it('POST rejects unauthenticated requests', async () => {
    mockRequireAdmin.mockResolvedValue(unauthResponse)

    const request = makeJsonRequest({ name: 'Test' })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('POST returns 400 for invalid body (missing required fields)', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const request = makeJsonRequest({ name: 'Only name' })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validierungsfehler')
  })

  it('POST creates product with machine associations', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const createdProduct = {
      id: 'prod-linked',
      name: 'Linked Product',
      sku: 'LP-001',
      slug: 'linked-product',
      price: 50,
      stock: 5,
      categoryId: 'cat-1',
      category: { id: 'cat-1', name: 'Honleisten' },
      compatibleMachines: [{ machine: { id: 'mach-1', name: 'MBB-1200' } }],
    }

    mockPrisma.product.create.mockResolvedValue({ id: 'prod-linked' })
    mockPrisma.productMachine.createMany.mockResolvedValue({ count: 1 })
    mockPrisma.product.findUniqueOrThrow.mockResolvedValue(createdProduct)

    const request = makeJsonRequest({
      name: 'Linked Product',
      sku: 'LP-001',
      slug: 'linked-product',
      price: 50,
      stock: 5,
      categoryId: 'cat-1',
      machineIds: ['mach-1'],
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(mockPrisma.productMachine.createMany).toHaveBeenCalled()
  })
})

// ============================================================
// Categories API
// ============================================================

describe('Admin API — /api/admin/categories', () => {
  let GET: typeof import('@/app/api/admin/categories/route').GET
  let POST: typeof import('@/app/api/admin/categories/route').POST

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ GET, POST } = await import('@/app/api/admin/categories/route'))
  })

  it('GET returns categories for authenticated admin', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const mockCategories = [
      { id: 'cat-1', name: 'Honleisten', slug: 'honleisten', _count: { products: 5 } },
      { id: 'cat-2', name: 'Schleifsteine', slug: 'schleifsteine', _count: { products: 3 } },
    ]
    mockPrisma.category.findMany.mockResolvedValue(mockCategories)

    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveLength(2)
    expect(body[0].name).toBe('Honleisten')
  })

  it('POST creates a category with valid data', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const newCategory = { id: 'cat-new', name: 'Zubehör', slug: 'zubehoer' }
    mockPrisma.category.create.mockResolvedValue(newCategory)

    const request = makeJsonRequest({ name: 'Zubehör', slug: 'zubehoer' })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.name).toBe('Zubehör')
    expect(body.slug).toBe('zubehoer')
  })

  it('POST returns 400 for invalid category data', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const request = makeJsonRequest({ name: '' })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Validierungsfehler')
  })
})

// ============================================================
// Inventory API
// ============================================================

describe('Admin API — /api/admin/inventory', () => {
  let POST: typeof import('@/app/api/admin/inventory/route').POST

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ POST } = await import('@/app/api/admin/inventory/route'))
  })

  it('POST adjusts stock for valid input', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const updatedProduct = { id: 'prod-1', name: 'Honleiste', stock: 15 }
    mockAdjustStock.mockResolvedValue(updatedProduct)

    const request = makeJsonRequest({
      productId: 'prod-1',
      change: 5,
      reason: 'Nachlieferung',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.stock).toBe(15)
    expect(mockAdjustStock).toHaveBeenCalledWith({
      productId: 'prod-1',
      change: 5,
      reason: 'Nachlieferung',
      userId: 'user-1',
    })
  })

  it('POST returns 400 for invalid inventory data', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const request = makeJsonRequest({ productId: '', change: 'not-a-number', reason: '' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('POST returns 400 when adjustStock throws an error', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)
    mockAdjustStock.mockRejectedValue(new Error('Bestand kann nicht unter 0 fallen'))

    const request = makeJsonRequest({
      productId: 'prod-1',
      change: -100,
      reason: 'Korrektur',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('Bestand kann nicht unter 0 fallen')
  })
})

// ============================================================
// Orders API
// ============================================================

describe('Admin API — /api/admin/orders', () => {
  let GET: typeof import('@/app/api/admin/orders/route').GET

  beforeEach(async () => {
    vi.clearAllMocks()
    ;({ GET } = await import('@/app/api/admin/orders/route'))
  })

  it('GET returns paginated orders for authenticated admin', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    const mockOrders = [
      { id: 'order-1', status: 'PAID', items: [], createdAt: new Date() },
      { id: 'order-2', status: 'PENDING', items: [], createdAt: new Date() },
    ]
    mockPrisma.order.findMany.mockResolvedValue(mockOrders)
    mockPrisma.order.count.mockResolvedValue(2)

    const request = new Request('http://localhost/api/admin/orders')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.orders).toHaveLength(2)
    expect(body.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    })
  })

  it('GET filters orders by status', async () => {
    mockRequireAdmin.mockResolvedValue(validAdminAuth)

    mockPrisma.order.findMany.mockResolvedValue([])
    mockPrisma.order.count.mockResolvedValue(0)

    const request = new Request('http://localhost/api/admin/orders?status=PAID')
    await GET(request)

    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PAID' },
      })
    )
    expect(mockPrisma.order.count).toHaveBeenCalledWith({ where: { status: 'PAID' } })
  })

  it('GET rejects unauthenticated requests', async () => {
    mockRequireAdmin.mockResolvedValue(unauthResponse)

    const request = new Request('http://localhost/api/admin/orders')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})
