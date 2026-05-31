import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// Self-contained tests that don't need any imports
describe('project sanity checks', () => {

  it('node version is available', () => {
    const parts = process.version.slice(1).split('.').map(Number)
    assert.ok(parts[0] >= 18, 'Node >= 18 required')
  })

  it('can import zod', async () => {
    const zod = await import('zod')
    const schema = zod.z.object({ name: zod.z.string() })
    const result = schema.parse({ name: 'test' })
    assert.equal(result.name, 'test')
  })

  it('zod rejects invalid data', async () => {
    const zod = await import('zod')
    const schema = zod.z.object({ name: zod.z.string() })
    assert.throws(() => schema.parse({ name: 123 }))
  })

  it('BUNDESLAENDER has 16 entries', async () => {
    const { BUNDESLAENDER } = await import('../validation/municipality.ts')
    assert.equal(BUNDESLAENDER.length, 16)
    assert.ok(BUNDESLAENDER.includes('Berlin'))
    assert.ok(BUNDESLAENDER.includes('Bayern'))
  })

  it('municipalityCreateSchema accepts valid input', async () => {
    const { municipalityCreateSchema } = await import('../validation/municipality.ts')
    const result = municipalityCreateSchema.parse({
      name: 'Test',
      bundesland: 'Hessen',
      hebesatz_b: 500,
    })
    assert.equal(result.name, 'Test')
    assert.equal(result.hebesatz_b, 500)
  })

  it('municipalityCreateSchema rejects invalid bundesland', async () => {
    const { municipalityCreateSchema } = await import('../validation/municipality.ts')
    assert.throws(() =>
      municipalityCreateSchema.parse({ name: 'Test', bundesland: 'Invalid', hebesatz_b: 500 })
    )
  })

  it('municipalityCreateSchema rejects negative hebesatz', async () => {
    const { municipalityCreateSchema } = await import('../validation/municipality.ts')
    assert.throws(() =>
      municipalityCreateSchema.parse({ name: 'Test', bundesland: 'Hessen', hebesatz_b: -1 })
    )
  })

  it('municipalityCreateSchema accepts decimal hebesatz', async () => {
    const { municipalityCreateSchema } = await import('../validation/municipality.ts')
    const result = municipalityCreateSchema.parse({
      name: 'Test',
      bundesland: 'Hessen',
      hebesatz_b: 854.69,
    })
    assert.equal(result.hebesatz_b, 854.69)
  })

  it('municipalityCreateSchema accepts ISO date for datenstand', async () => {
    const { municipalityCreateSchema } = await import('../validation/municipality.ts')
    const result = municipalityCreateSchema.parse({
      name: 'Test',
      bundesland: 'Hessen',
      hebesatz_b: 500,
      datenstand: '2025-01-01',
    })
    assert.equal(result.datenstand, '2025-01-01')
  })

  it('municipalityCreateSchema rejects invalid date format', async () => {
    const { municipalityCreateSchema } = await import('../validation/municipality.ts')
    assert.throws(() =>
      municipalityCreateSchema.parse({ name: 'Test', bundesland: 'Hessen', hebesatz_b: 500, datenstand: '01.01.2025' })
    )
  })

  it('municipalityUpdateSchema accepts partial update', async () => {
    const { municipalityUpdateSchema } = await import('../validation/municipality.ts')
    const result = municipalityUpdateSchema.parse({ hebesatz_b: 600 })
    assert.equal(result.hebesatz_b, 600)
  })

  it('listQuerySchema applies defaults', async () => {
    const { listQuerySchema } = await import('../validation/municipality.ts')
    const result = listQuerySchema.parse({})
    assert.equal(result.page, 1)
    assert.equal(result.pageSize, 50)
  })

  it('listQuerySchema accepts search filter', async () => {
    const { listQuerySchema } = await import('../validation/municipality.ts')
    const result = listQuerySchema.parse({ q: 'Dortmund', bundesland: 'Nordrhein-Westfalen' })
    assert.equal(result.q, 'Dortmund')
    assert.equal(result.bundesland, 'Nordrhein-Westfalen')
  })

  it('listQuerySchema rejects pageSize above 100', async () => {
    const { listQuerySchema } = await import('../validation/municipality.ts')
    assert.throws(() => listQuerySchema.parse({ pageSize: 200 }))
  })

  it('exportQuerySchema accepts search filter', async () => {
    const { exportQuerySchema } = await import('../validation/municipality.ts')
    const result = exportQuerySchema.parse({ q: 'Dortmund' })
    assert.equal(result.q, 'Dortmund')
  })
})
