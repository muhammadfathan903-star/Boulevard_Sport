import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, nama')
    .eq('id', user.id)
    .single()

  const profile = profileData as unknown as { role: string; nama: string } | null

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen">
      <AdminNav adminName={profile.nama} />
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
