/**
 * Creates a test admin account in Supabase Auth + Prisma AdminUser table.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts
 *
 * Requires these env vars to be set:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   DATABASE_URL
 */

import { createClient } from "@supabase/supabase-js"
import { PrismaClient } from "@prisma/client"

const ADMIN_EMAIL = "admin@nepa.de"
const ADMIN_PASSWORD = "passwort"

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const prisma = new PrismaClient()

  try {
    // 1. Create Supabase Auth user (or get existing)
    console.log(`📧 Erstelle Supabase Auth User: ${ADMIN_EMAIL}`)

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find((u) => u.email === ADMIN_EMAIL)

    let supabaseUserId: string

    if (existing) {
      console.log(`   User existiert bereits: ${existing.id}`)
      supabaseUserId = existing.id

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existing.id,
        { password: ADMIN_PASSWORD }
      )
      if (updateError) {
        console.error("   ⚠ Passwort-Update fehlgeschlagen:", updateError.message)
      } else {
        console.log("   Passwort aktualisiert.")
      }
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })

      if (error) {
        console.error("❌ Supabase User-Erstellung fehlgeschlagen:", error.message)
        process.exit(1)
      }

      supabaseUserId = data.user.id
      console.log(`   Supabase User erstellt: ${supabaseUserId}`)
    }

    // 2. Create or update Prisma AdminUser
    console.log("🔐 Erstelle Prisma AdminUser ...")

    const adminUser = await prisma.adminUser.upsert({
      where: { supabaseId: supabaseUserId },
      update: { email: ADMIN_EMAIL, role: "ADMIN" },
      create: {
        email: ADMIN_EMAIL,
        role: "ADMIN",
        supabaseId: supabaseUserId,
      },
    })

    console.log(`   AdminUser erstellt/aktualisiert: ${adminUser.id}`)

    // 3. Summary
    console.log("\n✅ Admin-Account bereit!")
    console.log("   ┌─────────────────────────────────────┐")
    console.log(`   │ E-Mail:   ${ADMIN_EMAIL.padEnd(25)}│`)
    console.log(`   │ Passwort: ${ADMIN_PASSWORD.padEnd(25)}│`)
    console.log(`   │ Rolle:    ${"ADMIN".padEnd(25)}│`)
    console.log("   └─────────────────────────────────────┘")
    console.log(`\n   Login: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error("❌ Fehler:", e)
  process.exit(1)
})
