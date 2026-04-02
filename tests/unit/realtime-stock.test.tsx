import { render, screen } from '@testing-library/react'
import { RealtimeStock } from '@/components/shop/realtime-stock'

const mockSubscribe = vi.fn()
const mockOn = vi.fn().mockReturnThis()
const mockRemoveChannel = vi.fn()
const mockChannel = vi.fn(() => ({
  on: mockOn,
  subscribe: mockSubscribe,
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  })),
}))

describe('RealtimeStock', () => {
  beforeEach(() => {
    mockChannel.mockClear()
    mockOn.mockClear().mockReturnThis()
    mockSubscribe.mockClear()
    mockRemoveChannel.mockClear()
  })

  it('shows "Auf Lager" with count when stock > 10', () => {
    render(<RealtimeStock productId="p1" initialStock={25} />)
    expect(screen.getByText('Auf Lager (25)')).toBeInTheDocument()
  })

  it('shows "Nur noch X Stück" when stock is between 1 and 10', () => {
    render(<RealtimeStock productId="p1" initialStock={7} />)
    expect(screen.getByText('Nur noch 7 Stück')).toBeInTheDocument()
  })

  it('shows "Nur noch 1 Stück" when stock is exactly 1', () => {
    render(<RealtimeStock productId="p1" initialStock={1} />)
    expect(screen.getByText('Nur noch 1 Stück')).toBeInTheDocument()
  })

  it('shows "Nicht verfügbar" when stock is 0', () => {
    render(<RealtimeStock productId="p1" initialStock={0} />)
    expect(screen.getByText('Nicht verfügbar')).toBeInTheDocument()
  })

  it('subscribes to a realtime channel on mount', () => {
    render(<RealtimeStock productId="abc-123" initialStock={5} />)
    expect(mockChannel).toHaveBeenCalledWith('product-stock-abc-123')
    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: 'UPDATE',
        schema: 'public',
        table: 'Product',
        filter: 'id=eq.abc-123',
      }),
      expect.any(Function),
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('removes the channel on unmount', () => {
    const { unmount } = render(<RealtimeStock productId="p1" initialStock={5} />)
    unmount()
    expect(mockRemoveChannel).toHaveBeenCalled()
  })

  it('shows "Auf Lager" with count for stock exactly 11', () => {
    render(<RealtimeStock productId="p1" initialStock={11} />)
    expect(screen.getByText('Auf Lager (11)')).toBeInTheDocument()
  })

  it('shows low-stock badge for stock exactly 10', () => {
    render(<RealtimeStock productId="p1" initialStock={10} />)
    expect(screen.getByText('Nur noch 10 Stück')).toBeInTheDocument()
  })
})
