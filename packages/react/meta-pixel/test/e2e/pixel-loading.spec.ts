import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174'

test.describe('Meta Pixel Loading', () => {
  test.describe('✅ Normal pages (script should load)', () => {
    test('Index page: script loads', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check that fbq function exists
      const fbqExists = await page.evaluate(() => typeof (window as any).fbq === 'function')
      expect(fbqExists).toBe(true)

      // Check that the Meta Pixel script tag is present
      const scriptExists = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'))
        return scripts.some(script => script.src.includes('connect.facebook.net'))
      })
      expect(scriptExists).toBe(true)
    })

    test('Index page: tracks PageView event', async ({ page }) => {
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

    test('Index page: shows Pixel Loaded status', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Check that status shows "Pixel Loaded"
      const statusText = await page.textContent('.badge')
      expect(statusText).toContain('Pixel Loaded')
    })
  })

  test.describe('📄 Manual Tracking', () => {
    test('Manual page: can track Purchase event', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Navigate to Manual tab
      await page.click('text=Manual Tracking')
      await page.waitForTimeout(500)

      // Click Purchase button
      await page.click('text=Track Purchase ($99)')
      await page.waitForTimeout(500)

      // Should have logged Purchase event
      const hasPurchaseLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('Purchase')
      )
      expect(hasPurchaseLog).toBe(true)
    })

    test('Manual page: can track AddToCart event', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Navigate to Manual tab
      await page.click('text=Manual Tracking')
      await page.waitForTimeout(500)

      // Click AddToCart button
      await page.click('text=Track AddToCart')
      await page.waitForTimeout(500)

      // Should have logged AddToCart event
      const hasAddToCartLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('AddToCart')
      )
      expect(hasAddToCartLog).toBe(true)
    })

    test('Manual page: can track Custom event', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Navigate to Manual tab
      await page.click('text=Manual Tracking')
      await page.waitForTimeout(500)

      // Click Custom Event button
      await page.click('text=Track Custom Event')
      await page.waitForTimeout(500)

      // Should have logged custom event
      const hasCustomLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('ButtonClicked')
      )
      expect(hasCustomLog).toBe(true)
    })
  })

  test.describe('📊 Standard Events', () => {
    test('Events page: can track ViewContent event', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Navigate to All Events tab
      await page.click('text=All Events')
      await page.waitForTimeout(500)

      // Click View Content button
      await page.click('text=View Content')
      await page.waitForTimeout(500)

      // Should have logged ViewContent event
      const hasViewContentLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('ViewContent')
      )
      expect(hasViewContentLog).toBe(true)
    })

    test('Events page: tracks multiple events correctly', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Navigate to All Events tab
      await page.click('text=All Events')
      await page.waitForTimeout(500)

      // Track multiple events
      await page.click('text=Search')
      await page.waitForTimeout(300)
      await page.click('text=Lead')
      await page.waitForTimeout(300)

      // Should have both events logged
      const hasSearchLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('Search')
      )
      const hasLeadLog = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('Lead')
      )

      expect(hasSearchLog).toBe(true)
      expect(hasLeadLog).toBe(true)
    })
  })
})
