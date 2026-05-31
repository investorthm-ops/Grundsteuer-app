import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseCsv } from '../imports/csv.ts'

describe('parseCsv', () => {
  it('parses semicolon CSV', () => {
    const csv = 'name;bundesland;grundsteuer_b;datenstand;quellenname\nMuster;NRW;500;2025-01-01;Test'
    const result = parseCsv(csv)
    assert.strictEqual(result.delimiter, ';')
    assert.strictEqual(result.rows.length, 1)
    assert.strictEqual(result.rows[0].name, 'Muster')
  })

  it('parses comma CSV', () => {
    const csv = 'name,bundesland,grundsteuer_b,datenstand,quellenname\nMuster,NRW,500,2025-01-01,Test'
    const result = parseCsv(csv)
    assert.strictEqual(result.delimiter, ',')
    assert.strictEqual(result.rows.length, 1)
  })

  it('removes BOM character', () => {
    const csv = '\uFEFFname;bundesland;grundsteuer_b;datenstand;quellenname\nMuster;NRW;500;2025-01-01;Test'
    const result = parseCsv(csv)
    assert.strictEqual(result.rows.length, 1)
  })

  it('handles quoted fields with comma inside', () => {
    const csv = 'name;bundesland;grundsteuer_b;datenstand;quellenname\n"Must,er";NRW;500;2025-01-01;Test'
    const result = parseCsv(csv)
    assert.strictEqual(result.rows[0].name, 'Must,er')
  })

  it('handles escaped quotes inside quoted fields', () => {
    const csv = 'name;bundesland;grundsteuer_b;datenstand;quellenname\n"Must""er";NRW;500;2025-01-01;Test'
    const result = parseCsv(csv)
    assert.strictEqual(result.rows[0].name, 'Must"er')
  })

  it('throws on missing required headers', () => {
    assert.throws(() => parseCsv('name;bundesland;col1\nA;B;1'), /Pflichtspalten/)
  })

  it('throws on empty content', () => {
    assert.throws(() => parseCsv(''))
  })

  it('throws on header-only CSV', () => {
    assert.throws(() => parseCsv('name;bundesland;grundsteuer_b;datenstand;quellenname'), /keine Datenzeilen/)
  })

  it('handles CRLF line endings', () => {
    const csv = 'name;bundesland;grundsteuer_b;datenstand;quellenname\r\nMuster;NRW;500;2025-01-01;Test\r\n'
    const result = parseCsv(csv)
    assert.strictEqual(result.rows.length, 1)
  })

  it('normalizes headers to lowercase', () => {
    const csv = 'Name;Bundesland;Grundsteuer_B;Datenstand;Quellenname\nMuster;NRW;500;2025-01-01;Test'
    const result = parseCsv(csv)
    assert.strictEqual(result.rows[0].name, 'Muster')
  })
})
