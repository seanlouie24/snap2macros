'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Session } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Navbar() {
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for login/logout changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Hide Navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') return null

  // Utility to apply active styles
  const linkClass = (path: string) =>
    `hover:text-blue-500 ${
      pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700'
    }`

  return (
    <nav className='sticky top-0 z-50 flex items-center justify-between bg-white px-6 py-4 shadow-md'>
      <Link href='/' className='text-xl font-bold text-blue-600'>
        Snap2Macros
      </Link>

      {/* Page links */}
      <div className='flex items-center gap-6'>
        <Link href='/dashboard' className={linkClass('/dashboard')}>
          Dashboard
        </Link>
        <Link href='/history' className={linkClass('/history')}>
          History
        </Link>
        <Link href='/macrocalc' className={linkClass('/macrocalc')}>
          MacroCalc
        </Link>
        <Link href='/meals' className={linkClass('/meals')}>
          Meals
        </Link>

        {session ? (
          <button
            onClick={handleLogout}
            className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
          >
            Logout
          </button>
        ) : (
          <Link
            href='/login'
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Logout
          </Link>
        )}
      </div>
    </nav>
  )
}
