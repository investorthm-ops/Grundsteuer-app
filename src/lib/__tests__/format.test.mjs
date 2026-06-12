import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('reports/format', () => {
  let formatRate
  let formatDate
  let num
  let deltaB
  let DATA_NOTICE

  it('loads module', async () => {
    const mod = await import('../reports/format.ts')
    formatRate = mod.formatRate
    formatDate = mod.formatDate
    num = mod.num
    deltaB = mod.deltaB
    DATA_NOTICE = mod.DATA_NOTICE
    assert.equal(typeof formatRate, 'function')
  })

  it('formatRate renders numbers with percent sign', () => {
    assert.equal(formatRate(480), '480 %')
    assert.equal(formatRate(854.69), '854.69 %')
  })

  it('formatRate rounds float artifacts to two decimals', () => {
    assert.equal(formatRate(190.06000000000003), '190.06 %')
  })

  it('formatRate falls back to dash for null/undefined', () => {
    assert.equal(formatRate(null), '-')
    assert.equal(formatRate(undefined), '-')
  })

  it('formatDate renders de-DE short format', () => {
    assert.equal(formatDate('2026-01-01'), '1.1.2026')
  })

  it('formatDate uses default and custom fallback', () => {
    assert.equal(formatDate(null), '-')
    assert.equal(formatDate(null, 'noch offen'), 'noch offen')
    assert.equal(formatDate('', 'unbegrenzt'), 'unbegrenzt')
  })

  it('num renders German decimal comma without grouping', () => {
    assert.equal(num(854.69), '854,69')
    assert.equal(num(480), '480')
    assert.equal(num(1290), '1290')
  })

  it('num passes through non-numbers', () => {
    assert.equal(num(null), '')
    assert.equal(num(undefined), '')
    assert.equal(num('abc'), 'abc')
  })

  it('deltaB computes rounded difference to previous year', () => {
    assert.equal(deltaB({ hebesatz_b: 845, vorjahr_b: 855 }), -10)
    assert.equal(deltaB({ hebesatz_b: 190.16, vorjahr_b: 0.1 }), 190.06)
  })

  it('deltaB returns empty string without previous year', () => {
    assert.equal(deltaB({ hebesatz_b: 845, vorjahr_b: null }), '')
  })

  it('DATA_NOTICE mentions official sources', () => {
    assert.ok(DATA_NOTICE.includes('amtlichen Veröffentlichungen'))
  })
})

describe('reports/aggregate', () => {
  let average
  let extreme
  let valuesFor

  const items = [
    { hebesatz_b: 400, hebesatz_a: 200 },
    { hebesatz_b: 600, hebesatz_a: null },
    { hebesatz_b: 500, hebesatz_a: 300 },
  ]

  it('loads module', async () => {
    const mod = await import('../reports/aggregate.ts')
    average = mod.average
    extreme = mod.extreme
    valuesFor = mod.valuesFor
    assert.equal(typeof average, 'function')
  })

  it('valuesFor skips null values', () => {
    assert.deepEqual(valuesFor(items, 'hebesatz_a'), [200, 300])
  })

  it('average rounds to whole number', () => {
    assert.equal(average(items, 'hebesatz_b'), 500)
    assert.equal(average(items, 'hebesatz_a'), 250)
  })

  it('average returns null without values', () => {
    assert.equal(average([], 'hebesatz_b'), null)
    assert.equal(average([{ hebesatz_gewerbe: null }], 'hebesatz_gewerbe'), null)
  })

  it('extreme returns min and max', () => {
    assert.equal(extreme(items, 'hebesatz_b', 'min'), 400)
    assert.equal(extreme(items, 'hebesatz_b', 'max'), 600)
  })
})
