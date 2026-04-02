import { render, screen } from '@testing-library/react'
import { FinderWidget } from '@/components/shop/finder-widget'

// Mock global fetch
const mockFetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  }),
) as unknown as typeof globalThis.fetch

beforeEach(() => {
  globalThis.fetch = mockFetch
  vi.mocked(mockFetch).mockClear()
})

const sampleManufacturers = ['Sunnen', 'Nagel', 'Gehring', 'Kadia']

describe('FinderWidget', () => {
  it('renders step indicator labels', () => {
    render(<FinderWidget manufacturers={sampleManufacturers} />)
    expect(screen.getByText('Hersteller')).toBeInTheDocument()
    expect(screen.getByText('Modell')).toBeInTheDocument()
    expect(screen.getByText('Ergebnisse')).toBeInTheDocument()
  })

  it('renders the manufacturer label', () => {
    render(<FinderWidget manufacturers={sampleManufacturers} />)
    expect(screen.getByText('1. Hersteller')).toBeInTheDocument()
  })

  it('renders the machine model label', () => {
    render(<FinderWidget manufacturers={sampleManufacturers} />)
    expect(screen.getByText('2. Maschinenmodell')).toBeInTheDocument()
  })

  it('shows initial prompt text when no manufacturer selected', () => {
    render(<FinderWidget manufacturers={sampleManufacturers} />)
    expect(
      screen.getByText('Bitte wählen Sie einen Hersteller, um kompatible Teile zu finden.'),
    ).toBeInTheDocument()
  })

  it('renders the manufacturer select trigger', () => {
    render(<FinderWidget manufacturers={sampleManufacturers} />)
    // The SelectTrigger should render with the placeholder
    expect(screen.getByText('Hersteller wählen...')).toBeInTheDocument()
  })

  it('renders the machine model select as disabled when no manufacturer selected', () => {
    render(<FinderWidget manufacturers={sampleManufacturers} />)
    // The machine select should show the "Zuerst Hersteller wählen" placeholder
    expect(screen.getByText('Zuerst Hersteller wählen')).toBeInTheDocument()
  })

  it('renders step numbers 1, 2, and 3 for the step indicators', () => {
    render(<FinderWidget manufacturers={sampleManufacturers} />)
    // Step 1 is active so shows the number "1"
    expect(screen.getByText('1')).toBeInTheDocument()
    // Steps 2 and 3 are inactive and show their numbers
    expect(screen.getByText('2', { selector: '.flex.size-8' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders with empty manufacturers list without crashing', () => {
    render(<FinderWidget manufacturers={[]} />)
    expect(screen.getByText('Hersteller wählen...')).toBeInTheDocument()
  })
})
