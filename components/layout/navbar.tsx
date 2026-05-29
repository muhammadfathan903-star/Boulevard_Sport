import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'
import { NavbarClient } from './navbar-client'

async function getSessionData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { profile: null, cartCount: 0 }

  const [profileResult, cartResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  return {
    profile: profileResult.data as Profile | null,
    cartCount: cartResult.count || 0,
  }
}

export async function Navbar() {
  const { profile, cartCount } = await getSessionData()
  return <NavbarClient initialProfile={profile} cartCount={cartCount} />
}
