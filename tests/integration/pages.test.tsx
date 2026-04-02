import { describe, it, expect, beforeEach, vi } from 'vitest'
import { isValidElement } from 'react'

// --- Mocks ---

vi.mock('@/lib/prisma', () => import('../mocks/prisma').then((m) => ({ prisma: m.mockPrisma })))

vi.mock('@/lib/queries', () => ({
  getFeaturedProducts: vi.fn().mockResolvedValue([]),
  getCategories: vi.fn().mockResolvedValue([]),
  getProducts: vi.fn().mockResolvedValue([]),
  getProductBySlug: vi.fn().mockResolvedValue(null),
  getManufacturers: vi.fn().mockResolvedValue([]),
  getMachines: vi.fn().mockResolvedValue([]),
  getMachinesByManufacturer: vi.fn().mockResolvedValue([]),
  getProductsByMachine: vi.fn().mockResolvedValue(null),
  getCategoryBySlug: vi.fn().mockResolvedValue(null),
  searchProducts: vi.fn().mockResolvedValue([]),
  getOrdersByCustomer: vi.fn().mockResolvedValue([]),
}))

vi.mock('next/cache', () => ({
  unstable_cache: (_fn: Function) => _fn,
}))

// ============================================================
// Homepage
// ============================================================

describe('Homepage — app/page.tsx', () => {
  it('renders without errors and returns valid JSX', async () => {
    const { default: HomePage } = await import('@/app/page')
    const result = await HomePage()

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    expect(isValidElement(result)).toBe(true)
  })

  it('renders with fallback placeholder data when queries return empty arrays', async () => {
    const { getFeaturedProducts, getCategories } = await import('@/lib/queries')
    vi.mocked(getFeaturedProducts).mockResolvedValue([])
    vi.mocked(getCategories).mockResolvedValue([])

    const { default: HomePage } = await import('@/app/page')
    const result = await HomePage()

    expect(result).toBeDefined()
    expect(isValidElement(result)).toBe(true)
  })
})

// ============================================================
// KontaktPage
// ============================================================

describe('KontaktPage — app/kontakt/page.tsx', () => {
  it('renders without errors and returns valid JSX', async () => {
    const { default: KontaktPage } = await import('@/app/kontakt/page')
    const result = KontaktPage()

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    expect(isValidElement(result)).toBe(true)
  })

  it('exports metadata with the title "Kontakt"', async () => {
    const { metadata } = await import('@/app/kontakt/page')
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Kontakt')
  })
})

// ============================================================
// ImpressumPage
// ============================================================

describe('ImpressumPage — app/impressum/page.tsx', () => {
  it('renders without errors and returns valid JSX', async () => {
    const { default: ImpressumPage } = await import('@/app/impressum/page')
    const result = ImpressumPage()

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    expect(isValidElement(result)).toBe(true)
  })

  it('exports metadata with the title "Impressum"', async () => {
    const { metadata } = await import('@/app/impressum/page')
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Impressum')
  })
})

// ============================================================
// DatenschutzPage
// ============================================================

describe('DatenschutzPage — app/datenschutz/page.tsx', () => {
  it('renders without errors and returns valid JSX', async () => {
    const { default: DatenschutzPage } = await import('@/app/datenschutz/page')
    const result = DatenschutzPage()

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    expect(isValidElement(result)).toBe(true)
  })

  it('exports metadata with the correct title', async () => {
    const { metadata } = await import('@/app/datenschutz/page')
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Datenschutzerklärung')
  })
})

// ============================================================
// CheckoutErfolgPage
// ============================================================

describe('CheckoutErfolgPage — app/checkout/erfolg/page.tsx', () => {
  it('renders without errors and returns valid JSX', async () => {
    const { default: CheckoutErfolgPage } = await import('@/app/checkout/erfolg/page')
    const result = CheckoutErfolgPage()

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    expect(isValidElement(result)).toBe(true)
  })

  it('exports metadata with the title "Bestellung erfolgreich"', async () => {
    const { metadata } = await import('@/app/checkout/erfolg/page')
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Bestellung erfolgreich')
  })
})

// ============================================================
// CheckoutAbgebrochenPage
// ============================================================

describe('CheckoutAbgebrochenPage — app/checkout/abgebrochen/page.tsx', () => {
  it('renders without errors and returns valid JSX', async () => {
    const { default: CheckoutAbgebrochenPage } = await import('@/app/checkout/abgebrochen/page')
    const result = CheckoutAbgebrochenPage()

    expect(result).toBeDefined()
    expect(result).not.toBeNull()
    expect(isValidElement(result)).toBe(true)
  })

  it('exports metadata with the title "Zahlung abgebrochen"', async () => {
    const { metadata } = await import('@/app/checkout/abgebrochen/page')
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Zahlung abgebrochen')
  })
})
