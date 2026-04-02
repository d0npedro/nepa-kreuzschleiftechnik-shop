"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, ShoppingCart, Search } from "lucide-react"

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
  { href: "/finder", label: "Kompatibilitätsfinder" },
  { href: "/kontakt", label: "Kontakt" },
] as const

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems)
  const itemCount = totalItems()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-0.5 select-none">
          <span className="text-2xl font-extrabold tracking-tight text-nepa-blue">
            NEPA
          </span>
          <span className="text-2xl font-extrabold text-nepa-green">.</span>
          <span className="ml-1.5 hidden text-[0.7rem] font-medium uppercase tracking-[0.15em] text-nepa-blue/70 sm:inline">
            Kreuzschleiftechnik
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link href="/suche">
            <Button variant="ghost" size="icon" aria-label="Suche">
              <Search className="size-[18px] text-foreground/70" />
            </Button>
          </Link>

          <Link href="/warenkorb" className="relative">
            <Button variant="ghost" size="icon" aria-label="Warenkorb">
              <ShoppingCart className="size-[18px] text-foreground/70" />
            </Button>
            {itemCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-nepa-green px-1 text-[10px] font-bold text-white"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Link>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" aria-label="Menü öffnen" />}
              >
                <Menu className="size-5 text-foreground" />
              </SheetTrigger>

              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle className="flex items-baseline gap-0.5">
                    <span className="text-lg font-extrabold tracking-tight text-nepa-blue">
                      NEPA
                    </span>
                    <span className="text-lg font-extrabold text-nepa-green">.</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col py-2">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center px-5 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto border-t border-border px-5 py-4">
                  <Link
                    href="/warenkorb"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-sm font-medium text-nepa-blue"
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
