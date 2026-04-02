import type { Metadata } from "next"
import Link from "next/link"
import { Layers } from "lucide-react"

import { getCategories } from "@/lib/queries"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Kategorien",
  description:
    "Alle Produktkategorien bei NEPA Kreuzschleiftechnik. Finden Sie Hon-Ersatzteile, Schleifsteine und Zubehoer nach Kategorie sortiert.",
}

export default async function KategorienPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    categories = await getCategories()
  } catch {
    categories = []
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-nepa-blue">
          Kategorien
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Durchsuchen Sie unser Sortiment nach Kategorie
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategorien/${cat.slug}`}
              className="group block"
            >
              <Card className="h-full transition-shadow duration-200 group-hover:shadow-lg group-hover:ring-foreground/20">
                <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-nepa-blue/10">
                    <Layers className="size-7 text-nepa-blue" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-nepa-blue transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {cat._count.products}{" "}
                    {cat._count.products === 1 ? "Produkt" : "Produkte"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Noch keine Kategorien vorhanden
          </p>
        </div>
      )}
    </section>
  )
}
