"use client"

import { useState } from "react"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    stock: number
    image: string | null
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const maxQty = Math.min(product.stock, 10)
  const [quantity, setQuantity] = useState(1)

  const inStock = product.stock > 0

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      quantity,
      stock: product.stock,
      image: product.image,
    })

    toast.success("Zum Warenkorb hinzugefuegt", {
      description: `${quantity}x ${product.name}`,
    })
  }

  if (!inStock) {
    return (
      <Button disabled size="lg" className="w-full cursor-not-allowed sm:w-fit">
        <ShoppingCart className="size-4" />
        Nicht verfuegbar
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Quantity selector */}
      <div className="inline-flex h-10 items-center rounded-lg border border-border">
        <button
          type="button"
          aria-label="Menge verringern"
          disabled={quantity <= 1}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="flex w-10 items-center justify-center text-sm font-medium tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Menge erhoehen"
          disabled={quantity >= maxQty}
          onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
          className="flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Add to cart button */}
      <Button
        size="lg"
        onClick={handleAdd}
        className="w-full bg-nepa-green text-white hover:bg-nepa-green/90 sm:w-fit"
      >
        <ShoppingCart className="size-4" />
        In den Warenkorb
      </Button>
    </div>
  )
}
