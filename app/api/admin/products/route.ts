import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const CreateProductSchema = z.object({
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

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const products = await prisma.product.findMany({
    include: {
      category: true,
      compatibleMachines: {
        include: { machine: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

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

  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validierungsfehler', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { machineIds, ...productData } = parsed.data

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: productData,
      })

      if (machineIds && machineIds.length > 0) {
        await tx.productMachine.createMany({
          data: machineIds.map((machineId) => ({
            productId: created.id,
            machineId,
          })),
        })
      }

      return tx.product.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          category: true,
          compatibleMachines: {
            include: { machine: true },
          },
        },
      })
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen des Produkts:', error)
    return NextResponse.json(
      { error: 'Produkt konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}
