'use client'

import { useMetaPixel } from '@adkit/meta-pixel-next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </Link>
  )
}

export default function ContactPage() {
  const meta = useMetaPixel()

  const trackContact = () => {
    meta.track('Contact', { content_name: 'Contact Page' })
    alert('Contact event tracked! Check console.')
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Page</h1>
        <p className="text-gray-500 dark:text-gray-400">Test auto PageView tracking</p>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8 p-2 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 shadow-sm">
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/manual">Manual Tracking</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </nav>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 shrink-0 text-xl">
          ✓
        </div>
        <div>
          <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1 text-lg">PageView Auto-Tracked</h3>
          <p className="text-green-700 dark:text-green-400 text-sm leading-relaxed">
            When you navigated to this page, a <code className="bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded text-green-800 dark:text-green-200 font-semibold">PageView</code> event was automatically fired.
            Open your browser console to verify.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Track Contact Event</h3>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Click below</span>
        </div>
        <button
          onClick={trackContact}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95"
        >
          Track Contact Event
        </button>
      </div>
    </main>
  )
}
