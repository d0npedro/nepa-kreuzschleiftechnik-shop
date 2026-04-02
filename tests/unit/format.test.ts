import { describe, it, expect } from 'vitest'
import { formatPrice, formatStock, parseImages } from '@/lib/format'

describe('formatPrice', () => {
  it('formats an integer price', () => {
    const result = formatPrice(10)
    expect(result).toContain('10')
    expect(result).toContain('€')
  })

  it('formats a decimal price', () => {
    const result = formatPrice(19.99)
    expect(result).toContain('19,99')
    expect(result).toContain('€')
  })

  it('formats zero', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  it('formats a large number', () => {
    const result = formatPrice(12345.67)
    // de-DE uses dot as thousands separator
    expect(result).toContain('12.345,67')
    expect(result).toContain('€')
  })

  it('formats a Decimal-like object with toString()', () => {
    const decimalLike = { toString: () => '49.95' }
    const result = formatPrice(decimalLike)
    expect(result).toContain('49,95')
    expect(result).toContain('€')
  })

  it('formats a negative number', () => {
    const result = formatPrice(-5.5)
    expect(result).toContain('5,50')
    expect(result).toContain('€')
    expect(result).toMatch(/-/)
  })

  it('formats a very small decimal', () => {
    const result = formatPrice(0.01)
    expect(result).toContain('0,01')
    expect(result).toContain('€')
  })

  it('formats a number with many decimal places (rounds to 2)', () => {
    const result = formatPrice(9.999)
    // Intl rounds to 2 decimals: 9.999 -> 10,00
    expect(result).toContain('10,00')
  })
})

describe('formatStock', () => {
  it('returns "Auf Lager" with default variant when stock > 0', () => {
    const result = formatStock(5)
    expect(result.label).toBe('Auf Lager')
    expect(result.variant).toBe('default')
  })

  it('returns "Auf Lager" for stock = 1', () => {
    const result = formatStock(1)
    expect(result.label).toBe('Auf Lager')
    expect(result.variant).toBe('default')
  })

  it('returns "Nicht verfügbar" with destructive variant when stock === 0', () => {
    const result = formatStock(0)
    expect(result.label).toBe('Nicht verfügbar')
    expect(result.variant).toBe('destructive')
  })

  it('returns "Nicht verfügbar" for negative stock', () => {
    const result = formatStock(-1)
    expect(result.label).toBe('Nicht verfügbar')
    expect(result.variant).toBe('destructive')
  })

  it('returns "Auf Lager" for large stock', () => {
    const result = formatStock(9999)
    expect(result.label).toBe('Auf Lager')
    expect(result.variant).toBe('default')
  })
})

describe('parseImages', () => {
  it('returns string items from a string array', () => {
    const result = parseImages(['a.jpg', 'b.png'])
    expect(result).toEqual(['a.jpg', 'b.png'])
  })

  it('returns empty array for empty array input', () => {
    expect(parseImages([])).toEqual([])
  })

  it('returns empty array for null', () => {
    expect(parseImages(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(parseImages(undefined)).toEqual([])
  })

  it('parses a JSON string containing an array of strings', () => {
    const json = JSON.stringify(['img1.jpg', 'img2.jpg'])
    expect(parseImages(json)).toEqual(['img1.jpg', 'img2.jpg'])
  })

  it('returns empty array for an invalid JSON string', () => {
    expect(parseImages('not valid json')).toEqual([])
  })

  it('filters out non-string elements from a mixed array', () => {
    const input = ['valid.jpg', 42, null, 'also-valid.png', undefined, true]
    const result = parseImages(input)
    expect(result).toEqual(['valid.jpg', 'also-valid.png'])
  })

  it('filters out non-string elements from a parsed JSON array', () => {
    const json = JSON.stringify(['a.jpg', 123, null, 'b.jpg'])
    const result = parseImages(json)
    expect(result).toEqual(['a.jpg', 'b.jpg'])
  })

  it('returns empty array for a JSON string that parses to a non-array', () => {
    expect(parseImages(JSON.stringify({ url: 'img.jpg' }))).toEqual([])
  })

  it('returns empty array for an empty string', () => {
    expect(parseImages('')).toEqual([])
  })

  it('returns empty array for a number input', () => {
    expect(parseImages(42 as unknown)).toEqual([])
  })

  it('returns empty array for a boolean input', () => {
    expect(parseImages(true as unknown)).toEqual([])
  })
})
