import type { Metadata } from "next"
import { getManufacturers } from "@/lib/queries"
import { FinderWidget } from "@/components/shop/finder-widget"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Kompatibilitätsfinder",
  description:
    "Finden Sie passende Hon-Ersatzteile für Ihre Maschine. Wählen Sie Hersteller und Modell, um kompatible Teile anzuzeigen.",
}

export default async function FinderPage() {
  let manufacturers: string[] = []
  try {
    manufacturers = await getManufacturers()
  } catch {
    // DB not available
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Kompatibilitätsfinder
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Finden Sie passende Hon-Ersatzteile für Ihre Maschine
        </p>
      </div>

      <FinderWidget manufacturers={manufacturers} />
    </div>
  )
}
