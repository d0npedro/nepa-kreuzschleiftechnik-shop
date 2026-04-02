import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const CreateMachineSchema = z.object({
  manufacturer: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
})

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const machines = await prisma.machine.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: [{ manufacturer: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(machines)
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

  const parsed = CreateMachineSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validierungsfehler', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const machine = await prisma.machine.create({
      data: parsed.data,
    })

    return NextResponse.json(machine, { status: 201 })
  } catch (error) {
    console.error('Fehler beim Erstellen der Maschine:', error)
    return NextResponse.json(
      { error: 'Maschine konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}
