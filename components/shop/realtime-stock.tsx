'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

interface RealtimeStockProps {
  productId: string
  initialStock: number
}

export function RealtimeStock({ productId, initialStock }: RealtimeStockProps) {
  const [stock, setStock] = useState(initialStock)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`product-stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Product',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new.stock === 'number') {
            setStock(payload.new.stock)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [productId])

  if (stock > 10) {
    return <Badge variant="default" className="bg-nepa-green">Auf Lager ({stock})</Badge>
  }
  if (stock > 0) {
    return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Nur noch {stock} Stück</Badge>
  }
  return <Badge variant="destructive">Nicht verfügbar</Badge>
}
