'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { applyBrandColors } from '@/lib/colorUtils'
import type { Advisor } from '@/types'

function LogoMark({ accentColor }: { accentColor: string }) {
  return (
    <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.15)" />
      <path d="M8 28 L16 18 L22 23 L30 13" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="13" r="3" fill={accentColor}/>
      <path d="M8 32 L32 32" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/clients',
    label: 'Surveys',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Firm Settings',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
      </svg>
    ),
  },
]

export default function DashboardNav({ advisor }: { advisor: Advisor | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const brandColor = advisor?.brand_color ?? '#1b4332'
  const brandAccent = advisor?.brand_accent ?? '#d4a017'
  const brandSurface = advisor?.brand_surface ?? '#fefae0'
  const brandText = advisor?.brand_text ?? advisor?.brand_color ?? '#1b4332'

  // Apply full palette CSS variables so Tailwind classes reflect brand colors
  useEffect(() => {
    applyBrandColors(brandColor, brandAccent, brandSurface, brandText)
  }, [brandColor, brandAccent, brandSurface, brandText])

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-7 pb-5 flex flex-col items-center text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        {advisor?.logo_url ? (
          <Image src={advisor.logo_url} alt="Firm logo" width={64} height={64} className="rounded-xl object-contain bg-white p-1 mb-3" style={{ width: 64, height: 64 }} />
        ) : (
          <div className="mb-3">
            <LogoMark accentColor={brandAccent} />
          </div>
        )}
        <div className="text-sm font-bold text-white leading-snug">
          {advisor?.firm_name || 'CalibrateIQ'}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Advisor Portal</div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.65)',
                backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Help + Sign out */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <a
          href="mailto:support@calibrateiq.app?subject=Help%20with%20CalibrateIQ"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          Help
        </a>
        <button
          onClick={handleSignout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
          </svg>
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="no-print hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col z-30"
        style={{ backgroundColor: 'var(--brand-color)' }}
      >
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="no-print lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ backgroundColor: 'var(--brand-color)', borderBottom: '1px solid rgba(255,255,255,0.15)' }}
      >
        <div className="flex items-center gap-2">
          <LogoMark accentColor={brandAccent} />
          <span className="text-sm font-bold text-white">{advisor?.firm_name || 'CalibrateIQ'}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 pt-14">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-14 left-0 w-60 bottom-0" style={{ backgroundColor: 'var(--brand-color)' }}>
            <NavContent />
          </div>
        </div>
      )}
    </>
  )
}
