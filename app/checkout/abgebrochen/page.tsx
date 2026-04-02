import type { Metadata } from "next"
import Link from "next/link"
import { XCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Zahlung abgebrochen",
}

export default function CheckoutAbgebrochenPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <XCircle className="mx-auto size-16 text-muted-foreground/50" />

      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        Die Zahlung wurde abgebrochen
      </h1>

      <p className="mt-4 text-muted-foreground">
        Ihre Bestellung wurde nicht abgeschlossen. Keine Sorge — es wurde nichts
        berechnet. Sie können es jederzeit erneut versuchen.
      </p>

      <div className="mt-8">
        <Link
          href="/warenkorb"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Zurück zum Warenkorb
        </Link>
      </div>
    </div>
  )
}
