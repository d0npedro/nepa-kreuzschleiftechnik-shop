import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nicht authentifiziert', status: 401 }
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { supabaseId: user.id }
  })

  if (!adminUser) {
    return { error: 'Keine Admin-Berechtigung', status: 403 }
  }

  return { user, adminUser }
}
