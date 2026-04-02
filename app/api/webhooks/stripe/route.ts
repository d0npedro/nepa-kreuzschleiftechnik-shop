import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { reduceStockForOrder } from '@/actions/inventory'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (!orderId) {
        console.error('No orderId in session metadata')
        break
      }

      // Idempotency: check if order is already paid
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })

      if (!order) {
        console.error('Order not found:', orderId)
        break
      }

      if (order.status === 'PAID') {
        // Already processed
        break
      }

      // Reduce stock atomically
      try {
        await reduceStockForOrder(
          order.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          orderId
        )
      } catch (err) {
        console.error('Stock reduction failed for order:', orderId, err)
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'STOCK_ERROR' },
        })
        break
      }

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          customerEmail: session.customer_details?.email || order.customerEmail,
        },
      })

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'EXPIRED' },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
