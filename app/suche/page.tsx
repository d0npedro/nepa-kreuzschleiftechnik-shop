import { searchProducts } from '@/lib/queries'
import { ProductCard } from '@/components/shop/product-card'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: 'Suche',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  let products: Awaited<ReturnType<typeof searchProducts>> = []
  if (query.length >= 2) {
    try {
      products = await searchProducts(query)
    } catch {
      products = []
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-nepa-blue mb-6">Suchergebnisse</h1>

      <form action="/suche" method="GET" className="mb-8">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Produkte suchen..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-nepa-blue"
          />
        </div>
      </form>

      {query && (
        <p className="text-muted-foreground mb-6">
          {products.length} Ergebnis{products.length !== 1 ? 'se' : ''} für &ldquo;{query}&rdquo;
        </p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">
            Keine Produkte gefunden. Versuchen Sie einen anderen Suchbegriff.
          </p>
        </div>
      ) : null}
    </div>
  )
}
