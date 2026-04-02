import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
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
import { Plus, Pencil } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function ProdukteAdminPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Produkte</h2>
          <p className="text-muted-foreground">
            {products.length} Produkte im Katalog
          </p>
        </div>
        <Link href="/admin/produkte/neu">
          <Button className="bg-nepa-blue hover:bg-nepa-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Neues Produkt
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Preis</TableHead>
              <TableHead className="text-center">Bestand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Noch keine Produkte vorhanden.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div>
                      {product.name}
                      <div className="flex gap-1 mt-0.5">
                        {product.isUsed && (
                          <Badge variant="secondary" className="text-[10px]">
                            Gebraucht
                          </Badge>
                        )}
                        {product.isB2BOnly && (
                          <Badge variant="outline" className="text-[10px]">
                            B2B
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(Number(product.price))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        product.stock === 0
                          ? 'destructive'
                          : product.stock < 5
                            ? 'outline'
                            : 'default'
                      }
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center text-xs text-green-700">
                        Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-red-600">
                        Ausverkauft
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/produkte/${product.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
