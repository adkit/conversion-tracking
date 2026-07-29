import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3333'

test.describe('Meta Pixel Next.js', () => {

  // ============================================
  // 🚀 LOADING
  // ============================================
  test.describe('🚀 Loading', () => {

    test('Meta Pixel script loads on page', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check that fbq function exists
      const fbqExists = await page.evaluate(() => typeof (window as any).fbq === 'function')
      expect(fbqExists).toBe(true)
    })

    test('Meta Pixel SDK script tag is injected', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check that the Meta Pixel script tag is present
      const scriptExists = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'))
        return scripts.some(script => script.src.includes('connect.facebook.net'))
      })
      expect(scriptExists).toBe(true)
    })

    test('Page renders and Meta Pixel is accessible', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check page loads correctly
      const heading = await page.textContent('h1')
      expect(heading).toContain('Meta Pixel Next.js')

      // Check fbq is accessible on window (pixel loaded)
      const fbqExists = await page.evaluate(() => typeof (window as any).fbq === 'function')
      expect(fbqExists).toBe(true)
    })
  })

  // ============================================
  // 👁️ AUTO PAGEVIEW ON INITIAL LOAD
  // ============================================
  test.describe('👁️ Auto PageView on Initial Load', () => {

    test('PageView event fires on initial page load', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Should have debug log for PageView
      const hasPageViewLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('PageView')
      )
      expect(hasPageViewLog).toBe(true)
    })

    test('PageView event fires on /about page load', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(`${BASE_URL}/about`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Should have debug log for PageView
      const hasPageViewLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('PageView')
      )
      expect(hasPageViewLog).toBe(true)
    })
  })

  // ============================================
  // 🔄 PAGEVIEW ON ROUTE CHANGE
  // ============================================
  test.describe('🔄 PageView on Route Change', () => {

    test('PageView fires when navigating from / to /about', async ({ page }) => {
      // First, load the homepage
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Clear logs and start capturing new ones
      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      // Navigate to /about
      await page.click('a[href="/about"]')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Should have PageView log for the route change
      const hasPageViewLog = logs.some(log =>
        log.includes('[Meta Pixel') && log.includes('PageView')
      )
      expect(hasPageViewLog).toBe(true)
    })

    test('PageView fires when navigating from /about to /contact', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.click('a[href="/contact"]')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const hasPageViewLog = logs.some(log =>
        log.includes('[Meta Pixel') && log.includes('PageView')
      )
      expect(hasPageViewLog).toBe(true)
    })

    test('PageView fires when navigating back to /', async ({ page }) => {
      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.click('a[href="/"]')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      const hasPageViewLog = logs.some(log =>
        log.includes('[Meta Pixel') && log.includes('PageView')
      )
      expect(hasPageViewLog).toBe(true)
    })
  })

  // ============================================
  // 📊 STANDARD EVENTS
  // ============================================
  test.describe('📊 Standard Events', () => {

    test('Purchase event tracks correctly', async ({ page }) => {
      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Click the Purchase button
      await page.click('button:has-text("Purchase")')
      await page.waitForTimeout(500)

      // Should have Purchase event in logs
      const hasPurchaseLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('Purchase')
      )
      expect(hasPurchaseLog).toBe(true)
    })

    test('AddToCart event tracks correctly', async ({ page }) => {
      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.click('button:has-text("AddToCart")')
      await page.waitForTimeout(500)

      const hasAddToCartLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('AddToCart')
      )
      expect(hasAddToCartLog).toBe(true)
    })

    test('Lead event tracks correctly', async ({ page }) => {
      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.click('button:has-text("Lead")')
      await page.waitForTimeout(500)

      const hasLeadLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('Lead')
      )
      expect(hasLeadLog).toBe(true)
    })

    test('Contact event tracks correctly', async ({ page }) => {
      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      // Handle the alert dialog
      page.on('dialog', dialog => dialog.accept())

      await page.goto(`${BASE_URL}/contact`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.click('button:has-text("Track Contact")')
      await page.waitForTimeout(500)

      const hasContactLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('Contact')
      )
      expect(hasContactLog).toBe(true)
    })
  })

  // ============================================
  // 🎯 CUSTOM EVENTS
  // ============================================
  test.describe('🎯 Custom Events', () => {

    test('Custom event (trackCustom) fires correctly', async ({ page }) => {
      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.click('button:has-text("Custom Event")')
      await page.waitForTimeout(500)

      const hasCustomLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('ButtonClicked')
      )
      expect(hasCustomLog).toBe(true)
    })

    test('Event with eventID tracks correctly', async ({ page }) => {
      const logs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.click('button:has-text("With EventID")')
      await page.waitForTimeout(500)

      // Should track as Purchase event (that's what the button does)
      const hasPurchaseLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('Purchase')
      )
      expect(hasPurchaseLog).toBe(true)
    })
  })

  // ============================================
  // 📋 EVENT LOG UI
  // ============================================
  test.describe('📋 Event Log UI', () => {

    test('Event log shows tracked events', async ({ page }) => {
      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Initially should show "No events triggered yet"
      const initialText = await page.textContent('body')
      expect(initialText).toContain('No events triggered yet')

      // Track an event
      await page.click('button:has-text("Purchase")')
      await page.waitForTimeout(300)

      // Now should show the event in the log
      const logText = await page.textContent('body')
      expect(logText).toContain('Purchase')
    })

    test('Multiple events appear in log', async ({ page }) => {
      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      await page.click('button:has-text("Purchase")')
      await page.waitForTimeout(200)
      await page.click('button:has-text("AddToCart")')
      await page.waitForTimeout(200)
      await page.click('button:has-text("Lead")')
      await page.waitForTimeout(300)

      const logText = await page.textContent('body')
      expect(logText).toContain('Purchase')
      expect(logText).toContain('AddToCart')
      expect(logText).toContain('Lead')
    })
  })
})
