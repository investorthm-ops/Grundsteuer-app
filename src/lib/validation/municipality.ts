import { z } from 'zod'

export const BUNDESLAENDER = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
] as const

export const QUELLENSTATUS = ['bestaetigt', 'offen'] as const

const hebesatz = z.number().int().min(0).max(2000)
const hebesatzOptional = hebesatz.nullable().optional()

export const municipalityCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  bundesland: z.enum(BUNDESLAENDER),
  kreis: z.string().trim().max(200).nullable().optional(),
  hebesatz_a: hebesatzOptional,
  hebesatz_b: hebesatz,
  hebesatz_gewerbe: hebesatzOptional,
  vorjahr_b: hebesatzOptional,
  datenstand: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'datenstand must be ISO date YYYY-MM-DD')
    .nullable()
    .optional(),
  quellenstatus: z.enum(QUELLENSTATUS).optional(),
})

export const municipalityUpdateSchema = municipalityCreateSchema.partial()

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  bundesland: z.enum(BUNDESLAENDER).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const exportQuerySchema = z.object({
  bundesland: z.enum(BUNDESLAENDER).optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export type MunicipalityCreateInput = z.infer<typeof municipalityCreateSchema>
export type MunicipalityUpdateInput = z.infer<typeof municipalityUpdateSchema>
export type ListQueryInput = z.infer<typeof listQuerySchema>
export type ExportQueryInput = z.infer<typeof exportQuerySchema>
