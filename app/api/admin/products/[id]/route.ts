import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const UpdateProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  pdfUrl: z.string().optional(),
  isUsed: z.boolean().optional(),
  isB2BOnly: z.boolean().optional(),
  machineIds: z.array(z.string()).optional(),
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      compatibleMachines: {
        include: { machine: true },
      },
      orderItems: true,
      inventoryLogs: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Produkt nicht gefunden' }, { status: 404 })
  }

  return NextResponse.json(product)
}

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

  const parsed = UpdateProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validierungsfehler', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { machineIds, ...productData } = parsed.data

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: productData,
      })

      // Sync machine relations: delete old, create new
      await tx.productMachine.deleteMany({
        where: { productId: id },
      })

      if (machineIds && machineIds.length > 0) {
        await tx.productMachine.createMany({
          data: machineIds.map((machineId) => ({
            productId: id,
            machineId,
          })),
        })
      }

      return tx.product.findUniqueOrThrow({
        where: { id: updated.id },
        include: {
          category: true,
          compatibleMachines: {
            include: { machine: true },
          },
        },
      })
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Produkts:', error)
    return NextResponse.json(
      { error: 'Produkt konnte nicht aktualisiert werden' },
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

  try {
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Produkts:', error)
    return NextResponse.json(
      { error: 'Produkt konnte nicht gelöscht werden' },
      { status: 500 }
    )
  }
}
