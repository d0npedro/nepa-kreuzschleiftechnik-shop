'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Pencil, Loader2 } from 'lucide-react'

export function StockAdjustment({
  productId,
  productName,
  currentStock,
}: {
  productId: string
  productName: string
  currentStock: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [change, setChange] = useState<number>(0)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (change === 0) {
      toast.error('Bitte geben Sie eine Aenderung ungleich 0 ein')
      return
    }
    if (!reason.trim()) {
      toast.error('Bitte geben Sie einen Grund an')
      return
    }

    const newStock = currentStock + change
    if (newStock < 0) {
      toast.error(
        `Bestand kann nicht unter 0 fallen. Aktuell: ${currentStock}, Aenderung: ${change}`
      )
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          change,
          reason: reason.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Fehler bei der Bestandsanpassung')
      }

      toast.success(
        `Bestand angepasst: ${currentStock} -> ${newStock}`
      )
      setChange(0)
      setReason('')
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Fehler bei der Bestandsanpassung'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="mr-1.5 h-3 w-3" />
            Bestand anpassen
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Bestand anpassen</DialogTitle>
            <DialogDescription>
              {productName} - Aktueller Bestand: {currentStock} Stk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`change-${productId}`}>
                Aenderung (+ oder -)
              </Label>
              <Input
                id={`change-${productId}`}
                type="number"
                step="1"
                value={change || ''}
                onChange={(e) =>
                  setChange(parseInt(e.target.value, 10) || 0)
                }
                placeholder="z.B. +10 oder -3"
              />
              {change !== 0 && (
                <p className="text-xs text-muted-foreground">
                  Neuer Bestand:{' '}
                  <span className="font-bold">
                    {currentStock + change}
                  </span>{' '}
                  Stk.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`reason-${productId}`}>Grund *</Label>
              <Input
                id={`reason-${productId}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="z.B. Wareneingang, Inventur, Retoure"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-nepa-blue hover:bg-nepa-blue/90"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Anpassen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
