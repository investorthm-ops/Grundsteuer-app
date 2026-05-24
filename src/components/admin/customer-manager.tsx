'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, RefreshCw, Save, Trash2, UserPlus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import { ORGANIZATION_ROLES, ORGANIZATION_STATUSES } from '@/lib/validation/organization'
import type {
  OrganizationListResponse,
  OrganizationRole,
  OrganizationStatus,
  OrganizationWithMembers,
} from '@/lib/types/organization'

type OrganizationForm = {
  id?: string
  name: string
  status: OrganizationStatus
  access_until: string
  notes: string
}

type MembershipForm = {
  organization_id: string
  user_id: string
  role: OrganizationRole
}

const emptyOrganizationForm: OrganizationForm = {
  name: '',
  status: 'trial',
  access_until: '',
  notes: '',
}

const emptyMembershipForm: MembershipForm = {
  organization_id: '',
  user_id: '',
  role: 'member',
}

const STATUS_LABELS: Record<OrganizationStatus, string> = {
  trial: 'Testphase',
  active: 'Aktiv',
  expired: 'Abgelaufen',
  blocked: 'Gesperrt',
}

function toOrganizationPayload(form: OrganizationForm) {
  return {
    name: form.name.trim(),
    status: form.status,
    access_until: form.access_until || null,
    notes: form.notes.trim() || null,
  }
}

function fromOrganization(item: OrganizationWithMembers): OrganizationForm {
  return {
    id: item.id,
    name: item.name,
    status: item.status,
    access_until: item.access_until ?? '',
    notes: item.notes ?? '',
  }
}

function statusVariant(status: OrganizationStatus) {
  if (status === 'active') return 'default' as const
  if (status === 'trial') return 'secondary' as const
  return 'destructive' as const
}

export function CustomerManager() {
  const organizationFormRef = useRef<HTMLFormElement | null>(null)
  const [items, setItems] = useState<OrganizationWithMembers[]>([])
  const [organizationForm, setOrganizationForm] = useState<OrganizationForm>(emptyOrganizationForm)
  const [membershipForm, setMembershipForm] = useState<MembershipForm>(emptyMembershipForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingOrganization, setIsSavingOrganization] = useState(false)
  const [isSavingMembership, setIsSavingMembership] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedOrganization = useMemo(
    () => items.find((item) => item.id === membershipForm.organization_id),
    [items, membershipForm.organization_id]
  )

  async function loadItems() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/organizations')
      if (!response.ok) throw new Error('Kunden konnten nicht geladen werden.')
      const payload = (await response.json()) as OrganizationListResponse
      setItems(payload.data)
      if (!membershipForm.organization_id && payload.data[0]) {
        setMembershipForm((current) => ({ ...current, organization_id: payload.data[0].id }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateOrganization<K extends keyof OrganizationForm>(key: K, value: OrganizationForm[K]) {
    setOrganizationForm((current) => ({ ...current, [key]: value }))
  }

  function updateMembership<K extends keyof MembershipForm>(key: K, value: MembershipForm[K]) {
    setMembershipForm((current) => ({ ...current, [key]: value }))
  }

  async function saveOrganization(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingOrganization(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch(
        organizationForm.id
          ? `/api/admin/organizations/${organizationForm.id}`
          : '/api/admin/organizations',
        {
          method: organizationForm.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toOrganizationPayload(organizationForm)),
        }
      )
      if (!response.ok) throw new Error('Kunde konnte nicht gespeichert werden.')
      setMessage(organizationForm.id ? 'Kunde aktualisiert.' : 'Kunde angelegt.')
      setOrganizationForm(emptyOrganizationForm)
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsSavingOrganization(false)
    }
  }

  async function saveMembership(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSavingMembership(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(membershipForm),
      })
      if (!response.ok) throw new Error('Nutzer konnte nicht zugeordnet werden.')
      setMessage('Nutzerzuordnung gespeichert.')
      setMembershipForm((current) => ({ ...emptyMembershipForm, organization_id: current.organization_id }))
      await loadItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler.')
    } finally {
      setIsSavingMembership(false)
    }
  }

  async function deleteMembership(id: string) {
    setMessage(null)
    setError(null)
    const response = await fetch(`/api/admin/memberships/${id}`, { method: 'DELETE' })
    if (!response.ok) {
      setError('Nutzerzuordnung konnte nicht entfernt werden.')
      return
    }
    setMessage('Nutzerzuordnung entfernt.')
    await loadItems()
  }

  async function deleteOrganization(item: OrganizationWithMembers) {
    setMessage(null)
    setError(null)
    const response = await fetch(`/api/admin/organizations/${item.id}`, { method: 'DELETE' })
    if (!response.ok) {
      setError(`Kunde "${item.name}" konnte nicht geloescht werden.`)
      return
    }
    if (organizationForm.id === item.id) {
      setOrganizationForm(emptyOrganizationForm)
    }
    if (membershipForm.organization_id === item.id) {
      setMembershipForm((current) => ({ ...current, organization_id: '' }))
    }
    const memberCount = item.memberships.length
    const memberHint = memberCount
      ? ` und ${memberCount} Nutzerzuordnung${memberCount === 1 ? '' : 'en'}`
      : ''
    setMessage(`Kunde "${item.name}"${memberHint} geloescht.`)
    await loadItems()
  }

  function editOrganization(item: OrganizationWithMembers) {
    setOrganizationForm(fromOrganization(item))
    setMessage(`Bearbeitungsmodus für ${item.name} geöffnet.`)
    setError(null)
    organizationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <form
          ref={organizationFormRef}
          onSubmit={saveOrganization}
          className="rounded-lg border bg-white p-5"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                {organizationForm.id ? 'Kunde bearbeiten' : 'Kunde anlegen'}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">Status und Laufzeit steuern den App-Zugang.</p>
              {organizationForm.id ? (
                <p className="mt-2 text-sm font-medium text-emerald-700">
                  Bearbeitungsmodus aktiv
                </p>
              ) : null}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setOrganizationForm(emptyOrganizationForm)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Neu
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Name</Label>
              <Input
                id="customer-name"
                value={organizationForm.name}
                onChange={(event) => updateOrganization('name', event.target.value)}
                placeholder="Steuerkanzlei Muster GmbH"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={organizationForm.status}
                  onValueChange={(value) => updateOrganization('status', value as OrganizationStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-until">Zugriff bis</Label>
                <Input
                  id="access-until"
                  type="date"
                  value={organizationForm.access_until}
                  onChange={(event) => updateOrganization('access_until', event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-notes">Notiz</Label>
              <Textarea
                id="customer-notes"
                value={organizationForm.notes}
                onChange={(event) => updateOrganization('notes', event.target.value)}
                placeholder="Pilotkunde, Rechnung, Ansprechpartner..."
              />
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full" disabled={isSavingOrganization}>
            <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            {isSavingOrganization
              ? 'Speichern läuft'
              : organizationForm.id
                ? 'Änderung speichern'
                : 'Kunde speichern'}
          </Button>
        </form>

        <form onSubmit={saveMembership} className="rounded-lg border bg-white p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Nutzer zuordnen</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Der Nutzer muss vorher in Supabase Auth existieren. Im MVP wird die Nutzer-ID eingetragen.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organisation</Label>
              <Select
                value={membershipForm.organization_id}
                onValueChange={(value) => updateMembership('organization_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-id">Supabase Nutzer-ID</Label>
              <Input
                id="user-id"
                value={membershipForm.user_id}
                onChange={(event) => updateMembership('user_id', event.target.value)}
                placeholder="UUID des bestehenden Nutzers"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rolle</Label>
              <Select
                value={membershipForm.role}
                onValueChange={(value) => updateMembership('role', value as OrganizationRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role === 'owner' ? 'Owner' : 'Member'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="mt-5 w-full" disabled={isSavingMembership || !membershipForm.organization_id}>
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            {isSavingMembership ? 'Zuordnung läuft' : 'Nutzer zuordnen'}
          </Button>
          {selectedOrganization ? (
            <p className="mt-3 text-sm text-zinc-500">
              Ausgewählt: {selectedOrganization.name}
            </p>
          ) : null}
        </form>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <section className="rounded-lg border bg-white">
        <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600">
            {isLoading ? 'Kunden werden geladen' : `${items.length} Kunden geladen`}
          </p>
          <Button variant="ghost" size="sm" onClick={loadItems}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Aktualisieren
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zugriff bis</TableHead>
                <TableHead>Nutzer</TableHead>
                <TableHead className="text-right">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    {item.notes ? <div className="max-w-md truncate text-xs text-zinc-500">{item.notes}</div> : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(item.status)}>{STATUS_LABELS[item.status]}</Badge>
                  </TableCell>
                  <TableCell>{item.access_until ?? 'unbegrenzt'}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {item.memberships.length ? (
                        item.memberships.map((membership) => (
                          <div key={membership.id} className="flex items-center gap-2 text-sm">
                            <span className="max-w-52 truncate font-mono text-xs">{membership.user_id}</span>
                            <Badge variant="secondary">{membership.role}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => deleteMembership(membership.id)}>
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-500">Noch keine Nutzer</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => editOrganization(item)}>
                        Bearbeiten
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Kunde ${item.name} loeschen`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kunde wirklich loeschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{item.name}&quot; wird dauerhaft entfernt.
                              {item.memberships.length > 0
                                ? ` ${item.memberships.length} zugeordnete${item.memberships.length === 1 ? 'r Nutzer verliert' : ' Nutzer verlieren'} damit den App-Zugang.`
                                : ' Es sind keine Nutzer zugeordnet.'}
                              {' '}Die Supabase-Login-Konten bleiben bestehen, aber ohne Organisation gibt es keinen Zugriff mehr auf die App. Dieser Schritt kann nicht rueckgaengig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteOrganization(item)}
                              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
                            >
                              Loeschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-zinc-500">
                    Noch keine Kundenorganisation angelegt.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
