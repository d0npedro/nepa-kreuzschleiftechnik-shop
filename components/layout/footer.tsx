import Link from "next/link"
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react"

const shopLinks = [
  { label: "Alle Produkte", href: "/produkte" },
  { label: "Kategorien", href: "/kategorien" },
  { label: "Kompatibilitätsfinder", href: "/finder" },
]

const infoLinks = [
  { label: "Kontakt", href: "/kontakt" },
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
]

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-nepa-dark">
      {/* Grid pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-pattern-fine text-white/[0.02]"
      />

      <div className="relative">
        {/* Top accent — animated gradient line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-nepa-green/60 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-8">
          {/* Logo row */}
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm space-y-5">
              <div className="flex items-baseline gap-0">
                <span className="font-display text-3xl font-extrabold tracking-[-0.04em] text-white">
                  NEPA
                </span>
                <span className="font-display text-3xl font-extrabold text-nepa-green">.</span>
              </div>
              <p className="label-technical text-white/20">
                Kreuzschleiftechnik
              </p>
              <p className="text-sm leading-relaxed text-white/30">
                Ihr Fachhandel f&uuml;r Hon-Ersatzteile und Kreuzschleiftechnik.
                Hochwertige Schleifwerkzeuge, Honleisten und Zubeh&ouml;r f&uuml;r
                die professionelle Oberfl&auml;chenbearbeitung.
              </p>
            </div>

            {/* Links grid */}
            <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 lg:gap-20">
              <div>
                <h3 className="label-technical mb-6 text-white/40">
                  Shop
                </h3>
                <ul className="space-y-3.5">
                  {shopLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/35 transition-colors hover:text-nepa-green"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="label-technical mb-6 text-white/40">
                  Information
                </h3>
                <ul className="space-y-3.5">
                  {infoLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/35 transition-colors hover:text-nepa-green"
                      >
                        {link.label}
                        <ArrowUpRight className="size-3 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h3 className="label-technical mb-6 text-white/40">
                  Kontakt
                </h3>
                <ul className="space-y-3.5 text-sm text-white/35">
                  <li>
                    <a
                      href="mailto:info@nepa.de"
                      className="group inline-flex items-center gap-3 font-medium transition-colors hover:text-nepa-green"
                    >
                      <span className="flex size-7 items-center justify-center rounded-md bg-white/5">
                        <Mail className="size-3.5 text-nepa-green/60" />
                      </span>
                      info@nepa.de
                    </a>
                  </li>
                  <li className="flex items-center gap-3 font-medium">
                    <span className="flex size-7 items-center justify-center rounded-md bg-white/5">
                      <Phone className="size-3.5 text-nepa-green/60" />
                    </span>
                    +49 (0) XXX XXXXXXX
                  </li>
                  <li className="flex items-start gap-3 font-medium">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white/5">
                      <MapPin className="size-3.5 text-nepa-green/60" />
                    </span>
                    <span>Musterstra&szlig;e 1<br />12345 Musterstadt</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row lg:px-8">
            <p className="text-[11px] font-medium text-white/20">
              &copy; 2026 NEPA Kreuzschleiftechnik GmbH. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-nepa-green/40" />
              <span className="label-technical text-white/15">Qualit&auml;t seit Generationen</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
