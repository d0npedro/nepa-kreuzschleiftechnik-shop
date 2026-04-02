import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderDetails } from '@/components/admin/order-details'

export const dynamic = "force-dynamic"

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }
> = {
  PENDING: { label: 'Ausstehend', variant: 'outline', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  PAID: { label: 'Bezahlt', variant: 'default', color: 'bg-green-100 text-green-800 border-green-300' },
  SHIPPED: { label: 'Versendet', variant: 'secondary', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  DELIVERED: { label: 'Geliefert', variant: 'default', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CANCELLED: { label: 'Storniert', variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-300' },
  REFUNDED: { label: 'Erstattet', variant: 'destructive', color: 'bg-orange-100 text-orange-800 border-orange-300' },
}

export default async function BestellungenAdminPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, sku: true, slug: true },
          },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bestellungen</h2>
        <p className="text-muted-foreground">
          {orders.length} Bestellungen insgesamt
        </p>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>ID</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Artikel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Noch keine Bestellungen vorhanden.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const statusConf = STATUS_CONFIG[order.status] ?? {
                  label: order.status,
                  variant: 'outline' as const,
                  color: '',
                }
                return (
                  <OrderDetails
                    key={order.id}
                    order={{
                      id: order.id,
                      createdAt: order.createdAt.toISOString(),
                      customerEmail: order.customerEmail,
                      customerId: order.customerId,
                      total: Number(order.total),
                      status: order.status,
                      statusLabel: statusConf.label,
                      statusColor: statusConf.color,
                      items: order.items.map((item) => ({
                        id: item.id,
                        quantity: item.quantity,
                        price: Number(item.price),
                        productName: item.product.name,
                        productSku: item.product.sku,
                      })),
                    }}
                  />
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
