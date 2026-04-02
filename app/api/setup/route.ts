import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAIL = 'admin@nepa.de'
const ADMIN_PASSWORD = 'passwort'

/**
 * GET /api/setup
 *
 * One-time setup endpoint to create the test admin account.
 * Creates user in Supabase Auth + AdminUser in Prisma.
 * Safe to call multiple times (idempotent).
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'placeholder' || serviceRoleKey.startsWith('placeholder')) {
    return NextResponse.json(
      { error: 'Supabase ist noch nicht konfiguriert. Bitte NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY setzen.' },
      { status: 503 }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    // Check if admin already exists in Prisma
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { email: ADMIN_EMAIL },
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin-Account existiert bereits.',
        email: ADMIN_EMAIL,
        hint: 'Login unter /login',
      })
    }

    // Check if Supabase user exists
    const { data: userList } = await supabase.auth.admin.listUsers()
    const existingUser = userList?.users?.find((u) => u.email === ADMIN_EMAIL)

    let supabaseUserId: string

    if (existingUser) {
      supabaseUserId = existingUser.id
      // Reset password
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password: ADMIN_PASSWORD,
      })
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })

      if (error) {
        return NextResponse.json(
          { error: `Supabase User-Erstellung fehlgeschlagen: ${error.message}` },
          { status: 500 }
        )
      }

      supabaseUserId = data.user.id
    }

    // Create AdminUser in Prisma
    const adminUser = await prisma.adminUser.upsert({
      where: { supabaseId: supabaseUserId },
      update: { email: ADMIN_EMAIL, role: 'ADMIN' },
      create: {
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        supabaseId: supabaseUserId,
      },
    })

    return NextResponse.json({
      message: 'Admin-Account erstellt!',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      adminId: adminUser.id,
      hint: 'Login unter /login',
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Setup fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    )
  }
}
