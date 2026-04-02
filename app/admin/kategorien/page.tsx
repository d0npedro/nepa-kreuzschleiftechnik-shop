import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CategoryActions } from '@/components/admin/category-actions'

export const dynamic = "force-dynamic"

export default async function KategorienAdminPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Kategorien</h2>
        <p className="text-muted-foreground">
          {categories.length} Kategorien verwalten
        </p>
      </div>

      {/* Inline create form */}
      <CategoryActions categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        _count: { products: c._count.products },
      }))} />
    </div>
  )
}
