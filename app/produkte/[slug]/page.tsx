import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Package, FileText, ArrowLeft } from "lucide-react"

import { getProductBySlug } from "@/lib/queries"
import { formatPrice, formatStock, parseImages } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/shop/add-to-cart-button"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Produkt nicht gefunden" }

  return {
    title: product.name,
    description:
      product.description?.slice(0, 160) ??
      `${product.name} – Hon-Ersatzteil bei NEPA Kreuzschleiftechnik.`,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  let product: Awaited<ReturnType<typeof getProductBySlug>> = null
  try {
    product = await getProductBySlug(slug)
  } catch {
    notFound()
  }

  if (!product) notFound()

  const images = parseImages(product.images)
  const firstImage = images[0] ?? null
  const stockInfo = formatStock(product.stock)

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/produkte"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-nepa-blue"
      >
        <ArrowLeft className="size-4" />
        Alle Produkte
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Product image area */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="size-24 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isUsed && (
              <Badge variant="secondary" className="text-sm">
                Gebraucht
              </Badge>
            )}
            {product.isB2BOnly && (
              <Badge variant="outline" className="bg-white/80 text-sm">
                Nur B2B
              </Badge>
            )}
          </div>
        </div>

        {/* Product details */}
        <div className="flex flex-col gap-5">
          {/* Category */}
          <Link
            href={`/kategorien/${product.category.slug}`}
            className="w-fit text-sm font-medium text-nepa-green hover:underline"
          >
            {product.category.name}
          </Link>

          {/* Name */}
          <h1 className="text-2xl font-bold tracking-tight text-nepa-blue sm:text-3xl">
            {product.name}
          </h1>

          {/* SKU */}
          <p className="text-sm text-muted-foreground">
            Art.-Nr.: {product.sku}
          </p>

          {/* Price */}
          <p className="text-3xl font-bold text-nepa-dark">
            {formatPrice(product.price)}
          </p>

          {/* Stock badge */}
          <Badge variant={stockInfo.variant} className="w-fit">
            {stockInfo.label}
          </Badge>

          {/* Add to cart */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price: Number(product.price),
              stock: product.stock,
              image: firstImage,
            }}
          />

          {/* PDF download */}
          {product.pdfUrl && (
            <a
              href={product.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <FileText className="size-4 text-nepa-blue" />
              Produktdatenblatt (PDF)
            </a>
          )}

          {/* Description */}
          {product.description && (
            <div className="mt-2">
              <h2 className="mb-2 text-lg font-semibold text-nepa-dark">
                Beschreibung
              </h2>
              <p className="leading-relaxed text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Compatible machines */}
          {product.compatibleMachines.length > 0 && (
            <div className="mt-2">
              <h2 className="mb-3 text-lg font-semibold text-nepa-dark">
                Kompatible Maschinen
              </h2>
              <ul className="space-y-1.5">
                {product.compatibleMachines.map(({ machine }) => (
                  <li key={machine.id}>
                    <Link
                      href={`/finder?maschine=${machine.slug}`}
                      className="text-sm text-nepa-blue hover:underline"
                    >
                      {machine.manufacturer} {machine.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
