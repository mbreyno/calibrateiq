import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from './DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch or create advisor profile
  let { data: advisor } = await supabase
    .from('advisors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!advisor) {
    // Auto-create advisor profile from signup metadata
    const meta = user.user_metadata
    const { data: newAdvisor } = await supabase
      .from('advisors')
      .insert({
        user_id: user.id,
        firm_name: meta?.firm_name ?? '',
      })
      .select()
      .single()
    advisor = newAdvisor
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      <DashboardNav advisor={advisor} />
      <main className="flex-1 lg:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
