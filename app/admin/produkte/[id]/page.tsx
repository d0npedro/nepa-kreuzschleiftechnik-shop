import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCategories, getMachines } from '@/lib/queries'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = "force-dynamic"

export default async function ProduktBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories, machines] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        compatibleMachines: {
          include: { machine: true },
        },
      },
    }),
    getCategories(),
    getMachines(),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Produkt bearbeiten
        </h2>
        <p className="text-muted-foreground">
          {product.name} ({product.sku})
        </p>
      </div>

      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          slug: product.slug,
          description: product.description ?? '',
          price: Number(product.price),
          stock: product.stock,
          categoryId: product.categoryId,
          isUsed: product.isUsed,
          isB2BOnly: product.isB2BOnly,
          pdfUrl: product.pdfUrl ?? '',
          machineIds: product.compatibleMachines.map((cm) => cm.machineId),
        }}
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
