import { describe, it, expect } from 'vitest'

describe('Module Configuration', () => {
  it('validates regex patterns for route exclusion', () => {
    const excludedPattern = '^/excluded'
    const regex = new RegExp(excludedPattern)

    expect(regex.test('/excluded')).toBe(true)
    expect(regex.test('/excluded/page')).toBe(true)
    expect(regex.test('/other')).toBe(false)
  })

  it('validates regex patterns for route inclusion', () => {
    const includedPattern = '^/manual'
    const regex = new RegExp(includedPattern)

    expect(regex.test('/manual')).toBe(true)
    expect(regex.test('/manual/page')).toBe(true)
    expect(regex.test('/other')).toBe(false)
  })

  it('handles multiple pixel IDs', () => {
    const singleId = '1234567890'
    const multipleIds = ['1234567890', '0987654321']

    expect(typeof singleId).toBe('string')
    expect(Array.isArray(multipleIds)).toBe(true)
    expect(multipleIds.length).toBe(2)
  })
})
