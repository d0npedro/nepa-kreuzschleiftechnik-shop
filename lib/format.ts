const eurFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
})

export function formatPrice(price: number | { toString(): string }): string {
  return eurFormatter.format(Number(price))
}

export function formatStock(stock: number): {
  label: string
  variant: "default" | "destructive" | "secondary"
} {
  if (stock > 0) {
    return { label: "Auf Lager", variant: "default" }
  }
  return { label: "Nicht verfügbar", variant: "destructive" }
}

export function parseImages(images: unknown): string[] {
  if (!images) return []

  if (Array.isArray(images)) {
    return images.filter((item): item is string => typeof item === "string")
  }

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string")
      }
    } catch {
      return []
    }
  }

  return []
}
