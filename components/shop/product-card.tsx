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
      <Card className="h-full overflow-hidden border-border/60 bg-card transition-all duration-300 group-hover:border-nepa-green/30 group-hover:shadow-xl group-hover:shadow-nepa-green/[0.06] hover-lift">
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="size-10 text-muted-foreground/15" />
            </div>
          )}

          {/* Top accent line on hover */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-nepa-green scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />

          {/* Overlay badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isUsed && (
              <span className="rounded-md bg-nepa-dark/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                Gebraucht
              </span>
            )}
            {product.isB2BOnly && (
              <span className="rounded-md border border-white/15 bg-nepa-dark/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                B2B
              </span>
            )}
          </div>

          {/* Stock indicator */}
          <div className="absolute right-3 top-3">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-nepa-dark/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-nepa-green" />
                {stockInfo.label}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-nepa-dark/80 px-2.5 py-1 text-[10px] font-medium text-white/50 backdrop-blur-sm">
                {stockInfo.label}
              </span>
            )}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-1.5 p-5">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-nepa-green">
            {product.name}
          </h3>

          <p className="font-mono text-[10px] text-muted-foreground/50">
            Art.-Nr.: {product.sku}
          </p>

          <div className="mt-auto flex items-end justify-between pt-3">
            <div>
              <p className="font-display text-base font-extrabold tracking-tight">
                {formatPrice(product.price)}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground/50">
                zzgl. MwSt.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground border-border/60">
              {product.category.name}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
