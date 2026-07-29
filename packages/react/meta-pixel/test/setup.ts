import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()

  // Clean up global window.fbq
  if (typeof window !== 'undefined') {
    delete (window as any).fbq
    delete (window as any)._fbq

    // Remove any Meta Pixel scripts
    const scripts = document.querySelectorAll('script')
    scripts.forEach(script => {
      if (script.innerHTML.includes('fbq') || script.src.includes('fbevents')) {
        script.remove()
      }
    })
  }
})
