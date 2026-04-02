'use server'

import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

const CheckoutItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
})

const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  customerEmail: z.string().email().optional(),
})

export async function createCheckoutSession(input: z.infer<typeof CheckoutSchema>) {
  const validated = CheckoutSchema.parse(input)

  // Fetch products and validate stock
  const products = await prisma.product.findMany({
    where: { id: { in: validated.items.map((i) => i.productId) } },
  })

  if (products.length !== validated.items.length) {
    throw new Error('Ein oder mehrere Produkte wurden nicht gefunden.')
  }

  // Check stock availability
  for (const item of validated.items) {
    const product = products.find((p) => p.id === item.productId)!
    if (product.stock < item.quantity) {
      throw new Error(`Nicht genügend Bestand für "${product.name}". Verfügbar: ${product.stock}`)
    }
  }

  // Calculate total
  const total = validated.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    return sum + Number(product.price) * item.quantity
  }, 0)

  // Create order in PENDING status
  const order = await prisma.order.create({
    data: {
      customerId: validated.customerEmail || 'anonymous',
      customerEmail: validated.customerEmail,
      status: 'PENDING',
      total,
      items: {
        create: validated.items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: Number(product.price),
          }
        }),
      },
    },
  })

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: validated.customerEmail,
    metadata: { orderId: order.id },
    line_items: validated.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: product.name,
            description: `SKU: ${product.sku}`,
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      }
    }),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/erfolg?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/abgebrochen`,
  })

  // Store Stripe session ID
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  })

  return { url: session.url, orderId: order.id }
}
