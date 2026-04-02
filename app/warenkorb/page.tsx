"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"

import { useCartStore } from "@/lib/cart-store"
import { createCheckoutSession } from "@/actions/checkout"
import { formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function WarenkorbPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setError(null)
    setIsCheckingOut(true)

    try {
      const result = await createCheckoutSession({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      })

      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      )
      setIsCheckingOut(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <ShoppingCart className="mx-auto size-16 text-muted-foreground/30" />
        <h1 className="mt-6 text-2xl font-bold">Ihr Warenkorb ist leer</h1>
        <p className="mt-2 text-muted-foreground">
          Stöbern Sie in unserem Sortiment und finden Sie passende Teile.
        </p>
        <Link href="/produkte">
          <Button className="mt-6">
            Zum Sortiment
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Warenkorb
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-start gap-4 rounded-xl border p-4"
            >
              {/* Image placeholder */}
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="size-6 text-muted-foreground/40" />
                )}
              </div>

              {/* Details */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/produkte/${item.slug}`}
                  className="text-sm font-medium leading-snug hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Art.-Nr.: {item.sku}
                </p>
                <p className="text-sm font-semibold">
                  {formatPrice(item.price)}
                </p>

                {/* Quantity controls */}
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>

              {/* Line total + remove */}
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Zusammenfassung</h2>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zwischensumme</span>
              <span className="font-medium">{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versand</span>
              <span className="text-xs text-muted-foreground">
                wird im Checkout berechnet
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-base font-semibold">
            <span>Gesamt</span>
            <span>{formatPrice(totalPrice())}</span>
          </div>

          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}

          <Button
            className="mt-6 w-full h-10"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? "Weiterleitung..." : "Zur Kasse"}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Sichere Zahlung über Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
