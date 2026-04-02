import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { getCategoryBySlug } from "@/lib/queries"
import { ProductCard } from "@/components/shop/product-card"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: "Kategorie nicht gefunden" }

  return {
    title: category.name,
    description: `Alle Produkte in der Kategorie ${category.name} bei NEPA Kreuzschleiftechnik.`,
  }
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params
  let category: Awaited<ReturnType<typeof getCategoryBySlug>> = null
  try {
    category = await getCategoryBySlug(slug)
  } catch {
    notFound()
  }

  if (!category) notFound()

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/kategorien"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-nepa-blue"
      >
        <ArrowLeft className="size-4" />
        Alle Kategorien
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-nepa-blue">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {category.products.length}{" "}
          {category.products.length === 1 ? "Produkt" : "Produkte"} in dieser
          Kategorie
        </p>
      </div>

      {category.products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Noch keine Produkte in dieser Kategorie
          </p>
          <Link
            href="/produkte"
            className="mt-3 text-sm font-medium text-nepa-blue hover:underline"
          >
            Alle Produkte anzeigen
          </Link>
        </div>
      )}
    </section>
  )
}
