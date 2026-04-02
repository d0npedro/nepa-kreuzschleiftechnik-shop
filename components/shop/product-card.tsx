import Link from "next/link"
import { Package } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatStock, parseImages } from "@/lib/format"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number | { toString(): string }
    stock: number
    isUsed?: boolean
    isB2BOnly?: boolean
    images: unknown
    category: { name: string; slug: string }
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const images = parseImages(product.images)
  const firstImage = images[0] ?? null
  const stockInfo = formatStock(product.stock)

  return (
    <Link href={`/produkte/${product.slug}`} className="group block">
      <Card className="h-full transition-shadow duration-200 group-hover:shadow-lg group-hover:ring-foreground/20">
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Package className="size-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.isUsed && (
              <Badge variant="secondary">Gebraucht</Badge>
            )}
            {product.isB2BOnly && (
              <Badge variant="outline">B2B</Badge>
            )}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-2">
          {/* Product name */}
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">
            {product.name}
          </h3>

          {/* SKU */}
          <p className="text-xs text-muted-foreground">
            Art.-Nr.: {product.sku}
          </p>

          {/* Price */}
          <p className="text-base font-semibold">
            {formatPrice(product.price)}
          </p>

          {/* Badges row */}
          <div className="mt-auto flex flex-wrap items-center gap-1.5">
            <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
            <Badge variant="secondary">{product.category.name}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
