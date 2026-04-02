import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../mocks/prisma'
import { mockPrisma } from '../mocks/prisma'

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}))

import { createCheckoutSession } from '@/actions/checkout'
import { stripe } from '@/lib/stripe'

const mockStripeCreate = stripe.checkout.sessions.create as ReturnType<typeof vi.fn>

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    name: 'Schleifscheibe',
    slug: 'schleifscheibe',
    sku: 'SS-001',
    price: 29.99,
    stock: 10,
    isUsed: false,
    isB2BOnly: false,
    images: '[]',
    ...overrides,
  }
}

describe('createCheckoutSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'https://shop.example.com'
  })

  it('rejects an empty items array', async () => {
    await expect(
      createCheckoutSession({ items: [] })
    ).rejects.toThrow()
  })

  it('rejects items with zero quantity', async () => {
    await expect(
      createCheckoutSession({
        items: [{ productId: 'prod-1', quantity: 0 }],
      })
    ).rejects.toThrow()
  })

  it('rejects items with negative quantity', async () => {
    await expect(
      createCheckoutSession({
        items: [{ productId: 'prod-1', quantity: -2 }],
      })
    ).rejects.toThrow()
  })

  it('rejects if a product is not found', async () => {
    // Return fewer products than requested
    mockPrisma.product.findMany.mockResolvedValue([])

    await expect(
      createCheckoutSession({
        items: [{ productId: 'nonexistent', quantity: 1 }],
      })
    ).rejects.toThrow('Ein oder mehrere Produkte wurden nicht gefunden')
  })

  it('rejects if stock is insufficient', async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      makeProduct({ id: 'prod-1', stock: 2 }),
    ])

    await expect(
      createCheckoutSession({
        items: [{ productId: 'prod-1', quantity: 5 }],
      })
    ).rejects.toThrow('Nicht genügend Bestand')
  })

  it('creates an order and stripe session on success', async () => {
    const product = makeProduct({ id: 'prod-1', stock: 10, price: 20 })
    mockPrisma.product.findMany.mockResolvedValue([product])
    mockPrisma.order.create.mockResolvedValue({ id: 'order-1' })
    mockPrisma.order.update.mockResolvedValue({})
    mockStripeCreate.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/session-url',
    })

    const result = await createCheckoutSession({
      items: [{ productId: 'prod-1', quantity: 2 }],
    })

    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING',
          total: 40,
        }),
      })
    )
    expect(mockStripeCreate).toHaveBeenCalledTimes(1)
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: { stripeSessionId: 'cs_test_123' },
    })
    expect(result).toEqual({
      url: 'https://checkout.stripe.com/session-url',
      orderId: 'order-1',
    })
  })

  it('handles the email parameter', async () => {
    const product = makeProduct({ id: 'prod-1', stock: 10, price: 15 })
    mockPrisma.product.findMany.mockResolvedValue([product])
    mockPrisma.order.create.mockResolvedValue({ id: 'order-2' })
    mockPrisma.order.update.mockResolvedValue({})
    mockStripeCreate.mockResolvedValue({
      id: 'cs_test_456',
      url: 'https://checkout.stripe.com/session-email',
    })

    await createCheckoutSession({
      items: [{ productId: 'prod-1', quantity: 1 }],
      customerEmail: 'test@example.com',
    })

    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerEmail: 'test@example.com',
          customerId: 'test@example.com',
        }),
      })
    )
    expect(mockStripeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'test@example.com',
      })
    )
  })

  it('uses "anonymous" as customerId when no email is given', async () => {
    const product = makeProduct({ id: 'prod-1', stock: 5, price: 10 })
    mockPrisma.product.findMany.mockResolvedValue([product])
    mockPrisma.order.create.mockResolvedValue({ id: 'order-3' })
    mockPrisma.order.update.mockResolvedValue({})
    mockStripeCreate.mockResolvedValue({ id: 'cs_test_789', url: 'https://stripe.com/x' })

    await createCheckoutSession({
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    expect(mockPrisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: 'anonymous',
        }),
      })
    )
  })

  it('rejects an invalid email format', async () => {
    await expect(
      createCheckoutSession({
        items: [{ productId: 'prod-1', quantity: 1 }],
        customerEmail: 'not-an-email',
      })
    ).rejects.toThrow()
  })

  it('includes correct line_items in stripe session', async () => {
    const product = makeProduct({ id: 'p1', stock: 10, price: 49.99, name: 'Diamant Scheibe', sku: 'DS-01' })
    mockPrisma.product.findMany.mockResolvedValue([product])
    mockPrisma.order.create.mockResolvedValue({ id: 'order-4' })
    mockPrisma.order.update.mockResolvedValue({})
    mockStripeCreate.mockResolvedValue({ id: 'cs_test', url: 'https://stripe.com/y' })

    await createCheckoutSession({
      items: [{ productId: 'p1', quantity: 3 }],
    })

    expect(mockStripeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            quantity: 3,
            price_data: expect.objectContaining({
              currency: 'eur',
              unit_amount: 4999,
              product_data: expect.objectContaining({
                name: 'Diamant Scheibe',
                description: 'SKU: DS-01',
              }),
            }),
          }),
        ],
      })
    )
  })
})
