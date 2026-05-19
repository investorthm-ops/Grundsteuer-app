export type Quellenstatus = 'bestaetigt' | 'offen'

export interface Municipality {
  id: string
  name: string
  bundesland: string
  kreis: string | null
  hebesatz_a: number | null
  hebesatz_b: number
  hebesatz_gewerbe: number | null
  vorjahr_b: number | null
  datenstand: string | null
  quellenstatus: Quellenstatus
  source_import_run_id: string | null
  quellenname: string | null
  quellen_url: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface MunicipalityListResponse {
  data: Municipality[]
  total: number
  page: number
  pageSize: number
}
