import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, ShoppingBag, Warehouse, Euro } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    totalOrders,
    revenueResult,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'PAID' },
    }),
    prisma.product.findMany({
      where: { stock: { lt: 5 } },
      orderBy: { stock: 'asc' },
      select: { id: true, name: true, sku: true, stock: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    }),
  ])

  const totalRevenue = revenueResult._sum.total
    ? Number(revenueResult._sum.total)
    : 0

  const stats = [
    {
      title: 'Produkte',
      value: totalProducts.toString(),
      description: 'Gesamtanzahl im Katalog',
      icon: Package,
      href: '/admin/produkte',
    },
    {
      title: 'Bestellungen',
      value: totalOrders.toString(),
      description: 'Gesamtanzahl',
      icon: ShoppingBag,
      href: '/admin/bestellungen',
    },
    {
      title: 'Umsatz',
      value: formatPrice(totalRevenue),
      description: 'Bezahlte Bestellungen',
      icon: Euro,
      href: '/admin/bestellungen',
    },
    {
      title: 'Niedriger Bestand',
      value: lowStockProducts.length.toString(),
      description: 'Produkte mit Bestand < 5',
      icon: Warehouse,
      href: '/admin/lager',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Willkommen im NEPA Admin-Bereich.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Bestellungen</CardTitle>
            <CardDescription>Die 5 neuesten Bestellungen</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Noch keine Bestellungen vorhanden.
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {order.id.slice(0, 8)}...
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 truncate text-sm">
                        {order.items
                          .map((item) => item.product.name)
                          .join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="ml-4 text-right font-medium">
                      {formatPrice(Number(order.total))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low stock alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Bestandswarnungen</CardTitle>
            <CardDescription>Produkte mit weniger als 5 Einheiten</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Alle Produkte haben ausreichend Bestand.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {product.sku}
                      </p>
                    </div>
                    <Badge
                      variant={product.stock === 0 ? 'destructive' : 'secondary'}
                    >
                      {product.stock} Stk.
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: 'Ausstehend', variant: 'outline' },
    PAID: { label: 'Bezahlt', variant: 'default' },
    SHIPPED: { label: 'Versendet', variant: 'secondary' },
    DELIVERED: { label: 'Geliefert', variant: 'default' },
    CANCELLED: { label: 'Storniert', variant: 'destructive' },
  }

  const { label, variant } = config[status] ?? {
    label: status,
    variant: 'outline' as const,
  }

  return <Badge variant={variant}>{label}</Badge>
}
