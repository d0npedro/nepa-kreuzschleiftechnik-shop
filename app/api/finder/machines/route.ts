import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const manufacturer = request.nextUrl.searchParams.get("manufacturer")

  if (!manufacturer) {
    return NextResponse.json(
      { error: "Parameter 'manufacturer' ist erforderlich." },
      { status: 400 }
    )
  }

  const machines = await prisma.machine.findMany({
    where: { manufacturer },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  })

  return NextResponse.json(machines)
}
