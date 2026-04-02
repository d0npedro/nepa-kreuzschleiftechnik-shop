import { describe, it, expect, beforeEach, vi } from 'vitest'

// --- Mocks ---

vi.mock('@/lib/prisma', () => import('../mocks/prisma').then((m) => ({ prisma: m.mockPrisma })))
import { mockPrisma } from '../mocks/prisma'

const mockConstructEvent = vi.fn()
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: (...args: unknown[]) => mockConstructEvent(...args),
    },
  },
}))

const mockReduceStockForOrder = vi.fn()
vi.mock('@/actions/inventory', () => ({
  reduceStockForOrder: (...args: unknown[]) => mockReduceStockForOrder(...args),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

import { headers } from 'next/headers'
import { POST } from '@/app/api/webhooks/stripe/route'

// --- Helpers ---

function makeRequest(body: string) {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
  })
}

function makeStripeEvent(type: string, data: Record<string, unknown> = {}) {
  return {
    type,
    data: {
      object: data,
    },
  }
}

describe('Stripe Webhook — /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 if no stripe-signature header is present', async () => {
    const mockHeaders = new Headers()
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Missing stripe-signature')
  })

  it('returns 400 if signature verification fails', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_invalid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const response = await POST(makeRequest('{}'))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid signature')
  })

  it('handles checkout.session.completed — updates order to PAID', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('checkout.session.completed', {
        metadata: { orderId: 'order-1' },
        customer_details: { email: 'kunde@example.com' },
      })
    )

    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: 'PENDING',
      customerEmail: null,
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    })

    mockReduceStockForOrder.mockResolvedValue(undefined)
    mockPrisma.order.update.mockResolvedValue({})

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    expect(mockReduceStockForOrder).toHaveBeenCalledWith(
      [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
      'order-1'
    )
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      data: {
        status: 'PAID',
        customerEmail: 'kunde@example.com',
      },
    })
  })

  it('handles already paid order (idempotency) — does not update or reduce stock', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('checkout.session.completed', {
        metadata: { orderId: 'order-2' },
      })
    )

    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-2',
      status: 'PAID',
      items: [],
    })

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    expect(mockReduceStockForOrder).not.toHaveBeenCalled()
    expect(mockPrisma.order.update).not.toHaveBeenCalled()
  })

  it('handles checkout.session.completed with missing orderId in metadata', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('checkout.session.completed', {
        metadata: {},
      })
    )

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    expect(mockPrisma.order.findUnique).not.toHaveBeenCalled()
  })

  it('handles checkout.session.completed when order not found in DB', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('checkout.session.completed', {
        metadata: { orderId: 'order-missing' },
      })
    )

    mockPrisma.order.findUnique.mockResolvedValue(null)

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    expect(mockReduceStockForOrder).not.toHaveBeenCalled()
    expect(mockPrisma.order.update).not.toHaveBeenCalled()
  })

  it('handles stock reduction failure — sets order status to STOCK_ERROR', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('checkout.session.completed', {
        metadata: { orderId: 'order-3' },
        customer_details: { email: 'kunde@example.com' },
      })
    )

    mockPrisma.order.findUnique.mockResolvedValue({
      id: 'order-3',
      status: 'PENDING',
      items: [{ productId: 'prod-1', quantity: 999 }],
    })

    mockReduceStockForOrder.mockRejectedValue(new Error('Nicht genügend Bestand'))
    mockPrisma.order.update.mockResolvedValue({})

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-3' },
      data: { status: 'STOCK_ERROR' },
    })
    // Should NOT be called with PAID status
    expect(mockPrisma.order.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAID' }),
      })
    )
  })

  it('handles checkout.session.expired — sets order to EXPIRED', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('checkout.session.expired', {
        metadata: { orderId: 'order-4' },
      })
    )

    mockPrisma.order.update.mockResolvedValue({})

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order-4' },
      data: { status: 'EXPIRED' },
    })
  })

  it('returns { received: true } for unknown event types', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('payment_intent.succeeded', { id: 'pi_123' })
    )

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ received: true })
  })

  it('handles checkout.session.expired without orderId in metadata', async () => {
    const mockHeaders = new Headers({ 'stripe-signature': 'sig_valid' })
    vi.mocked(headers).mockResolvedValue(mockHeaders)

    mockConstructEvent.mockReturnValue(
      makeStripeEvent('checkout.session.expired', {
        metadata: {},
      })
    )

    const response = await POST(makeRequest('stripe-body'))

    expect(response.status).toBe(200)
    expect(mockPrisma.order.update).not.toHaveBeenCalled()
  })
})
