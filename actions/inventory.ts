'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AdjustStockSchema = z.object({
  productId: z.string(),
  change: z.number().int(),
  reason: z.string().min(1),
  userId: z.string().optional(),
})

export async function adjustStock(input: z.infer<typeof AdjustStockSchema>) {
  const validated = AdjustStockSchema.parse(input)

  // Use a transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Lock the product row and get current stock
    const product = await tx.product.findUniqueOrThrow({
      where: { id: validated.productId },
      select: { id: true, stock: true, name: true },
    })

    const newStock = product.stock + validated.change
    if (newStock < 0) {
      throw new Error(
        `Bestand kann nicht unter 0 fallen. Aktuell: ${product.stock}, Änderung: ${validated.change}`
      )
    }

    // Update stock
    const updated = await tx.product.update({
      where: { id: validated.productId },
      data: { stock: newStock },
    })

    // Log the change
    await tx.inventoryLog.create({
      data: {
        productId: validated.productId,
        change: validated.change,
        reason: validated.reason,
        userId: validated.userId,
      },
    })

    return updated
  })

  return result
}

/**
 * Atomically reduce stock for order items.
 * This uses a raw SQL query for true atomicity with a WHERE check.
 */
export async function reduceStockForOrder(
  items: { productId: string; quantity: number }[],
  orderId: string
) {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      // Atomic decrement with stock check in WHERE clause
      const result = await tx.$executeRaw`
        UPDATE "Product"
        SET stock = stock - ${item.quantity},
            "updatedAt" = NOW()
        WHERE id = ${item.productId}
        AND stock >= ${item.quantity}
      `

      if (result === 0) {
        throw new Error(
          `Nicht genügend Bestand für Produkt ${item.productId}. Bestellung ${orderId} kann nicht verarbeitet werden.`
        )
      }

      // Log the inventory change
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          reason: `ORDER_PLACED:${orderId}`,
        },
      })
    }
  })
}
