'use client'

import { useState } from 'react'
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

export default function ManualPage() {
  const meta = useMetaPixel()
  const [logs, setLogs] = useState<{ time: string; message: string; type: string }[]>([])

  const addLog = (message: string, type = 'info') => {
    setLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev].slice(0, 15))
  }

  const trackPurchase = () => {
    meta.track('Purchase', {
      value: 99.99,
      currency: 'USD',
      content_ids: ['SKU_123'],
    })
    addLog('Purchase: $99.99', 'success')
  }

  const trackAddToCart = () => {
    meta.track('AddToCart', {
      value: 29.99,
      currency: 'USD',
      content_ids: ['SKU_456'],
    })
    addLog('AddToCart: $29.99', 'info')
  }

  const trackLead = () => {
    meta.track('Lead', {
      content_name: 'Newsletter Signup',
    })
    addLog('Lead: Newsletter', 'info')
  }

  const trackCustom = () => {
    meta.trackCustom('ButtonClicked', {
      button_id: 'custom_btn',
    })
    addLog('Custom: ButtonClicked', 'warning')
  }

  const trackWithEventID = () => {
    const eventId = `order-${Date.now()}`
    meta.track('Purchase', { value: 199.99, currency: 'USD' }, { eventID: eventId })
    addLog(`Purchase with eventID: ${eventId}`, 'success')
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manual Tracking</h1>
        <p className="text-gray-500 dark:text-gray-400">Test standard and custom events</p>
      </div>

      <nav className="flex flex-wrap gap-2 mb-8 p-2 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800 shadow-sm">
        <NavLink href="/">Dashboard</NavLink>
        <NavLink href="/manual">Manual Tracking</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </nav>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Standard Events</h3>
          <div className="space-y-3">
            <button onClick={trackPurchase} className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95">
              Purchase ($99)
            </button>
            <button onClick={trackAddToCart} className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95">
              AddToCart
            </button>
            <button onClick={trackLead} className="w-full px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95">
              Lead
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 text-lg">Custom Events</h3>
          <div className="space-y-3">
            <button onClick={trackCustom} className="w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95">
              Custom Event
            </button>
            <button onClick={trackWithEventID} className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm active:transform active:scale-95">
              With EventID
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="font-semibold mb-4 text-lg flex justify-between items-center">
            Event Log
            <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Recent</span>
          </h3>
          <div className="flex-1 min-h-[160px] overflow-y-auto text-xs font-mono bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border dark:border-gray-800">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 italic">
                No events triggered yet
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className={`pb-2 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 ${
                    log.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                    log.type === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    <span className="text-gray-400 mr-2">[{log.time}]</span>
                    {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 text-xs">
        Check browser console to see full Meta Pixel debug logs
      </p>
    </main>
  )
}
