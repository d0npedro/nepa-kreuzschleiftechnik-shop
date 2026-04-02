import { describe, it, expect, beforeEach, vi } from 'vitest'
import '../mocks/prisma'
import { mockPrisma } from '../mocks/prisma'

// Must import after the mock is registered
import { adjustStock, reduceStockForOrder } from '@/actions/inventory'

describe('adjustStock', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-setup the default $transaction mock to call the callback
    mockPrisma.$transaction.mockImplementation(
      (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)
    )
  })

  it('applies a positive stock adjustment', async () => {
    mockPrisma.product.findUniqueOrThrow.mockResolvedValue({
      id: 'prod-1',
      stock: 5,
      name: 'Widget',
    })
    mockPrisma.product.update.mockResolvedValue({
      id: 'prod-1',
      stock: 8,
    })
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    const result = await adjustStock({
      productId: 'prod-1',
      change: 3,
      reason: 'Restock',
    })

    expect(mockPrisma.product.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      select: { id: true, stock: true, name: true },
    })
    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: 8 },
    })
    expect(mockPrisma.inventoryLog.create).toHaveBeenCalledWith({
      data: {
        productId: 'prod-1',
        change: 3,
        reason: 'Restock',
        userId: undefined,
      },
    })
    expect(result).toEqual({ id: 'prod-1', stock: 8 })
  })

  it('applies a negative stock adjustment', async () => {
    mockPrisma.product.findUniqueOrThrow.mockResolvedValue({
      id: 'prod-1',
      stock: 10,
      name: 'Widget',
    })
    mockPrisma.product.update.mockResolvedValue({
      id: 'prod-1',
      stock: 7,
    })
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    const result = await adjustStock({
      productId: 'prod-1',
      change: -3,
      reason: 'Sold manually',
    })

    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: 7 },
    })
    expect(result).toEqual({ id: 'prod-1', stock: 7 })
  })

  it('rejects adjustment that would result in negative stock', async () => {
    mockPrisma.product.findUniqueOrThrow.mockResolvedValue({
      id: 'prod-1',
      stock: 2,
      name: 'Widget',
    })

    await expect(
      adjustStock({
        productId: 'prod-1',
        change: -5,
        reason: 'Over-deduction',
      })
    ).rejects.toThrow('Bestand kann nicht unter 0 fallen')
  })

  it('rejects an empty reason', async () => {
    await expect(
      adjustStock({
        productId: 'prod-1',
        change: 1,
        reason: '',
      })
    ).rejects.toThrow()
  })

  it('rejects a non-integer change value', async () => {
    await expect(
      adjustStock({
        productId: 'prod-1',
        change: 1.5,
        reason: 'Fractional not allowed',
      })
    ).rejects.toThrow()
  })

  it('passes userId when provided', async () => {
    mockPrisma.product.findUniqueOrThrow.mockResolvedValue({
      id: 'prod-1',
      stock: 10,
      name: 'Widget',
    })
    mockPrisma.product.update.mockResolvedValue({ id: 'prod-1', stock: 15 })
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    await adjustStock({
      productId: 'prod-1',
      change: 5,
      reason: 'Manual restock',
      userId: 'admin-42',
    })

    expect(mockPrisma.inventoryLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'admin-42' }),
    })
  })

  it('handles zero stock adjustment', async () => {
    mockPrisma.product.findUniqueOrThrow.mockResolvedValue({
      id: 'prod-1',
      stock: 5,
      name: 'Widget',
    })
    mockPrisma.product.update.mockResolvedValue({ id: 'prod-1', stock: 5 })
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    const result = await adjustStock({
      productId: 'prod-1',
      change: 0,
      reason: 'Inventory audit – no change',
    })

    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: 5 },
    })
    expect(result).toEqual({ id: 'prod-1', stock: 5 })
  })
})

describe('reduceStockForOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.$transaction.mockImplementation(
      (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)
    )
  })

  it('reduces stock for multiple items', async () => {
    mockPrisma.$executeRaw.mockResolvedValue(1)
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    await reduceStockForOrder(
      [
        { productId: 'a', quantity: 2 },
        { productId: 'b', quantity: 3 },
      ],
      'order-1'
    )

    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(2)
    expect(mockPrisma.inventoryLog.create).toHaveBeenCalledTimes(2)
  })

  it('writes an inventory log entry per item with correct reason', async () => {
    mockPrisma.$executeRaw.mockResolvedValue(1)
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    await reduceStockForOrder(
      [{ productId: 'prod-x', quantity: 4 }],
      'order-99'
    )

    expect(mockPrisma.inventoryLog.create).toHaveBeenCalledWith({
      data: {
        productId: 'prod-x',
        change: -4,
        reason: 'ORDER_PLACED:order-99',
      },
    })
  })

  it('fails if executeRaw returns 0 (stock insufficient)', async () => {
    mockPrisma.$executeRaw.mockResolvedValue(0)

    await expect(
      reduceStockForOrder(
        [{ productId: 'prod-1', quantity: 5 }],
        'order-42'
      )
    ).rejects.toThrow('Nicht genügend Bestand für Produkt prod-1')
  })

  it('stops processing after first insufficient stock item', async () => {
    mockPrisma.$executeRaw
      .mockResolvedValueOnce(1) // first item OK
      .mockResolvedValueOnce(0) // second item fails
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    await expect(
      reduceStockForOrder(
        [
          { productId: 'a', quantity: 1 },
          { productId: 'b', quantity: 999 },
        ],
        'order-50'
      )
    ).rejects.toThrow('Nicht genügend Bestand für Produkt b')

    // First item's log was created, but second was not
    expect(mockPrisma.inventoryLog.create).toHaveBeenCalledTimes(1)
  })

  it('handles single item order successfully', async () => {
    mockPrisma.$executeRaw.mockResolvedValue(1)
    mockPrisma.inventoryLog.create.mockResolvedValue({})

    await expect(
      reduceStockForOrder([{ productId: 'solo', quantity: 1 }], 'order-1')
    ).resolves.not.toThrow()

    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1)
    expect(mockPrisma.inventoryLog.create).toHaveBeenCalledTimes(1)
  })
})
