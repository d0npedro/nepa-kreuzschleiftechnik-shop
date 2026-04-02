import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { adjustStock } from '@/actions/inventory'
import { z } from 'zod'

const AdjustInventorySchema = z.object({
  productId: z.string().min(1),
  change: z.number().int(),
  reason: z.string().min(1),
})

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }

  const parsed = AdjustInventorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validierungsfehler', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const updatedProduct = await adjustStock({
      productId: parsed.data.productId,
      change: parsed.data.change,
      reason: parsed.data.reason,
      userId: auth.adminUser.supabaseId,
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bestandsanpassung fehlgeschlagen'
    console.error('Fehler bei Bestandsanpassung:', error)
    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
