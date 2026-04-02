import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Bestellung erfolgreich",
}

export default function CheckoutErfolgPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <CheckCircle2 className="mx-auto size-16 text-green-600" />

      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        Vielen Dank für Ihre Bestellung!
      </h1>

      <p className="mt-4 text-muted-foreground">
        Ihre Zahlung wurde erfolgreich verarbeitet. Sie erhalten in Kürze eine
        Bestätigung per E-Mail mit allen Details zu Ihrer Bestellung.
      </p>

      <div className="mt-8">
        <Link
          href="/produkte"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Zurück zum Shop
        </Link>
      </div>
    </div>
  )
}
