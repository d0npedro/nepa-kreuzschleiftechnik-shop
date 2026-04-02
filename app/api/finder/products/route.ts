import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const machineSlug = request.nextUrl.searchParams.get("machine")

  if (!machineSlug) {
    return NextResponse.json(
      { error: "Parameter 'machine' ist erforderlich." },
      { status: 400 }
    )
  }

  const machine = await prisma.machine.findUnique({
    where: { slug: machineSlug },
    include: {
      products: {
        include: {
          product: {
            include: { category: { select: { name: true, slug: true } } },
          },
        },
      },
    },
  })

  if (!machine) {
    return NextResponse.json(
      { error: "Maschine nicht gefunden." },
      { status: 404 }
    )
  }

  const products = machine.products.map((pm) => ({
    id: pm.product.id,
    name: pm.product.name,
    slug: pm.product.slug,
    sku: pm.product.sku,
    price: Number(pm.product.price),
    stock: pm.product.stock,
    images: pm.product.images,
    category: pm.product.category,
  }))

  return NextResponse.json(products)
}
