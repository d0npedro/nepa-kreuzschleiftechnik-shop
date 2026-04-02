"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, ShoppingCart, Search, ArrowRight, X } from "lucide-react"

import { useCartStore } from "@/lib/cart-store"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const navLinks = [
  { href: "/produkte", label: "Produkte" },
  { href: "/kategorien", label: "Kategorien" },
  { href: "/finder", label: "Finder" },
  { href: "/kontakt", label: "Kontakt" },
] as const

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems)
  const itemCount = totalItems()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
      {/* Top micro-bar */}
      <div className="hidden border-b border-border/30 bg-nepa-dark text-[10px] tracking-widest text-white/50 sm:block">
        <div className="mx-auto flex h-7 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <span className="font-display uppercase">Kreuzschleiftechnik seit Generationen</span>
          <span className="font-mono">info@nepa.de</span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3.5 select-none">
          <div className="relative flex items-baseline gap-0">
            <span className="font-display text-2xl font-extrabold tracking-[-0.04em] text-nepa-blue">
              NEPA
            </span>
            <span className="font-display text-2xl font-extrabold text-nepa-green">.</span>
          </div>
          <div className="hidden h-5 w-px bg-border/60 sm:block" />
          <div className="hidden flex-col sm:flex">
            <span className="label-technical text-nepa-steel leading-none">
              Kreuzschleif
            </span>
            <span className="label-technical text-nepa-steel/60 leading-none mt-0.5">
              technik
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="group relative px-4 py-2 text-[13px] font-semibold tracking-wide text-foreground/60 transition-colors hover:text-foreground"
            >
              {label}
              <span className="absolute inset-x-4 -bottom-[1.5px] h-[2px] scale-x-0 bg-nepa-green transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link href="/suche">
            <Button variant="ghost" size="icon" className="size-9 text-foreground/50 hover:text-foreground hover:bg-nepa-green/5" aria-label="Suche">
              <Search className="size-[17px]" />
            </Button>
          </Link>

          <Link href="/warenkorb" className="relative">
            <Button variant="ghost" size="icon" className="size-9 text-foreground/50 hover:text-foreground hover:bg-nepa-green/5" aria-label="Warenkorb">
              <ShoppingCart className="size-[17px]" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full bg-nepa-green text-[9px] font-bold text-white ring-2 ring-background">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" className="size-9 ml-0.5" aria-label="Menü öffnen" />}
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] p-0 bg-background">
                <SheetHeader className="border-b border-border px-6 py-5">
                  <SheetTitle className="flex items-baseline gap-0">
                    <span className="font-display text-xl font-extrabold tracking-[-0.04em] text-nepa-blue">
                      NEPA
                    </span>
                    <span className="font-display text-xl font-extrabold text-nepa-green">.</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col py-2">
                  {navLinks.map(({ href, label }, i) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="group flex items-center justify-between px-6 py-4 text-sm font-semibold text-foreground/70 transition-colors hover:bg-nepa-green/5 hover:text-foreground"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-nepa-green/40">0{i + 1}</span>
                        {label}
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-nepa-green" />
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto border-t border-border px-6 py-5">
                  <Link
                    href="/warenkorb"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-sm font-semibold text-nepa-blue"
                  >
                    <ShoppingCart className="size-4" />
                    <span>Warenkorb</span>
                    {itemCount > 0 && (
                      <Badge variant="default" className="ml-auto bg-nepa-green text-white">
                        {itemCount}
                      </Badge>
                    )}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
