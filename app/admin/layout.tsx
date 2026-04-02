import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Cog,
  ShoppingBag,
  Warehouse,
  LogOut,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produkte', label: 'Produkte', icon: Package },
  { href: '/admin/kategorien', label: 'Kategorien', icon: FolderOpen },
  { href: '/admin/maschinen', label: 'Maschinen', icon: Cog },
  { href: '/admin/bestellungen', label: 'Bestellungen', icon: ShoppingBag },
  { href: '/admin/lager', label: 'Lager', icon: Warehouse },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { supabaseId: user.id },
  })

  if (!adminUser) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-nepa-light">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-nepa-dark text-white md:flex">
        {/* Logo / Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <span className="text-xl font-bold tracking-tight">
            NEPA<span className="text-nepa-green">.</span>
          </span>
          <span className="rounded bg-nepa-blue/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-2 truncate text-xs text-white/50">
            {user.email}
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile brand visible on small screens */}
            <span className="text-lg font-bold text-nepa-blue md:hidden">
              NEPA<span className="text-nepa-green">.</span>
            </span>
            <h1 className="text-sm font-semibold text-muted-foreground">
              Adminbereich
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {adminUser.email}
            </span>
            <span className="inline-flex items-center rounded-md bg-nepa-blue/10 px-2 py-1 text-xs font-medium text-nepa-blue">
              {adminUser.role}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
