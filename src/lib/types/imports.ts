export type ImportRunStatus =
  | 'uploaded'
  | 'validated'
  | 'partially_approved'
  | 'approved'
  | 'discarded'
  | 'failed'

export type ImportRowStatus =
  | 'valid'
  | 'warning'
  | 'error'
  | 'conflict'
  | 'approved'
  | 'skipped'

export type ImportRowAction = 'create' | 'update' | 'skip'

export interface ImportRun {
  id: string
  source_name: string
  source_url: string | null
  data_stand: string
  status: ImportRunStatus
  total_rows: number
  valid_rows: number
  warning_rows: number
  error_rows: number
  conflict_rows: number
  new_rows: number
  update_rows: number
  skipped_rows: number
  approved_rows: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ImportRow {
  id: string
  import_run_id: string
  row_number: number
  status: ImportRowStatus
  action: ImportRowAction
  municipality_id: string | null
  raw_data: Record<string, string>
  errors: string[]
  warnings: string[]
  existing_snapshot: Record<string, unknown> | null
  name: string | null
  bundesland: string | null
  kreis: string | null
  hebesatz_a: number | null
  hebesatz_b: number | null
  hebesatz_b_wohnen: number | null
  hebesatz_b_nichtwohnen: number | null
  hebesatz_gewerbe: number | null
  vorjahr_b: number | null
  datenstand: string | null
  quellenname: string | null
  quellen_url: string | null
  delta_b: number | null
  created_at: string
  updated_at: string
}

export interface ImportListResponse {
  data: ImportRun[]
}

export interface ImportDetailResponse {
  data: {
    run: ImportRun
    rows: ImportRow[]
  }
}
