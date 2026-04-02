'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatPrice } from '@/lib/format'
import { ChevronDown, ChevronRight } from 'lucide-react'

type OrderData = {
  id: string
  createdAt: string
  customerEmail: string | null
  customerId: string
  total: number
  status: string
  statusLabel: string
  statusColor: string
  items: {
    id: string
    quantity: number
    price: number
    productName: string
    productSku: string
  }[]
}

export function OrderDetails({ order }: { order: OrderData }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <TableCell className="w-8">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="font-mono text-xs">
          {order.id.slice(0, 8)}...
        </TableCell>
        <TableCell>
          {new Date(order.createdAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </TableCell>
        <TableCell>
          {order.customerEmail || (
            <span className="text-muted-foreground">
              {order.customerId.slice(0, 8)}...
            </span>
          )}
        </TableCell>
        <TableCell className="text-right font-medium">
          {formatPrice(order.total)}
        </TableCell>
        <TableCell>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${order.statusColor}`}
          >
            {order.statusLabel}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="secondary">{order.items.length}</Badge>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={7} className="p-0">
            <div className="px-12 py-4">
              <h4 className="mb-3 text-sm font-semibold">Bestellpositionen</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded border bg-white px-4 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        ({item.productSku})
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-muted-foreground">
                        {item.quantity}x
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end border-t pt-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Gesamt: </span>
                  <span className="font-bold">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
