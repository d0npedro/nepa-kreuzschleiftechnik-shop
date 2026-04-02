import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const UpdateCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }

  const parsed = UpdateCategorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validierungsfehler', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Kategorie:', error)
    return NextResponse.json(
      { error: 'Kategorie konnte nicht aktualisiert werden' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params

  // Check if category has products
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  })

  if (productCount > 0) {
    return NextResponse.json(
      { error: `Kategorie kann nicht gelöscht werden, da noch ${productCount} Produkt(e) zugeordnet sind` },
      { status: 409 }
    )
  }

  try {
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen der Kategorie:', error)
    return NextResponse.json(
      { error: 'Kategorie konnte nicht gelöscht werden' },
      { status: 500 }
    )
  }
}
