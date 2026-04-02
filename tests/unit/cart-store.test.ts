import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'

// Mock zustand persist middleware to pass through the config function directly
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware')
  return { ...actual, persist: (config: any) => config }
})

import { useCartStore } from '@/lib/cart-store'
import type { CartItem } from '@/types'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'prod-1',
    name: 'Schleifscheibe',
    slug: 'schleifscheibe',
    sku: 'SS-001',
    price: 29.99,
    quantity: 1,
    stock: 10,
    image: null,
    ...overrides,
  }
}

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useCartStore.setState({ items: [] })
    })
  })

  describe('addItem', () => {
    it('adds a new item to the cart', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem())
      })
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe('prod-1')
      expect(items[0].quantity).toBe(1)
    })

    it('increases quantity of an existing item', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 2 }))
      })
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 3 }))
      })
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(5)
    })

    it('caps quantity at stock when adding to existing item', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 8, stock: 10 }))
      })
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 5, stock: 10 }))
      })
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(10)
    })

    it('does not exceed stock even with large quantity', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 100, stock: 3 }))
      })
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 100, stock: 3 }))
      })
      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })

    it('adds multiple different items', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'a', name: 'A' }))
      })
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'b', name: 'B' }))
      })
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'c', name: 'C' }))
      })
      expect(useCartStore.getState().items).toHaveLength(3)
    })
  })

  describe('removeItem', () => {
    it('removes an item by productId', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'a' }))
        useCartStore.getState().addItem(makeItem({ productId: 'b' }))
      })
      act(() => {
        useCartStore.getState().removeItem('a')
      })
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe('b')
    })

    it('does nothing when removing a non-existent productId', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem())
      })
      act(() => {
        useCartStore.getState().removeItem('nonexistent')
      })
      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('updates the quantity of an item', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 1, stock: 10 }))
      })
      act(() => {
        useCartStore.getState().updateQuantity('prod-1', 5)
      })
      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('caps quantity at minimum of 1', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 3, stock: 10 }))
      })
      act(() => {
        useCartStore.getState().updateQuantity('prod-1', 0)
      })
      expect(useCartStore.getState().items[0].quantity).toBe(1)
    })

    it('caps quantity at stock', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 1, stock: 5 }))
      })
      act(() => {
        useCartStore.getState().updateQuantity('prod-1', 99)
      })
      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('clamps negative quantity to 1', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 3, stock: 10 }))
      })
      act(() => {
        useCartStore.getState().updateQuantity('prod-1', -5)
      })
      expect(useCartStore.getState().items[0].quantity).toBe(1)
    })
  })

  describe('clearCart', () => {
    it('removes all items from the cart', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'a' }))
        useCartStore.getState().addItem(makeItem({ productId: 'b' }))
      })
      act(() => {
        useCartStore.getState().clearCart()
      })
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('is idempotent on an empty cart', () => {
      act(() => {
        useCartStore.getState().clearCart()
      })
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('totalItems', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().totalItems()).toBe(0)
    })

    it('returns the sum of all item quantities', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'a', quantity: 2 }))
        useCartStore.getState().addItem(makeItem({ productId: 'b', quantity: 3 }))
      })
      expect(useCartStore.getState().totalItems()).toBe(5)
    })
  })

  describe('totalPrice', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().totalPrice()).toBe(0)
    })

    it('returns correct total for single item', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ price: 10, quantity: 3 }))
      })
      expect(useCartStore.getState().totalPrice()).toBe(30)
    })

    it('returns correct total for multiple items', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'a', price: 10, quantity: 2 }))
        useCartStore.getState().addItem(makeItem({ productId: 'b', price: 25.5, quantity: 1 }))
      })
      expect(useCartStore.getState().totalPrice()).toBeCloseTo(45.5)
    })
  })
})
