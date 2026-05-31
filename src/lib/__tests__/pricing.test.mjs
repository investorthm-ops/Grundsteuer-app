import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('pricing', () => {
  let pricingPlans
  let formatEuro
  let PRICING_CTA_MODE

  it('loads module', async () => {
    const mod = await import('../pricing.ts')
    pricingPlans = mod.pricingPlans
    formatEuro = mod.formatEuro
    PRICING_CTA_MODE = mod.PRICING_CTA_MODE
    assert.ok(Array.isArray(pricingPlans))
  })

  it('has exactly two plans', () => {
    assert.equal(pricingPlans.length, 2)
  })

  it('solo plan has correct key and price', () => {
    const solo = pricingPlans.find(p => p.key === 'solo')
    assert.ok(solo)
    assert.equal(solo.monthlyPrice, 49)
    assert.equal(solo.yearlyPrice, 490)
    assert.equal(solo.recommended, false)
  })

  it('kanzlei plan has correct key and price', () => {
    const kanzlei = pricingPlans.find(p => p.key === 'kanzlei')
    assert.ok(kanzlei)
    assert.equal(kanzlei.monthlyPrice, 129)
    assert.equal(kanzlei.yearlyPrice, 1290)
    assert.equal(kanzlei.recommended, true)
  })

  it('plans have unique keys', () => {
    const keys = pricingPlans.map(p => p.key)
    assert.equal(new Set(keys).size, keys.length)
  })

  it('yearlyMonthlyEffective matches yearlyPrice / 12 rounded', () => {
    for (const plan of pricingPlans) {
      const expected = Math.round(plan.yearlyPrice / 12)
      assert.equal(plan.yearlyMonthlyEffective, expected)
    }
  })

  it('every plan has non-empty features', () => {
    for (const plan of pricingPlans) {
      assert.ok(plan.features.length > 0)
    }
  })

  it('kanzlei includes "Alles aus Solo" in features', () => {
    const kanzlei = pricingPlans.find(p => p.key === 'kanzlei')
    assert.ok(kanzlei.features.some(f => f.includes('Alles aus Solo')))
  })

  it('has contact cta mode', () => {
    assert.equal(PRICING_CTA_MODE, 'contact')
  })

  it('formatEuro formats numbers correctly', () => {
    assert.equal(formatEuro(49), '49 €')
    assert.equal(formatEuro(1290), '1.290 €')
    assert.equal(formatEuro(10000), '10.000 €')
  })
})
