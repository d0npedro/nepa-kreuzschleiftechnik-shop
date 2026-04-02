import Link from "next/link"
import {
  Shield,
  Truck,
  Award,
  Phone,
  Search,
  ArrowRight,
  ChevronRight,
  Package,
  Crosshair,
  Gauge,
  Wrench,
  Cog,
} from "lucide-react"

import { getFeaturedProducts, getCategories } from "@/lib/queries"
import { Card, CardContent } from "@/components/ui/card"
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

const placeholderCategories = [
  { id: "1", name: "Honleisten", slug: "honleisten", _count: { products: 24 } },
  { id: "2", name: "Schleifsteine", slug: "schleifsteine", _count: { products: 18 } },
  { id: "3", name: "Abrichtwerkzeuge", slug: "abrichtwerkzeuge", _count: { products: 12 } },
  { id: "4", name: "Hon\u00f6le & K\u00fchlmittel", slug: "honoel-kuehlmittel", _count: { products: 9 } },
  { id: "5", name: "Spannvorrichtungen", slug: "spannvorrichtungen", _count: { products: 15 } },
  { id: "6", name: "Verschlei\u00dfteile", slug: "verschleissteile", _count: { products: 21 } },
]

const placeholderProducts = [
  { id: "1", name: "Honleiste CBN K-200", slug: "honleiste-cbn-k-200", sku: "HL-CBN-200", price: 189.0, stock: 14, category: { name: "Honleisten", slug: "honleisten" }, images: [] },
  { id: "2", name: "Diamant-Schleifstein D126", slug: "diamant-schleifstein-d126", sku: "DS-D126", price: 245.5, stock: 8, category: { name: "Schleifsteine", slug: "schleifsteine" }, images: [] },
  { id: "3", name: "Abrichtdiamant 0.5ct", slug: "abrichtdiamant-05ct", sku: "AD-050", price: 78.9, stock: 0, category: { name: "Abrichtwerkzeuge", slug: "abrichtwerkzeuge" }, images: [] },
  { id: "4", name: "Hon\u00f6l Spezial 5L", slug: "honoel-spezial-5l", sku: "HO-SP-5L", price: 62.0, stock: 32, category: { name: "Hon\u00f6le & K\u00fchlmittel", slug: "honoel-kuehlmittel" }, images: [] },
]

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
    if (dbCategories && dbCategories.length > 0) categories = dbCategories
    if (dbProducts && dbProducts.length > 0) featuredProducts = dbProducts
  } catch {
    // DB not connected — fall back to placeholders
  }

  return (
    <>
      {/* ============================================================ */}
      {/*  1. HERO — Industrial Precision                               */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-nepa-dark">
        {/* Background grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-grid-pattern-fine text-white/[0.03]"
        />

        {/* Diagonal green accent */}
        <div
          aria-hidden="true"
          className="absolute -right-32 top-0 h-full w-[600px] skew-x-[-12deg] bg-gradient-to-b from-nepa-green/8 to-transparent"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid min-h-[520px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
            {/* Left: Text content */}
            <div className="animate-fade-up">
              {/* Technical label */}
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-nepa-green" />
                <span className="label-technical text-nepa-green">
                  Pr&auml;zision seit Generationen
                </span>
              </div>

              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                Teile f&uuml;r Ihre{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-nepa-green">Honmaschine</span>
                  <span
                    aria-hidden="true"
                    className="absolute -inset-x-2 bottom-1 h-3 bg-nepa-green/15 -skew-x-3"
                  />
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/50">
                Hon-Ersatzteile, Schleifsteine und Zubeh&ouml;r&nbsp;&mdash; direkt
                vom Spezialisten f&uuml;r Kreuzschleiftechnik.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/produkte"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-lg bg-nepa-green px-7 py-3.5 text-sm font-bold tracking-wide text-white transition-all hover:bg-nepa-green/90 hover:shadow-lg hover:shadow-nepa-green/20"
                >
                  Produkte entdecken
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/finder"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/15 px-7 py-3.5 text-sm font-bold tracking-wide text-white/80 transition-all hover:border-white/30 hover:text-white"
                >
                  <Crosshair className="size-4 text-nepa-green" />
                  Kompatibilit&auml;tsfinder
                </Link>
              </div>

              {/* Stats row */}
              <div className="mt-14 flex gap-10">
                {[
                  { value: "800+", label: "Produkte" },
                  { value: "50+", label: "Maschinen" },
                  { value: "24h", label: "Versand" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-display text-2xl font-extrabold tracking-tight text-white">
                      {value}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero image */}
            <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/images/hero/nepa-maschine.jpg"
                  alt="NEPA Honmaschine"
                  className="h-full w-full object-cover aspect-[4/5]"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-nepa-dark/60 via-transparent to-nepa-dark/20" />

                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-nepa-dark/80 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-nepa-green/15">
                      <Gauge className="size-5 text-nepa-green" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Sofort einsatzbereit</p>
                      <p className="text-[11px] text-white/40">Lagerware in 1&ndash;2 Tagen</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative corner marks */}
              <div aria-hidden="true" className="absolute -top-3 -left-3 size-6 border-l-2 border-t-2 border-nepa-green/30" />
              <div aria-hidden="true" className="absolute -bottom-3 -right-3 size-6 border-r-2 border-b-2 border-nepa-green/30" />
            </div>
          </div>
        </div>

        {/* Bottom diagonal cut */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
      </section>

      {/* ============================================================ */}
      {/*  2. TRUST BAR                                                 */}
      {/* ============================================================ */}
      <section className="relative border-b border-border bg-background py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-5 sm:px-6 lg:px-8">
          {[
            { icon: Shield, label: "Gepr\u00fcfte Qualit\u00e4t" },
            { icon: Truck, label: "1\u20132 Tage Versand" },
            { icon: Phone, label: "Fachberatung" },
            { icon: Award, label: "Gro\u00dfes Sortiment" },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2.5 text-[12px] font-semibold tracking-wide text-muted-foreground">
              <span className="flex size-7 items-center justify-center rounded-md bg-nepa-green/8">
                <Icon className="size-3.5 text-nepa-green" />
              </span>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3. KOMPATIBILITAETSFINDER                                    */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Subtle grid background */}
            <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern opacity-30" />

            <div className="relative grid items-center gap-10 p-8 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-6 bg-nepa-green" />
                  <span className="label-technical text-nepa-green">
                    Maschinenkompatibilit&auml;t
                  </span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Finden Sie das passende Teil in Sekunden
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  W&auml;hlen Sie Hersteller und Modell&nbsp;&mdash; unser Finder
                  zeigt Ihnen alle kompatiblen Ersatzteile f&uuml;r Ihre Maschine.
                </p>
                <Link
                  href="/finder"
                  className="group mt-7 inline-flex items-center gap-2.5 rounded-lg bg-nepa-blue px-6 py-3 text-sm font-bold text-white transition-all hover:bg-nepa-blue/90 hover:shadow-lg hover:shadow-nepa-blue/15"
                >
                  <Crosshair className="size-4" />
                  Finder starten
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="space-y-3 stagger-children">
                {[
                  { name: "Sunnen", sub: "MBC-1805, LBB-1710 u.a.", image: "/images/machines/sunnen-mbc1805g.jpg" },
                  { name: "Gehring", sub: "PowerHone, VersaHone u.a.", image: "/images/products/powerhone-v.jpg" },
                  { name: "Nagel", sub: "UltraHone, ECO-Hone u.a.", image: "/images/products/ultrahone-v.jpg" },
                ].map((mfr) => (
                  <Link
                    key={mfr.name}
                    href="/finder"
                    className="group flex items-center gap-4 rounded-xl border border-border bg-background p-3.5 pr-5 transition-all hover:border-nepa-green/30 hover:shadow-md hover:shadow-nepa-green/5 hover-lift"
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                      <img
                        src={mfr.image}
                        alt={mfr.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground group-hover:text-nepa-green transition-colors">
                        {mfr.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {mfr.sub}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/30 transition-all group-hover:text-nepa-green group-hover:translate-x-0.5" />
                  </Link>
                ))}
                <Link
                  href="/finder"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-[13px] font-semibold text-muted-foreground transition-all hover:border-nepa-green/30 hover:text-nepa-green hover:bg-nepa-green/[0.02]"
                >
                  Alle Hersteller anzeigen
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4. CATEGORIES                                                */}
      {/* ============================================================ */}
      <section className="relative border-t border-border py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-nepa-green" />
                <span className="label-technical text-nepa-green">
                  Sortiment
                </span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Kategorien
              </h2>
            </div>
            <Link
              href="/kategorien"
              className="group hidden items-center gap-2 text-sm font-bold text-nepa-green hover:text-nepa-green/80 sm:inline-flex"
            >
              Alle ansehen
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {categories.map((cat, i) => {
              const icons = [Cog, Wrench, Crosshair, Gauge, Package, Shield]
              const Icon = icons[i % icons.length]

              return (
                <Link key={cat.id} href={`/kategorien/${cat.slug}`}>
                  <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-nepa-green/30 hover:shadow-md hover:shadow-nepa-green/5 hover-lift">
                    {/* Large faded number */}
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -top-4 font-display text-7xl font-extrabold text-foreground/[0.03] transition-colors group-hover:text-nepa-green/[0.06]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div className="relative flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-nepa-green/8 transition-colors group-hover:bg-nepa-green/15">
                        <Icon className="size-4.5 text-nepa-green" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-nepa-green transition-colors">
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-[12px] text-muted-foreground">
                          {cat._count.products}{" "}
                          {cat._count.products === 1 ? "Produkt" : "Produkte"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/kategorien"
              className="inline-flex items-center gap-2 text-sm font-bold text-nepa-green"
            >
              Alle Kategorien
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5. FEATURED PRODUCTS                                         */}
      {/* ============================================================ */}
      <section className="relative border-t border-border bg-muted/40 py-20 sm:py-24">
        {/* Subtle noise texture */}
        <div aria-hidden="true" className="bg-noise absolute inset-0" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-6 bg-nepa-green" />
                <span className="label-technical text-nepa-green">
                  Empfehlungen
                </span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Beliebte Produkte
              </h2>
            </div>
            <Link
              href="/produkte"
              className="group hidden items-center gap-2 text-sm font-bold text-nepa-green hover:text-nepa-green/80 sm:inline-flex"
            >
              Alle Produkte
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {featuredProducts.map((product) => {
              const images = Array.isArray(product.images) ? product.images : []
              const firstImage = images[0] ?? null

              return (
                <Link key={product.id} href={`/produkte/${product.slug}`} className="group block">
                  <Card className="h-full overflow-hidden border-border/60 bg-card transition-all duration-300 group-hover:border-nepa-green/30 group-hover:shadow-xl group-hover:shadow-nepa-green/[0.06] hover-lift">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-muted to-muted/60">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="size-8 text-muted-foreground/20" />
                        </div>
                      )}

                      {/* Top accent line on hover */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-nepa-green scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />

                      {product.stock > 0 ? (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-nepa-dark/80 px-2.5 py-1 backdrop-blur-sm">
                          <span className="size-1.5 rounded-full bg-nepa-green animate-pulse" />
                          <span className="text-[10px] font-bold text-white">Auf Lager</span>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 rounded-full bg-nepa-dark/80 px-2.5 py-1 backdrop-blur-sm">
                          <span className="text-[10px] font-medium text-white/50">Nicht verf&uuml;gbar</span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-nepa-green transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/60">
                        Art.-Nr.: {product.sku}
                      </p>

                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="font-display text-lg font-extrabold tracking-tight text-foreground">
                            {formatPrice(product.price)}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground/60">
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
            })}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/produkte"
              className="inline-flex items-center gap-2 text-sm font-bold text-nepa-green"
            >
              Alle Produkte
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  6. VALUE PROPOSITIONS                                        */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              {
                icon: Shield,
                title: "Gepr\u00fcfte Qualit\u00e4t",
                text: "Alle Produkte durchlaufen strenge Qualit\u00e4tskontrollen nach industriellen Standards.",
              },
              {
                icon: Truck,
                title: "Schneller Versand",
                text: "Lagerware in 1\u20132 Werktagen bei Ihnen. Express-Optionen verf\u00fcgbar.",
              },
              {
                icon: Phone,
                title: "Technische Beratung",
                text: "Unser Fachteam hilft bei der Auswahl der richtigen Teile f\u00fcr Ihre Maschine.",
              },
              {
                icon: Award,
                title: "Gro\u00dfe Auswahl",
                text: "Umfangreiches Sortiment f\u00fcr alle g\u00e4ngigen Honmaschinen-Hersteller.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-nepa-green/20 hover:shadow-md hover:shadow-nepa-green/5"
              >
                {/* Corner accent */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 h-12 w-[3px] bg-nepa-green/20 transition-colors group-hover:bg-nepa-green/50"
                />

                <div className="flex size-11 items-center justify-center rounded-xl bg-nepa-green/8 transition-colors group-hover:bg-nepa-green/15">
                  <Icon className="size-5 text-nepa-green" />
                </div>
                <h3 className="mt-5 font-display text-sm font-extrabold tracking-wide text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  7. CTA BANNER                                                */}
      {/* ============================================================ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-nepa-dark my-16 sm:my-20">
            {/* Grid pattern */}
            <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern-fine text-white/[0.03]" />
            {/* Green glow */}
            <div aria-hidden="true" className="absolute -right-20 -top-20 size-80 rounded-full bg-nepa-green/10 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 px-8 py-16 text-center sm:py-20">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-nepa-green/50" />
                <span className="label-technical text-nepa-green/70">Kontakt</span>
                <span className="h-px w-8 bg-nepa-green/50" />
              </div>
              <h2 className="max-w-lg font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Brauchen Sie Hilfe bei der Teileauswahl?
              </h2>
              <p className="max-w-md text-base text-white/40">
                Unser technisches Team ber&auml;t Sie gerne bei der Auswahl der
                richtigen Ersatzteile f&uuml;r Ihre Maschine.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/kontakt"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-lg bg-nepa-green px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-nepa-green/90 hover:shadow-lg hover:shadow-nepa-green/20"
                >
                  Kontakt aufnehmen
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/finder"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-white/15 px-7 py-3.5 text-sm font-bold text-white/70 transition-all hover:border-white/30 hover:text-white"
                >
                  <Crosshair className="size-4 text-nepa-green" />
                  Finder nutzen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
