import { z } from 'zod'

export const watchlistCreateSchema = z.object({
  municipalityId: z.string().uuid(),
})

export const watchlistParamsSchema = z.object({
  municipalityId: z.string().uuid(),
})

export type WatchlistCreateInput = z.infer<typeof watchlistCreateSchema>
