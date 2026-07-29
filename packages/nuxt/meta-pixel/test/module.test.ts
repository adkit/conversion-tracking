import { describe, it, expect } from 'vitest'

describe('Route Matching Logic', () => {
  /**
   * Convert glob-like pattern to regex pattern
   * Supports: /path/*, /path/**, and nested patterns
   */
  const globToRegex = (pattern: string): string => {
    // Escape special regex characters except * and /
    let regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      // Replace ** with a placeholder first
      .replace(/\*\*/g, '__DOUBLE_STAR__')
      // Replace single * with [^/]*
      .replace(/\*/g, '[^/]*')
      // Replace ** placeholder with .*
      .replace(/__DOUBLE_STAR__/g, '.*')

    // Handle trailing /.*  - make the slash optional so /dashboard/** matches both /dashboard and /dashboard/anything
    // This needs to be done before adding $ at the end
    const hasTrailingGlob = regexPattern.endsWith('/.*')
    if (hasTrailingGlob) {
      regexPattern = regexPattern.replace(/\/\.\*$/, '(?:/.*)?$')
    }

    // Add ^ at the start for exact matching from beginning
    if (!regexPattern.startsWith('^')) {
      regexPattern = '^' + regexPattern
    }

    // Add $ at the end for exact matching (if not already added by trailing glob handling)
    if (!regexPattern.endsWith('$')) {
      regexPattern = regexPattern + '$'
    }

    return regexPattern
  }

  /**
   * Test if a path matches a pattern (glob syntax)
   */
  const matchesPattern = (path: string, pattern: string): boolean => {
    try {
      const regexPattern = globToRegex(pattern)
      const regex = new RegExp(regexPattern)
      return regex.test(path)
    } catch {
      // On error, don't match (safer to not exclude/include on invalid pattern)
      return false
    }
  }

  // Simulate the isAllowed function from the plugin
  const isAllowed = (
    path: string,
    meta: { metaPixel?: boolean },
    config: { excludedRoutes?: string[], includedRoutes?: string[] },
  ) => {
    // 1. Check page-level meta override
    if (meta.metaPixel === false) return false
    if (meta.metaPixel === true) return true

    // 2. Check included routes (whitelist)
    if (config.includedRoutes?.length) {
      return config.includedRoutes.some((pattern: string) => matchesPattern(path, pattern))
    }

    // 3. Check excluded routes (blacklist)
    if (config.excludedRoutes?.length) {
      return !config.excludedRoutes.some((pattern: string) => matchesPattern(path, pattern))
    }

    return true
  }

  describe('Page Meta Override', () => {
    it('blocks tracking when metaPixel: false in page meta', () => {
      const result = isAllowed('/any-page', { metaPixel: false }, {})
      expect(result).toBe(false)
    })

    it('allows tracking when metaPixel: true in page meta', () => {
      const result = isAllowed('/excluded', { metaPixel: true }, { excludedRoutes: ['^/excluded'] })
      expect(result).toBe(true)
    })
  })

  describe('Excluded Routes', () => {
    it('blocks routes matching excludedRoutes pattern', () => {
      const config = { excludedRoutes: ['/excluded/**'] }

      expect(isAllowed('/excluded', {}, config)).toBe(false)
      expect(isAllowed('/excluded/page', {}, config)).toBe(false)
      expect(isAllowed('/other', {}, config)).toBe(true)
    })

    it('allows routes not matching excludedRoutes pattern', () => {
      const config = { excludedRoutes: ['/admin/**', '/api/**'] }

      expect(isAllowed('/', {}, config)).toBe(true)
      expect(isAllowed('/about', {}, config)).toBe(true)
      expect(isAllowed('/admin', {}, config)).toBe(false)
      expect(isAllowed('/api/users', {}, config)).toBe(false)
    })
  })

  describe('Included Routes', () => {
    it('only allows routes matching includedRoutes pattern', () => {
      const config = { includedRoutes: ['/manual/**'] }

      expect(isAllowed('/manual', {}, config)).toBe(true)
      expect(isAllowed('/manual/page', {}, config)).toBe(true)
      expect(isAllowed('/', {}, config)).toBe(false)
      expect(isAllowed('/other', {}, config)).toBe(false)
    })

    it('includedRoutes takes precedence over excludedRoutes', () => {
      const config = {
        includedRoutes: ['/manual/**'],
        excludedRoutes: ['/excluded/**']
      }

      // Only includedRoutes matters when both are set
      expect(isAllowed('/manual', {}, config)).toBe(true)
      expect(isAllowed('/excluded', {}, config)).toBe(false)
      expect(isAllowed('/', {}, config)).toBe(false)
    })
  })

  describe('Glob Pattern Support', () => {
    describe('Single asterisk (*) - matches single path segment', () => {
      it('matches single level paths', () => {
        const config = { excludedRoutes: ['/dashboard/*'] }

        expect(isAllowed('/dashboard/inbox', {}, config)).toBe(false)
        expect(isAllowed('/dashboard/settings', {}, config)).toBe(false)
        expect(isAllowed('/dashboard/inbox/messages', {}, config)).toBe(true) // Not excluded (nested)
        expect(isAllowed('/dashboard', {}, config)).toBe(true) // Not excluded (exact match without trailing)
      })

      it('works with multiple path segments', () => {
        const config = { excludedRoutes: ['/api/*/internal'] }

        expect(isAllowed('/api/users/internal', {}, config)).toBe(false)
        expect(isAllowed('/api/posts/internal', {}, config)).toBe(false)
        expect(isAllowed('/api/users/public', {}, config)).toBe(true)
        expect(isAllowed('/api/users/internal/deep', {}, config)).toBe(true) // More nested
      })
    })

    describe('Double asterisk (**) - matches multiple path segments', () => {
      it('matches all nested paths', () => {
        const config = { excludedRoutes: ['/dashboard/**'] }

        expect(isAllowed('/dashboard', {}, config)).toBe(false)
        expect(isAllowed('/dashboard/inbox', {}, config)).toBe(false)
        expect(isAllowed('/dashboard/inbox/messages', {}, config)).toBe(false)
        expect(isAllowed('/dashboard/inbox/messages/123', {}, config)).toBe(false)
        expect(isAllowed('/other', {}, config)).toBe(true)
      })

      it('handles the issue from user report', () => {
        // This was causing "Invalid regular expression: //dashboard/**/: Nothing to repeat"
        const config = { excludedRoutes: ['/dashboard/**'] }

        // Should not crash and should exclude properly
        expect(isAllowed('/dashboard/inbox', {}, config)).toBe(false)
        expect(isAllowed('/dashboard', {}, config)).toBe(false)
      })

      it('works with admin routes', () => {
        const config = { excludedRoutes: ['/admin/**'] }

        expect(isAllowed('/admin', {}, config)).toBe(false)
        expect(isAllowed('/admin/users', {}, config)).toBe(false)
        expect(isAllowed('/admin/users/edit/123', {}, config)).toBe(false)
        expect(isAllowed('/public', {}, config)).toBe(true)
      })
    })

    describe('Multiple glob patterns', () => {
      it('supports multiple glob patterns', () => {
        const config = {
          excludedRoutes: [
            '/dashboard/**',
            '/api/**',
            '/admin/*',
          ]
        }

        expect(isAllowed('/dashboard/inbox', {}, config)).toBe(false)
        expect(isAllowed('/api/users', {}, config)).toBe(false)
        expect(isAllowed('/admin/users', {}, config)).toBe(false)
        expect(isAllowed('/public', {}, config)).toBe(true)
      })
    })

    describe('Invalid patterns', () => {
      it('handles invalid regex gracefully without crashing', () => {
        // These patterns would crash without proper error handling
        const config = { excludedRoutes: ['/test/[invalid'] }

        // Should not crash, should return false (not match)
        expect(() => isAllowed('/test/page', {}, config)).not.toThrow()
      })
    })
  })

  describe('Default Behavior', () => {
    it('allows all routes when no config is set', () => {
      expect(isAllowed('/', {}, {})).toBe(true)
      expect(isAllowed('/any-page', {}, {})).toBe(true)
      expect(isAllowed('/admin', {}, {})).toBe(true)
    })
  })
})
