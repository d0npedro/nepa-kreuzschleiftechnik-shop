import { render, screen, fireEvent } from '@testing-library/react'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { toast } from 'sonner'

const mockAddItem = vi.fn()

vi.mock('@/lib/cart-store', () => ({
  useCartStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    typeof selector === 'function'
      ? selector({ addItem: mockAddItem })
      : mockAddItem,
  ),
}))

function makeProduct(overrides: Partial<Parameters<typeof AddToCartButton>[0]['product']> = {}) {
  return {
    id: 'prod-1',
    name: 'Schleifstein S-100',
    slug: 'schleifstein-s-100',
    sku: 'S-100',
    price: 49.99,
    stock: 5,
    image: null,
    ...overrides,
  }
}

describe('AddToCartButton', () => {
  beforeEach(() => {
    mockAddItem.mockClear()
    vi.mocked(toast.success).mockClear()
  })

  it('renders "In den Warenkorb" text when product is in stock', () => {
    render(<AddToCartButton product={makeProduct()} />)
    expect(screen.getByText('In den Warenkorb')).toBeInTheDocument()
  })

  it('renders "Nicht verfuegbar" when product is out of stock', () => {
    render(<AddToCartButton product={makeProduct({ stock: 0 })} />)
    expect(screen.getByText('Nicht verfuegbar')).toBeInTheDocument()
  })

  it('disables the button when out of stock', () => {
    render(<AddToCartButton product={makeProduct({ stock: 0 })} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('shows quantity starting at 1', () => {
    render(<AddToCartButton product={makeProduct()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('increments quantity when plus button is clicked', () => {
    render(<AddToCartButton product={makeProduct({ stock: 5 })} />)
    const plusButton = screen.getByLabelText('Menge erhoehen')
    fireEvent.click(plusButton)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('decrements quantity when minus button is clicked', () => {
    render(<AddToCartButton product={makeProduct({ stock: 5 })} />)
    const plusButton = screen.getByLabelText('Menge erhoehen')
    const minusButton = screen.getByLabelText('Menge verringern')
    fireEvent.click(plusButton) // 2
    fireEvent.click(plusButton) // 3
    fireEvent.click(minusButton) // 2
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('disables minus button when quantity is 1', () => {
    render(<AddToCartButton product={makeProduct()} />)
    const minusButton = screen.getByLabelText('Menge verringern')
    expect(minusButton).toBeDisabled()
  })

  it('disables plus button when quantity reaches max stock (capped at 10)', () => {
    render(<AddToCartButton product={makeProduct({ stock: 3 })} />)
    const plusButton = screen.getByLabelText('Menge erhoehen')
    fireEvent.click(plusButton) // 2
    fireEvent.click(plusButton) // 3 (max = min(3, 10) = 3)
    expect(plusButton).toBeDisabled()
  })

  it('calls addItem with correct data when add button is clicked', () => {
    const product = makeProduct()
    render(<AddToCartButton product={product} />)
    const addButton = screen.getByText('In den Warenkorb')
    fireEvent.click(addButton)

    expect(mockAddItem).toHaveBeenCalledOnce()
    expect(mockAddItem).toHaveBeenCalledWith({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      image: product.image,
    })
  })

  it('shows a toast on successful add', () => {
    render(<AddToCartButton product={makeProduct()} />)
    fireEvent.click(screen.getByText('In den Warenkorb'))

    expect(toast.success).toHaveBeenCalledWith(
      'Zum Warenkorb hinzugefuegt',
      expect.objectContaining({ description: '1x Schleifstein S-100' }),
    )
  })

  it('sends correct quantity after incrementing', () => {
    render(<AddToCartButton product={makeProduct({ stock: 5 })} />)
    const plusButton = screen.getByLabelText('Menge erhoehen')
    fireEvent.click(plusButton) // 2
    fireEvent.click(plusButton) // 3

    fireEvent.click(screen.getByText('In den Warenkorb'))

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 3 }),
    )
  })

  it('does not render quantity selector when out of stock', () => {
    render(<AddToCartButton product={makeProduct({ stock: 0 })} />)
    expect(screen.queryByLabelText('Menge verringern')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Menge erhoehen')).not.toBeInTheDocument()
  })
})
