'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type AuditLogEntry = {
  id: string
  actor_user_id: string | null
  actor_email: string | null
  action: string
  entity_type: 'organization' | 'membership' | 'invitation'
  entity_id: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

type EntityFilter = 'all' | 'organization' | 'membership' | 'invitation'

const ACTION_LABELS: Record<string, string> = {
  'org.create': 'Organisation angelegt',
  'org.update': 'Organisation geändert',
  'org.delete': 'Organisation gelöscht',
  'membership.create': 'Mitglied zugeordnet',
  'membership.update': 'Mitgliedschaft geändert',
  'membership.delete': 'Mitglied entfernt',
  'invitation.create': 'Einladung verschickt',
}

const ENTITY_LABELS: Record<string, string> = {
  organization: 'Organisation',
  membership: 'Mitgliedschaft',
  invitation: 'Einladung',
}

function formatTimestamp(value: string): string {
  try {
    return new Date(value).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function AuditLogView() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadEntries() {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (entityFilter !== 'all') params.set('entity_type', entityFilter)
      const res = await fetch(`/api/admin/audit-log?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error(`Fehler beim Laden (${res.status})`)
      }
      const json = (await res.json()) as { data: AuditLogEntry[] }
      setEntries(json.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityFilter])

  const summary = useMemo(() => {
    if (entries.length === 0) return 'Keine Einträge.'
    return `${entries.length} Einträge`
  }, [entries.length])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
        <div className="space-y-1">
          <Label htmlFor="entity-filter">Entitätstyp</Label>
          <Select
            value={entityFilter}
            onValueChange={(value) => setEntityFilter(value as EntityFilter)}
          >
            <SelectTrigger id="entity-filter" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="organization">Organisation</SelectItem>
              <SelectItem value="membership">Mitgliedschaft</SelectItem>
              <SelectItem value="invitation">Einladung</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => void loadEntries()}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          {isLoading ? 'Lädt' : 'Neu laden'}
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">{summary}</span>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">Zeit</TableHead>
              <TableHead>Wer</TableHead>
              <TableHead>Aktion</TableHead>
              <TableHead>Entität</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && !isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Noch keine Einträge.
                </TableCell>
              </TableRow>
            ) : null}
            {entries.map((entry) => {
              const isOpen = expandedId === entry.id
              return (
                <Fragment key={entry.id}>
                  <TableRow>
                    <TableCell className="font-mono text-xs">
                      {formatTimestamp(entry.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.actor_email ?? entry.actor_user_id ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="secondary">
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}
                      {entry.entity_id ? (
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {entry.entity_id.slice(0, 8)}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isOpen ? null : entry.id)}
                      >
                        {isOpen ? 'Schließen' : 'Anzeigen'}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isOpen ? (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/40">
                        <pre className="overflow-auto whitespace-pre-wrap break-all text-xs">
                          {JSON.stringify(entry.payload, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
