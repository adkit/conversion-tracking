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

export default function Home() {
  const meta = useMetaPixel()

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meta Pixel Next.js</h1>
        <p className="text-gray-500 dark:text-gray-400">Playground & Testing Suite</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-4 mb-8 flex items-center justify-between shadow-sm">
        <span className="font-medium">Status</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
          meta.isLoaded()
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
        }`}>
          {meta.isLoaded() ? '✓ Pixel Loaded' : '✗ Not Loaded'}
        </span>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8 p-2 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 shadow-sm">
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/manual">Manual Tracking</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </nav>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Configuration</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b dark:border-gray-800">
              <dt className="text-gray-500 dark:text-gray-400">Pixel ID</dt>
              <dd className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                {process.env.NEXT_PUBLIC_META_PIXEL_ID || '1234567890'}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500 dark:text-gray-400">Auto PageView</dt>
              <dd className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <span>✓</span> Enabled
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500 dark:text-gray-400">Debug Mode</dt>
              <dd className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <span>✓</span> Enabled
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500 dark:text-gray-400">Localhost</dt>
              <dd className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <span>✓</span> Enabled
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Current Route</h3>
          <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
            You are currently on <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">/</code>
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300 shrink-0">
                👁️
              </div>
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-300 text-sm">PageView Tracked</h4>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  This event fired automatically when the page loaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 text-xs mt-12">
        Open your browser console (F12) to see detailed Meta Pixel logs
      </p>
    </main>
  )
}
