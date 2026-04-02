import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StockAdjustment } from '@/components/admin/stock-adjustment'

export const dynamic = "force-dynamic"

export default async function LagerAdminPage() {
  const [products, recentLogs] = await Promise.all([
    prisma.product.findMany({
      orderBy: { stock: 'asc' },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
      },
    }),
    prisma.inventoryLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        product: {
          select: { name: true, sku: true },
        },
      },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Lagerverwaltung</h2>
        <p className="text-muted-foreground">
          Bestandsuebersicht und Inventaraenderungen
        </p>
      </div>

      {/* Stock overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bestandsuebersicht</CardTitle>
          <CardDescription>
            Alle Produkte sortiert nach Bestand (niedrigster zuerst)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produkt</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Bestand</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Keine Produkte vorhanden.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.sku}
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
                          {product.stock} Stk.
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <StockAdjustment
                          productId={product.id}
                          productName={product.name}
                          currentStock={product.stock}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory log */}
      <Card>
        <CardHeader>
          <CardTitle>Inventarprotokoll</CardTitle>
          <CardDescription>
            Letzte 30 Bestandsaenderungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Produkt</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Aenderung</TableHead>
                  <TableHead>Grund</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Noch keine Bestandsaenderungen protokolliert.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.product.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.product.sku}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-mono text-sm font-bold ${
                            log.change > 0
                              ? 'text-green-600'
                              : log.change < 0
                                ? 'text-red-600'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {log.change > 0 ? '+' : ''}
                          {log.change}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {formatReason(log.reason)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatReason(reason: string): string {
  if (reason.startsWith('ORDER_PLACED:')) {
    const orderId = reason.replace('ORDER_PLACED:', '')
    return `Bestellung ${orderId.slice(0, 8)}...`
  }
  return reason
}
