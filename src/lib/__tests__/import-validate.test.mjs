import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const FALLBACK_SOURCE = 'Testquelle'
const FALLBACK_URL = 'https://example.com'
const FALLBACK_DATE = '2025-01-01'

describe('validateImportRows', () => {
  let validateImportRows
  let existingOne

  it('loads module', async () => {
    const mod = await import('../imports/validate.ts')
    validateImportRows = mod.validateImportRows
    assert.ok(typeof validateImportRows === 'function')
  })

  it('marks a valid new row as create', () => {
    const rows = [{ name: 'Neue Stadt', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Quelle' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].status, 'valid')
    assert.equal(result[0].action, 'create')
    assert.equal(result[0].errors.length, 0)
  })

  it('marks a valid update row as update', () => {
    existingOne = [{
      id: '1', name: 'Bestehende Stadt', bundesland: 'Nordrhein-Westfalen', kreis: null,
      hebesatz_a: 300, hebesatz_b: 500, hebesatz_gewerbe: 400, vorjahr_b: 480,
      datenstand: '2024-01-01', quellenstatus: 'bestaetigt',
    }]
    const rows = [{ name: 'Bestehende Stadt', bundesland: 'Nordrhein-Westfalen', grundsteuer_b: '550', datenstand: '2025-06-01', quellenname: 'Aktuelle Quelle' }]
    const result = validateImportRows(rows, existingOne, FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].action, 'update')
    assert.equal(result[0].municipality_id, '1')
    assert.equal(result[0].status, 'conflict')
  })

  it('flags missing name as error', () => {
    const rows = [{ name: '', bundesland: 'Nordrhein-Westfalen', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].status, 'error')
    assert.ok(result[0].errors.some(e => e.includes('Gemeindename')))
  })

  it('flags invalid bundesland as error', () => {
    const rows = [{ name: 'X', bundesland: 'Invalid', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].status, 'error')
  })

  it('parses German decimal comma (854,69)', () => {
    const rows = [{ name: 'Neue Stadt', bundesland: 'Hessen', grundsteuer_b: '854,69', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].hebesatz_b, 854.69)
  })

  it('parses percentage suffix', () => {
    const rows = [{ name: 'Neue Stadt', bundesland: 'Hessen', grundsteuer_b: '500 %', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].hebesatz_b, 500)
  })

  it('detects duplicate rows in CSV', () => {
    const rows = [
      { name: 'Stadt', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Q' },
      { name: 'Stadt', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Q' },
    ]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].errors.some(e => e.includes('Doppelte')), true)
    assert.equal(result[1].errors.some(e => e.includes('Doppelte')), true)
  })

  it('warns on older datenstand than existing', () => {
    const rows = [{ name: 'Bestehende Stadt', bundesland: 'Nordrhein-Westfalen', grundsteuer_b: '500', datenstand: '2023-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, existingOne, FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].warnings.some(w => w.includes('älter')), true)
  })

  it('warns on delta >= 100 points', () => {
    const rows = [{ name: 'Bestehende Stadt', bundesland: 'Nordrhein-Westfalen', grundsteuer_b: '700', vorjahr_b: '500', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, existingOne, FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].warnings.some(w => w.includes('Auffällig')), true)
    assert.equal(result[0].delta_b, 200)
  })

  it('normalizes date formats (year only, ISO, German)', () => {
    const r1 = validateImportRows(
      [{ name: 'A', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '2024', quellenname: 'Q' }],
      [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE
    )
    assert.equal(r1[0].datenstand, '2024-01-01')

    const r2 = validateImportRows(
      [{ name: 'A', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '31.12.2024', quellenname: 'Q' }],
      [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE
    )
    assert.equal(r2[0].datenstand, '2024-12-31')
  })

  it('marks conflict when rates differ from existing', () => {
    const rows = [{ name: 'Bestehende Stadt', bundesland: 'Nordrhein-Westfalen', grundsteuer_b: '999', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, existingOne, FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].status, 'conflict')
  })

  it('rejects rate > 2000', () => {
    const rows = [{ name: 'Neue Stadt', bundesland: 'Hessen', grundsteuer_b: '2500', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].status, 'error')
  })

  it('rejects invalid quellen_url values', () => {
    const rows = [{ name: 'Neue Stadt', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Q', quellen_url: 'javascript:alert(1)' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].status, 'error')
    assert.ok(result[0].errors.some(e => e.includes('Quellen-URL')))
  })

  it('handles optional rates as null', () => {
    const rows = [{ name: 'Neue Stadt', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Q' }]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].hebesatz_a, null)
    assert.equal(result[0].hebesatz_gewerbe, null)
  })

  it('sets row_number starting at 2', () => {
    const rows = [
      { name: 'A', bundesland: 'Hessen', grundsteuer_b: '500', datenstand: '2025-01-01', quellenname: 'Q' },
      { name: 'B', bundesland: 'Hessen', grundsteuer_b: '600', datenstand: '2025-01-01', quellenname: 'Q' },
    ]
    const result = validateImportRows(rows, [], FALLBACK_SOURCE, FALLBACK_URL, FALLBACK_DATE)
    assert.equal(result[0].row_number, 2)
    assert.equal(result[1].row_number, 3)
  })
})
