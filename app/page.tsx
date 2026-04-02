import Link from "next/link"
import { Shield, Truck, Award, Phone, Search, ArrowRight, ChevronRight } from "lucide-react"

import { getFeaturedProducts, getCategories } from "@/lib/queries"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const formatPrice = (price: number | { toNumber?: () => number } | string) => {
  const num =
    typeof price === "number"
      ? price
      : typeof price === "object" && price !== null && "toNumber" in price
        ? (price as { toNumber: () => number }).toNumber()
        : Number(price)
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(num)
}

/* ------------------------------------------------------------------ */
/*  Placeholder data used when the DB is not connected yet             */
/* ------------------------------------------------------------------ */

const placeholderCategories = [
  { id: "1", name: "Honleisten", slug: "honleisten", _count: { products: 24 } },
  { id: "2", name: "Schleifsteine", slug: "schleifsteine", _count: { products: 18 } },
  { id: "3", name: "Abrichtwerkzeuge", slug: "abrichtwerkzeuge", _count: { products: 12 } },
  { id: "4", name: "Honöle & Kühlmittel", slug: "honoel-kuehlmittel", _count: { products: 9 } },
  { id: "5", name: "Spannvorrichtungen", slug: "spannvorrichtungen", _count: { products: 15 } },
  { id: "6", name: "Verschleißteile", slug: "verschleissteile", _count: { products: 21 } },
]

const placeholderProducts = [
  { id: "1", name: "Honleiste CBN K-200", slug: "honleiste-cbn-k-200", sku: "HL-CBN-200", price: 189.0, stock: 14, category: { name: "Honleisten", slug: "honleisten" }, images: [] },
  { id: "2", name: "Diamant-Schleifstein D126", slug: "diamant-schleifstein-d126", sku: "DS-D126", price: 245.5, stock: 8, category: { name: "Schleifsteine", slug: "schleifsteine" }, images: [] },
  { id: "3", name: "Abrichtdiamant 0.5ct", slug: "abrichtdiamant-05ct", sku: "AD-050", price: 78.9, stock: 0, category: { name: "Abrichtwerkzeuge", slug: "abrichtwerkzeuge" }, images: [] },
  { id: "4", name: "Honöl Spezial 5L", slug: "honoel-spezial-5l", sku: "HO-SP-5L", price: 62.0, stock: 32, category: { name: "Honöle & Kühlmittel", slug: "honoel-kuehlmittel" }, images: [] },
]

const manufacturers = ["Sunnen", "Gehring", "Nagel"]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = placeholderCategories
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let featuredProducts: any[] = placeholderProducts

  try {
    const [dbCategories, dbProducts] = await Promise.all([
      getCategories(),
      getFeaturedProducts(),
    ])
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories
    }
    if (dbProducts && dbProducts.length > 0) {
      featuredProducts = dbProducts
    }
  } catch {
    // DB not connected — fall back to placeholders silently
  }

  return (
    <>
      {/* ============================================================ */}
      {/*  1. HERO                                                      */}
      {/* ============================================================ */}
      <section className="relative isolate overflow-hidden bg-nepa-blue">
        {/* Subtle industrial grid overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Decorative gradient blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-nepa-green/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Pr&auml;zision f&uuml;r Ihre{" "}
              <span className="text-nepa-green">Honmaschine</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl">
              Hon-Ersatzteile, Schleifsteine und Zubeh&ouml;r&nbsp;&mdash; direkt
              vom Spezialisten
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/produkte"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-nepa-green px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-nepa-green/25 transition hover:bg-nepa-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nepa-green/50"
              >
                Produkte entdecken
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/finder"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <Search className="size-4" />
                Kompatibilit&auml;tsfinder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  2. KOMPATIBILITAETSFINDER TEASER                             */}
      {/* ============================================================ */}
      <section className="bg-nepa-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-nepa-blue/10">
              <Search className="size-7 text-nepa-blue" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-nepa-blue sm:text-3xl">
              Kompatibilit&auml;tsfinder
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-nepa-blue/70">
              Finden Sie in Sekunden die passenden Teile f&uuml;r Ihre Maschine.
              W&auml;hlen Sie Hersteller und Modell&nbsp;&mdash; wir zeigen Ihnen
              alle kompatiblen Ersatzteile.
            </p>
          </div>

          {/* Manufacturer cards */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {manufacturers.map((name) => (
              <Link
                key={name}
                href="/finder"
                className="group flex items-center justify-between rounded-xl border border-nepa-blue/10 bg-white p-5 shadow-sm transition hover:border-nepa-green/40 hover:shadow-md"
              >
                <div>
                  <p className="text-sm font-medium text-nepa-blue/50">
                    Hersteller
                  </p>
                  <p className="mt-1 text-lg font-bold text-nepa-blue">
                    {name}
                  </p>
                </div>
                <ChevronRight className="size-5 text-nepa-blue/30 transition group-hover:text-nepa-green" />
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/finder"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-nepa-green transition hover:text-nepa-green/80"
            >
              Alle Hersteller anzeigen
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3. CATEGORY OVERVIEW                                         */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-nepa-blue sm:text-3xl">
                Kategorien
              </h2>
              <p className="mt-2 text-base text-nepa-blue/60">
                Durchsuchen Sie unser Sortiment nach Produktgruppen
              </p>
            </div>
            <Link
              href="/kategorien"
              className="hidden items-center gap-1 text-sm font-semibold text-nepa-green transition hover:text-nepa-green/80 sm:inline-flex"
            >
              Alle Kategorien
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/kategorien/${cat.slug}`}>
                <Card className="group h-full transition hover:shadow-md hover:ring-nepa-green/30">
                  <CardHeader>
                    <CardTitle className="text-nepa-blue group-hover:text-nepa-green transition-colors">
                      {cat.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {cat._count.products}{" "}
                      {cat._count.products === 1 ? "Produkt" : "Produkte"}
                    </p>
                  </CardContent>
                  <CardFooter className="text-xs font-medium text-nepa-green opacity-0 transition group-hover:opacity-100">
                    Kategorie ansehen
                    <ArrowRight className="ml-1 size-3" />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/kategorien"
              className="inline-flex items-center gap-1 text-sm font-semibold text-nepa-green"
            >
              Alle Kategorien
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4. FEATURED PRODUCTS                                         */}
      {/* ============================================================ */}
      <section className="border-t border-nepa-blue/5 bg-nepa-light py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-nepa-blue sm:text-3xl">
                Beliebte Produkte
              </h2>
              <p className="mt-2 text-base text-nepa-blue/60">
                Unsere meistgefragten Ersatzteile und Verbrauchsmaterialien
              </p>
            </div>
            <Link
              href="/produkte"
              className="hidden items-center gap-1 text-sm font-semibold text-nepa-green transition hover:text-nepa-green/80 sm:inline-flex"
            >
              Alle Produkte
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/produkte/${product.slug}`}>
                <Card className="group h-full transition hover:shadow-md hover:ring-nepa-green/30">
                  {/* Image placeholder */}
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-br from-nepa-blue/5 to-nepa-blue/10">
                    <div className="flex flex-col items-center gap-1 text-nepa-blue/20">
                      <svg
                        className="size-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                        />
                      </svg>
                      <span className="text-xs font-medium">Produktbild</span>
                    </div>

                    {/* Stock badge overlay */}
                    <div className="absolute top-2 right-2">
                      {product.stock > 0 ? (
                        <Badge
                          variant="default"
                          className="bg-nepa-green/90 text-[10px] text-white"
                        >
                          Auf Lager
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-200 text-[10px] text-gray-600"
                        >
                          Nicht verf&uuml;gbar
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-sm leading-snug text-nepa-blue group-hover:text-nepa-green transition-colors">
                        {product.name}
                      </CardTitle>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      {product.sku}
                    </p>
                  </CardHeader>

                  <CardContent className="mt-auto">
                    <Badge variant="outline" className="mb-3 text-[10px]">
                      {product.category.name}
                    </Badge>
                    <p className="text-lg font-bold text-nepa-blue">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      zzgl. MwSt. &amp; Versand
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/produkte"
              className="inline-flex items-center gap-1 text-sm font-semibold text-nepa-green"
            >
              Alle Produkte
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5. VALUE PROPOSITIONS                                        */}
      {/* ============================================================ */}
      <section className="border-t border-nepa-blue/5 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Gepr\u00fcfte Qualit\u00e4t",
                text: "Alle Produkte durchlaufen strenge Qualit\u00e4tskontrollen f\u00fcr zuverl\u00e4ssige Ergebnisse.",
              },
              {
                icon: Truck,
                title: "Schneller Versand",
                text: "Lagerware wird innerhalb von 1\u20132 Werktagen versandt. Express-Optionen verf\u00fcgbar.",
              },
              {
                icon: Phone,
                title: "Technische Beratung",
                text: "Unser Fachteam hilft Ihnen bei der Auswahl der richtigen Teile f\u00fcr Ihre Maschine.",
              },
              {
                icon: Award,
                title: "Gro\u00dfe Auswahl",
                text: "Umfangreiches Sortiment an Honleisten, Schleifsteinen und Zubeh\u00f6r f\u00fcr alle g\u00e4ngigen Maschinen.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex size-12 items-center justify-center rounded-lg bg-nepa-blue/5">
                  <Icon className="size-6 text-nepa-green" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-nepa-blue">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
