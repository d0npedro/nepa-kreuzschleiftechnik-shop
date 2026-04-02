import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/header'

const mockTotalItems = vi.fn(() => 0)

vi.mock('@/lib/cart-store', () => ({
  useCartStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    typeof selector === 'function'
      ? selector({ totalItems: mockTotalItems })
      : mockTotalItems,
  ),
}))

describe('Header', () => {
  beforeEach(() => {
    mockTotalItems.mockReturnValue(0)
  })

  it('renders the NEPA logo text', () => {
    render(<Header />)
    // Both desktop and mobile sheet contain "NEPA" -- at least one is visible
    const nepaElements = screen.getAllByText('NEPA')
    expect(nepaElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the "Produkte" navigation link', () => {
    render(<Header />)
    const links = screen.getAllByText('Produkte')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the "Kategorien" navigation link', () => {
    render(<Header />)
    const links = screen.getAllByText('Kategorien')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the "Kompatibilitätsfinder" navigation link', () => {
    render(<Header />)
    const links = screen.getAllByText('Kompatibilitätsfinder')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the "Kontakt" navigation link', () => {
    render(<Header />)
    const links = screen.getAllByText('Kontakt')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the search button with aria-label "Suche"', () => {
    render(<Header />)
    expect(screen.getByLabelText('Suche')).toBeInTheDocument()
  })

  it('renders the cart button with aria-label "Warenkorb"', () => {
    render(<Header />)
    expect(screen.getByLabelText('Warenkorb')).toBeInTheDocument()
  })

  it('does not show a cart badge when itemCount is 0', () => {
    mockTotalItems.mockReturnValue(0)
    const { container } = render(<Header />)
    // The badge only renders when itemCount > 0
    const badges = container.querySelectorAll('.absolute.-top-1')
    expect(badges.length).toBe(0)
  })

  it('shows a cart badge when itemCount > 0', () => {
    mockTotalItems.mockReturnValue(3)
    render(<Header />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows "99+" in cart badge when itemCount exceeds 99', () => {
    mockTotalItems.mockReturnValue(150)
    render(<Header />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('links to /suche for the search button', () => {
    render(<Header />)
    const searchLink = screen.getByLabelText('Suche').closest('a')
    expect(searchLink).toHaveAttribute('href', '/suche')
  })

  it('links to /warenkorb for the cart button', () => {
    render(<Header />)
    const cartLink = screen.getByLabelText('Warenkorb').closest('a')
    expect(cartLink).toHaveAttribute('href', '/warenkorb')
  })
})
