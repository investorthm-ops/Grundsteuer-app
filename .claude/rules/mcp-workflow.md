# MCP-Workflow: Supabase & Vercel

Diese Regeln definieren, wie DB- und Deployment-Änderungen über die MCP-Verbindungen ausgeführt werden. Sie gelten für alle Sessions in diesem Projekt.

## Verbundene Projekte

### Supabase
- **Projektname:** `grundsteuer-monitor`
- **project_id / ref:** `axibmcmysefexwostzsj`
- **Region:** `eu-central-1`, Postgres 17
- Das zweite Supabase-Projekt `Claude-Code-Projekt-Workflow` (ref `ikqxrjqgaiydktatgpus`) gehört NICHT zu diesem Repo und wird ignoriert.

### Vercel
- **Projektname:** `grundsteuer-app`
- **project_id:** `prj_4xAYMMdDJgBgE5jBW6ZcUKBQsXrx`
- **team_id:** `team_aIuYsdRN0EpHWARiEZjgOt34` (`investorthm-ops-projects`)

## A. Datenbank-Änderungen

**Immer** über Migrationsdatei + `mcp__supabase__apply_migration`. Niemals Schema- oder Datenänderungen via `execute_sql`.

Ablauf:
1. Neue Datei `supabase/migrations/00XX_kurz-beschreibung.sql` anlegen (fortlaufende Nummer, bei Konflikt höchste vorhandene + 1).
2. SQL dem Nutzer zur Freigabe zeigen.
3. `mcp__supabase__apply_migration` mit `project_id = axibmcmysefexwostzsj` und identischem SQL aufrufen.
4. Verifikation mit `list_migrations` und/oder `list_tables`.
5. Migrationsdatei zusammen mit Feature-Code committen (Konvention: `feat(PROJ-X): ...`).

**Leitplanken (verpflichtend):**
- RLS-Policy-Änderungen und Auth-Flow-Änderungen brauchen **explizite** Freigabe pro Migration (siehe `.claude/rules/security.md`).
- Destruktive Statements (`DROP`, `TRUNCATE`, `ALTER ... DROP COLUMN`, `DELETE` ohne WHERE) immer vorher anzeigen und bestätigen lassen.
- `execute_sql` ausschließlich lesend (SELECT, EXPLAIN, Inspektion).
- Kleine, reviewbare Migrationen — keine 200-Zeilen-Pakete.
- Kein lokales Supabase: Migrationen laufen direkt gegen Produktion. Entsprechend vorsichtig formulieren (idempotent wo möglich, `IF NOT EXISTS`, etc.).

## B. Deployments

**Standardweg:** Feature-Branch → PR → Merge auf `main` → Vercel deployt automatisch.

Nach dem Merge:
- `list_deployments` (mit `teamId` und `projectId`) → neueste Deployment-ID holen.
- `get_deployment` → Status prüfen (BUILDING / READY / ERROR).
- Bei ERROR: `get_deployment_build_logs` lesen, Ursache benennen.
- Nach Go-Live: `get_runtime_logs` für die ersten Minuten beobachten, Fehler melden.

`deploy_to_vercel` (manueller Deploy) nur auf ausdrückliche Anweisung des Nutzers (z. B. Hotfix ohne PR).

## C. Vercel-Umgebungsvariablen

Secrets verwaltet der Nutzer im Vercel-Dashboard. Ich tippe niemals Secrets in Tool-Calls oder Dateien.

Wenn eine neue Env-Var nötig ist:
1. Im Chat melden: Name, Zweck, Scope (Production / Preview / Development), ob `NEXT_PUBLIC_`-Prefix nötig ist.
2. Nutzer legt sie im Vercel-Dashboard an (Project Settings → Environment Variables).
3. Ich aktualisiere parallel `.env.local.example` mit Dummy-Wert + Kurzkommentar (Pflicht aus `.claude/rules/security.md`).
4. Nach Bestätigung ggf. Redeploy via Git-Push triggern.

## Schnellreferenz: häufige MCP-Calls

| Zweck | Tool | Pflicht-Parameter |
|---|---|---|
| Migration anwenden | `mcp__supabase__apply_migration` | `project_id=axibmcmysefexwostzsj`, `name`, `query` |
| Migrationen auflisten | `mcp__supabase__list_migrations` | `project_id=axibmcmysefexwostzsj` |
| Tabellen ansehen | `mcp__supabase__list_tables` | `project_id=axibmcmysefexwostzsj` |
| Lese-SQL | `mcp__supabase__execute_sql` | `project_id=axibmcmysefexwostzsj`, `query` (nur SELECT/EXPLAIN) |
| Advisor-Check (Security/Perf) | `mcp__supabase__get_advisors` | `project_id=axibmcmysefexwostzsj`, `type` |
| Deployments listen | `mcp__vercel__list_deployments` | `teamId=team_aIuYsdRN0EpHWARiEZjgOt34`, `projectId=prj_4xAYMMdDJgBgE5jBW6ZcUKBQsXrx` |
| Build-Logs | `mcp__vercel__get_deployment_build_logs` | Deployment-ID |
| Runtime-Logs | `mcp__vercel__get_runtime_logs` | Deployment-ID |
