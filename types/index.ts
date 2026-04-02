import type { Product, Category, Machine, Order, OrderItem, InventoryLog, ProductMachine } from '@prisma/client'

export type ProductWithRelations = Product & {
  category: Category
  compatibleMachines: (ProductMachine & { machine: Machine })[]
  images: string[]
}

export type ProductCard = Pick<Product, 'id' | 'name' | 'slug' | 'sku' | 'price' | 'stock' | 'isUsed' | 'isB2BOnly'> & {
  category: Pick<Category, 'name' | 'slug'>
  images: string[]
}

export type MachineWithProducts = Machine & {
  products: (ProductMachine & { product: ProductCard })[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Pick<Product, 'name' | 'sku' | 'slug' | 'images'> })[]
}

export type CartItem = {
  productId: string
  name: string
  slug: string
  sku: string
  price: number
  quantity: number
  stock: number
  image: string | null
}

export type InventoryLogEntry = InventoryLog & {
  product: Pick<Product, 'name' | 'sku'>
}

export type ManufacturerOption = {
  manufacturer: string
  count: number
}

export type MachineOption = {
  id: string
  name: string
  slug: string
}
