import type { Metadata } from "next"
import Link from "next/link"

import { getProducts, getCategories } from "@/lib/queries"
import { ProductCard } from "@/components/shop/product-card"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Alle Produkte",
  description:
    "Entdecken Sie unser komplettes Sortiment an Hon-Ersatzteilen, Kreuzschleifsteinen und Schleiftechnik-Zubehoer bei NEPA Kreuzschleiftechnik.",
}

export default async function ProduktePage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string }>
}) {
  const { kategorie } = await searchParams
  let products: Awaited<ReturnType<typeof getProducts>> = []
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    ;[products, categories] = await Promise.all([
      getProducts(kategorie ? { categorySlug: kategorie } : undefined),
      getCategories(),
    ])
  } catch {
    products = []
    categories = []
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-nepa-blue">
          Alle Produkte
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "Produkt" : "Produkte"}{" "}
          gefunden
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/produkte"
          className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            !kategorie
              ? "border-nepa-blue bg-nepa-blue text-white"
              : "border-border text-foreground hover:bg-muted"
          }`}
        >
          Alle
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/produkte?kategorie=${cat.slug}`}
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              kategorie === cat.slug
                ? "border-nepa-blue bg-nepa-blue text-white"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            {cat.name}
            <span className="ml-1.5 text-xs opacity-70">
              ({cat._count.products})
            </span>
          </Link>
        ))}
      </div>

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Keine Produkte gefunden
          </p>
          {kategorie && (
            <Link
              href="/produkte"
              className="mt-3 text-sm font-medium text-nepa-blue hover:underline"
            >
              Alle Produkte anzeigen
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
