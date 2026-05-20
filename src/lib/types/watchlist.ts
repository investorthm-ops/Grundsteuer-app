import type { Municipality } from './municipality'

export interface WatchlistItem {
  id: string
  municipality_id: string
  created_at: string
  municipality: Municipality
}

export interface WatchlistListResponse {
  data: WatchlistItem[]
}
