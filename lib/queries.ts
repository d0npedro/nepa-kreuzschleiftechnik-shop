import { prisma } from '@/lib/prisma'
import { unstable_cache as cache } from 'next/cache'

export const getCategories = cache(
  async () => {
    return prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
  },
  ['categories'],
  { revalidate: 60 }
)

export const getCategoryBySlug = cache(
  async (slug: string) => {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          include: { category: true, compatibleMachines: { include: { machine: true } } },
          orderBy: { name: 'asc' },
        },
      },
    })
  },
  ['category'],
  { revalidate: 60 }
)

export const getProducts = cache(
  async (options?: { categorySlug?: string; limit?: number }) => {
    return prisma.product.findMany({
      where: options?.categorySlug ? { category: { slug: options.categorySlug } } : undefined,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
    })
  },
  ['products'],
  { revalidate: 30 }
)

export const getProductBySlug = cache(
  async (slug: string) => {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        compatibleMachines: { include: { machine: true } },
      },
    })
  },
  ['product'],
  { revalidate: 30 }
)

export const getManufacturers = cache(
  async () => {
    const machines = await prisma.machine.findMany({
      select: { manufacturer: true },
      distinct: ['manufacturer'],
      orderBy: { manufacturer: 'asc' },
    })
    return machines.map((m) => m.manufacturer)
  },
  ['manufacturers'],
  { revalidate: 120 }
)

export const getMachinesByManufacturer = cache(
  async (manufacturer: string) => {
    return prisma.machine.findMany({
      where: { manufacturer },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })
  },
  ['machines-by-manufacturer'],
  { revalidate: 120 }
)

export const getProductsByMachine = cache(
  async (machineSlug: string) => {
    const machine = await prisma.machine.findUnique({
      where: { slug: machineSlug },
      include: {
        products: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    })
    return machine
  },
  ['products-by-machine'],
  { revalidate: 30 }
)

export const getMachines = cache(
  async () => {
    return prisma.machine.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ manufacturer: 'asc' }, { name: 'asc' }],
    })
  },
  ['machines'],
  { revalidate: 120 }
)

export const searchProducts = cache(
  async (query: string) => {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      take: 20,
    })
  },
  ['search'],
  { revalidate: 10 }
)

export const getOrdersByCustomer = async (customerId: string) => {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      items: { include: { product: { select: { name: true, sku: true, slug: true, images: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export const getFeaturedProducts = cache(
  async () => {
    return prisma.product.findMany({
      where: { stock: { gt: 0 } },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
  },
  ['featured-products'],
  { revalidate: 60 }
)
