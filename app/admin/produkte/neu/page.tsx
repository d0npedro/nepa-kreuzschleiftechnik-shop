import { getCategories, getMachines } from '@/lib/queries'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = "force-dynamic"

export default async function NeuesProduktPage() {
  const [categories, machines] = await Promise.all([
    getCategories(),
    getMachines(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Neues Produkt</h2>
        <p className="text-muted-foreground">
          Erstellen Sie ein neues Produkt im Katalog.
        </p>
      </div>

      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        machines={machines.map((m) => ({
          id: m.id,
          manufacturer: m.manufacturer,
          name: m.name,
        }))}
      />
    </div>
  )
}
