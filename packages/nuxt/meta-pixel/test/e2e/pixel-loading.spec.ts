import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3333'

test.describe('Meta Pixel Loading', () => {
  test.describe('✅ Normal pages (script should load)', () => {
    test('Index page: script loads', async ({ page }) => {
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Check that fbq function exists
      const fbqExists = await page.evaluate(() => typeof window.fbq === 'function')
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
  })

  test.describe('❌ Blacklisted pages (script should NOT load)', () => {
    test('Blacklist via config: /excluded route', async ({ page }) => {
      await page.goto(`${BASE_URL}/excluded`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Check that fbq function does NOT exist
      const fbqExists = await page.evaluate(() => typeof window.fbq === 'function')
      expect(fbqExists).toBe(false)

      // Check that the Meta Pixel script tag is NOT present
      const scriptExists = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'))
        return scripts.some(script => script.src.includes('connect.facebook.net'))
      })
      expect(scriptExists).toBe(false)
    })

    test('Blacklist via page meta: /meta-excluded route', async ({ page }) => {
      await page.goto(`${BASE_URL}/meta-excluded`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Check that fbq function does NOT exist
      const fbqExists = await page.evaluate(() => typeof window.fbq === 'function')
      expect(fbqExists).toBe(false)

      // Check that the Meta Pixel script tag is NOT present
      const scriptExists = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'))
        return scripts.some(script => script.src.includes('connect.facebook.net'))
      })
      expect(scriptExists).toBe(false)
    })

    test('No PageView tracking on blacklisted pages', async ({ page }) => {
      const logs: string[] = []

      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      await page.goto(`${BASE_URL}/excluded`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Should NOT have any Meta Pixel logs
      const hasMetaPixelLog = logs.some(log => log.includes('[Meta Pixel]'))
      expect(hasMetaPixelLog).toBe(false)
    })
  })

  test.describe('🔄 Navigation between pages', () => {
    test('Script loads when going from blacklisted → normal page', async ({ page }) => {
      await page.goto(`${BASE_URL}/excluded`)
      await page.waitForLoadState('networkidle')

      // Verify Meta Pixel is NOT loaded on excluded page
      let fbqExists = await page.evaluate(() => typeof window.fbq === 'function')
      expect(fbqExists).toBe(false)

      // Navigate to allowed page
      await page.click('a[href="/"]')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Now Meta Pixel SHOULD be loaded
      fbqExists = await page.evaluate(() => typeof window.fbq === 'function')
      expect(fbqExists).toBe(true)
    })

    test('No tracking when going from normal → blacklisted page', async ({ page }) => {
      const logs: string[] = []

      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')

      // Verify Meta Pixel IS loaded on index page
      const fbqExists = await page.evaluate(() => typeof window.fbq === 'function')
      expect(fbqExists).toBe(true)

      // Start capturing logs AFTER initial load
      page.on('console', msg => {
        if (msg.type() === 'log') {
          logs.push(msg.text())
        }
      })

      // Navigate to excluded page
      await page.click('a[href="/excluded"]')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Should not have new PageView tracked for excluded route
      const hasNewPageView = logs.some(log =>
        log.includes('[Meta Pixel]') && log.includes('PageView')
      )
      expect(hasNewPageView).toBe(false)
    })
  })

  test.describe('📄 Manual mode page', () => {
    test('Manual page: script loads correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/manual`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Meta Pixel should be loaded
      const fbqExists = await page.evaluate(() => typeof window.fbq === 'function')
      expect(fbqExists).toBe(true)
    })
  })
})
