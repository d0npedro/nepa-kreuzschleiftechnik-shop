import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/shop/product-card'

function makeProduct(overrides: Partial<Parameters<typeof ProductCard>[0]['product']> = {}) {
  return {
    id: 'prod-1',
    name: 'Kreuzschleifkopf KSK-200',
    slug: 'kreuzschleifkopf-ksk-200',
    sku: 'KSK-200',
    price: 1299.99,
    stock: 5,
    isUsed: false,
    isB2BOnly: false,
    images: [],
    category: { name: 'Schleifköpfe', slug: 'schleifkoepfe' },
    ...overrides,
  }
}

describe('ProductCard', () => {
  it('renders the product name', () => {
    render(<ProductCard product={makeProduct()} />)
    expect(screen.getByText('Kreuzschleifkopf KSK-200')).toBeInTheDocument()
  })

  it('renders the SKU with prefix', () => {
    render(<ProductCard product={makeProduct({ sku: 'ABC-123' })} />)
    expect(screen.getByText('Art.-Nr.: ABC-123')).toBeInTheDocument()
  })

  it('renders a formatted EUR price', () => {
    render(<ProductCard product={makeProduct({ price: 1299.99 })} />)
    // Intl.NumberFormat de-DE produces "1.299,99 €" (with non-breaking space)
    const priceEl = screen.getByText((content, el) =>
      el?.tagName === 'P' && (el?.textContent?.includes('1.299,99') ?? false),
    )
    expect(priceEl).toBeInTheDocument()
  })

  it('shows "Auf Lager" when stock > 0', () => {
    render(<ProductCard product={makeProduct({ stock: 3 })} />)
    expect(screen.getByText('Auf Lager')).toBeInTheDocument()
  })

  it('shows "Nicht verfügbar" when stock === 0', () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} />)
    expect(screen.getByText('Nicht verfügbar')).toBeInTheDocument()
  })

  it('shows the category name as a badge', () => {
    render(<ProductCard product={makeProduct({ category: { name: 'Zubehör', slug: 'zubehoer' } })} />)
    expect(screen.getByText('Zubehör')).toBeInTheDocument()
  })

  it('shows "Gebraucht" badge when isUsed is true', () => {
    render(<ProductCard product={makeProduct({ isUsed: true })} />)
    expect(screen.getByText('Gebraucht')).toBeInTheDocument()
  })

  it('does not show "Gebraucht" badge when isUsed is false', () => {
    render(<ProductCard product={makeProduct({ isUsed: false })} />)
    expect(screen.queryByText('Gebraucht')).not.toBeInTheDocument()
  })

  it('shows "B2B" badge when isB2BOnly is true', () => {
    render(<ProductCard product={makeProduct({ isB2BOnly: true })} />)
    expect(screen.getByText('B2B')).toBeInTheDocument()
  })

  it('does not show "B2B" badge when isB2BOnly is false', () => {
    render(<ProductCard product={makeProduct({ isB2BOnly: false })} />)
    expect(screen.queryByText('B2B')).not.toBeInTheDocument()
  })

  it('links to the correct product page using slug', () => {
    render(<ProductCard product={makeProduct({ slug: 'my-product' })} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/produkte/my-product')
  })

  it('renders a placeholder icon when images array is empty', () => {
    const { container } = render(<ProductCard product={makeProduct({ images: [] })} />)
    // The placeholder is a div with the Package icon inside the image area
    const placeholder = container.querySelector('.bg-muted > div')
    expect(placeholder).toBeInTheDocument()
  })

  it('renders an img element when images are provided', () => {
    render(
      <ProductCard
        product={makeProduct({ images: ['https://example.com/img.jpg'] })}
      />,
    )
    const img = screen.getByRole('img', { name: 'Kreuzschleifkopf KSK-200' })
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg')
  })
})
