"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Package, CheckCircle2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice, formatStock, parseImages } from "@/lib/format"

interface Machine {
  id: string
  name: string
  slug: string
}

interface FinderProduct {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  stock: number
  images: unknown
  category: { name: string; slug: string }
}

interface FinderWidgetProps {
  manufacturers: string[]
}

export function FinderWidget({ manufacturers }: FinderWidgetProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialManufacturer = searchParams.get("hersteller") ?? ""
  const initialMachine = searchParams.get("maschine") ?? ""

  const [manufacturer, setManufacturer] = useState(initialManufacturer)
  const [machineSlug, setMachineSlug] = useState(initialMachine)

  const [machines, setMachines] = useState<Machine[]>([])
  const [products, setProducts] = useState<FinderProduct[]>([])

  const [loadingMachines, setLoadingMachines] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)

  // --- URL sync ---
  const updateUrl = useCallback(
    (mfr: string, machine: string) => {
      const params = new URLSearchParams()
      if (mfr) params.set("hersteller", mfr)
      if (machine) params.set("maschine", machine)
      const qs = params.toString()
      router.push(qs ? `/finder?${qs}` : "/finder", { scroll: false })
    },
    [router]
  )

  // --- Fetch machines when manufacturer changes ---
  useEffect(() => {
    if (!manufacturer) {
      setMachines([])
      setProducts([])
      return
    }

    let cancelled = false
    setLoadingMachines(true)
    setMachines([])
    setProducts([])

    fetch(`/api/finder/machines?manufacturer=${encodeURIComponent(manufacturer)}`)
      .then((r) => r.json())
      .then((data: Machine[]) => {
        if (!cancelled) {
          setMachines(data)
          setLoadingMachines(false)

          // If URL had a machine pre-selected that belongs to this manufacturer, keep it
          const exists = data.some((m) => m.slug === initialMachine)
          if (!exists) {
            setMachineSlug("")
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMachines([])
          setLoadingMachines(false)
        }
      })

    return () => {
      cancelled = true
    }
    // Only re-run when manufacturer changes, not initialMachine
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturer])

  // --- Fetch products when machine changes ---
  useEffect(() => {
    if (!machineSlug) {
      setProducts([])
      return
    }

    let cancelled = false
    setLoadingProducts(true)

    fetch(`/api/finder/products?machine=${encodeURIComponent(machineSlug)}`)
      .then((r) => r.json())
      .then((data: FinderProduct[]) => {
        if (!cancelled) {
          setProducts(data)
          setLoadingProducts(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([])
          setLoadingProducts(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [machineSlug])

  // --- Handlers ---
  function handleManufacturerChange(val: string | null) {
    const v = val ?? ""
    setManufacturer(v)
    setMachineSlug("")
    setProducts([])
    updateUrl(v, "")
  }

  function handleMachineChange(val: string | null) {
    const v = val ?? ""
    setMachineSlug(v)
    updateUrl(manufacturer, v)
  }

  // --- Helpers ---
  const currentStep = !manufacturer ? 1 : !machineSlug ? 2 : 3

  return (
    <div className="space-y-8">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <StepIndicator step={1} current={currentStep} label="Hersteller" />
        <StepConnector active={currentStep >= 2} />
        <StepIndicator step={2} current={currentStep} label="Modell" />
        <StepConnector active={currentStep >= 3} />
        <StepIndicator step={3} current={currentStep} label="Ergebnisse" />
      </div>

      {/* Selectors */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Manufacturer */}
        <div className="space-y-2">
          <label className="text-sm font-medium">1. Hersteller</label>
          <Select value={manufacturer} onValueChange={handleManufacturerChange}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Hersteller wählen..." />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Machine */}
        <div className="space-y-2">
          <label className="text-sm font-medium">2. Maschinenmodell</label>
          {loadingMachines ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <Select
              value={machineSlug}
              onValueChange={handleMachineChange}
              disabled={machines.length === 0}
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue
                  placeholder={
                    !manufacturer
                      ? "Zuerst Hersteller wählen"
                      : machines.length === 0
                        ? "Keine Modelle gefunden"
                        : "Modell wählen..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {machines.map((m) => (
                  <SelectItem key={m.slug} value={m.slug}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Results area */}
      <div className="min-h-[200px]">
        {!manufacturer && (
          <p className="py-16 text-center text-muted-foreground">
            Bitte wählen Sie einen Hersteller, um kompatible Teile zu finden.
          </p>
        )}

        {manufacturer && !machineSlug && !loadingMachines && (
          <p className="py-16 text-center text-muted-foreground">
            Bitte wählen Sie ein Maschinenmodell.
          </p>
        )}

        {loadingProducts && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-xl border p-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {machineSlug && !loadingProducts && products.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            Keine passenden Teile gefunden.
          </p>
        )}

        {!loadingProducts && products.length > 0 && (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {products.length}{" "}
              {products.length === 1 ? "kompatibles Teil" : "kompatible Teile"}{" "}
              gefunden
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <FinderProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({
  step,
  current,
  label,
}: {
  step: number
  current: number
  label: string
}) {
  const isComplete = current > step
  const isActive = current === step

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
          isComplete
            ? "border-primary bg-primary text-primary-foreground"
            : isActive
              ? "border-primary text-primary"
              : "border-muted-foreground/30 text-muted-foreground/50"
        }`}
      >
        {isComplete ? <CheckCircle2 className="size-4" /> : step}
      </div>
      <span
        className={`text-xs font-medium ${
          isActive || isComplete ? "text-foreground" : "text-muted-foreground/50"
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className={`mb-6 h-0.5 w-8 rounded-full sm:w-16 transition-colors ${
        active ? "bg-primary" : "bg-muted-foreground/20"
      }`}
    />
  )
}

function FinderProductCard({ product }: { product: FinderProduct }) {
  const images = parseImages(product.images)
  const firstImage = images[0] ?? null
  const stockInfo = formatStock(product.stock)

  return (
    <Link href={`/produkte/${product.slug}`} className="group block">
      <Card className="h-full transition-shadow duration-200 group-hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Package className="size-12 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-2">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            Art.-Nr.: {product.sku}
          </p>
          <p className="text-base font-semibold">
            {formatPrice(product.price)}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-1.5">
            <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
            <Badge variant="secondary">{product.category.name}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
