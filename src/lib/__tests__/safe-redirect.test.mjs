import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('resolveSafeRedirectPath', () => {
  let resolveSafeRedirectPath

  it('loads module', async () => {
    const mod = await import('../routing/safe-redirect.ts')
    resolveSafeRedirectPath = mod.resolveSafeRedirectPath
    assert.ok(typeof resolveSafeRedirectPath === 'function')
  })

  it('allows relative app paths', () => {
    assert.equal(resolveSafeRedirectPath('/datenbank?q=Köln#top'), '/datenbank?q=K%C3%B6ln#top')
  })

  it('rejects absolute external URLs', () => {
    assert.equal(resolveSafeRedirectPath('https://example.com/phishing'), '/')
  })

  it('rejects protocol-relative URLs', () => {
    assert.equal(resolveSafeRedirectPath('//example.com/phishing'), '/')
  })

  it('rejects non-path values', () => {
    assert.equal(resolveSafeRedirectPath('javascript:alert(1)'), '/')
  })
})
