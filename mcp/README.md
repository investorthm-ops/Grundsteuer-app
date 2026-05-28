# grundsteuer_import_mcp

MCP-Server für den **GrundsteuerMonitor** - automatisierter Import kommunaler
Hebesätze aus öffentlichen deutschen Statistikquellen direkt in Supabase.

---

## Was dieser MCP-Server macht

| Tool | Zweck | Auth nötig? |
|------|-------|-------------|
| `grundsteuer_check_sources` | Prüft Credentials + Erreichbarkeit der Quellen | Nein |
| `grundsteuer_fetch_hebesaetze` | Ruft Hebesätze aus der Regionalstatistik-GENESIS-API ab | GENESIS-Login |
| `grundsteuer_fetch_xlsx` | Lädt jährliches XLSX vom Statistikportal | Nein |
| `grundsteuer_search_gemeinde` | Sucht AGS zu einer Gemeinde | GENESIS-Login |
| `grundsteuer_import_to_supabase` | Schreibt Daten in Supabase | Supabase-Key |

---

## Voraussetzungen

```bash
pip install "mcp[cli]" httpx pydantic openpyxl
```

Python 3.11 oder neuer empfohlen.

---

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|----------|---------|--------------|
| `GENESIS_USERNAME` | Für GENESIS-Tools | Nutzername bei [Regionalstatistik](https://www.regionalstatistik.de) |
| `GENESIS_PASSWORD` | Für GENESIS-Tools | Passwort bei Regionalstatistik |
| `SUPABASE_URL` | Für Supabase-Import | Projekt-URL (z. B. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Für Supabase-Import | Service-Role-Key (nicht Anon-Key!) |

**GENESIS-Registrierung:** kostenlos unter https://www.regionalstatistik.de
Hinweis: Seit Mai 2025 ist eine Registrierung für den Webservice verpflichtend.

---

## In Claude Desktop / Cowork einrichten

In `claude_desktop_config.json` (Windows: `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "grundsteuer-import": {
      "command": "python",
      "args": ["C:/Users/User/Documents/Claude/GrundsteuerMonitor/mcp/grundsteuer_import_mcp.py"],
      "env": {
        "GENESIS_USERNAME": "dein-benutzername",
        "GENESIS_PASSWORD": "dein-passwort",
        "SUPABASE_URL": "https://axibmcmysefexwostzsj.supabase.co",
        "SUPABASE_SERVICE_KEY": "dein-service-key"
      }
    }
  }
}
```

Danach Claude Desktop neu starten.

---

## Typischer Workflow

### 1. Quellen prüfen

```
grundsteuer_check_sources
```

-> Zeigt welche Credentials gesetzt sind und ob die APIs erreichbar sind.

### 2. Daten abrufen (GENESIS-API)

```
grundsteuer_fetch_hebesaetze
  bundesland: "Bayern"
  jahr: 2024
  response_format: "json"
```

-> Gibt JSON-Liste mit Hebesätzen zurück.

### 3. Dry-Run vor dem Import

```
grundsteuer_import_to_supabase
  gemeinden_json: [... JSON aus Schritt 2 ...]
  dry_run: true
```

-> Prüft die Daten ohne zu schreiben.

### 4. Echter Import

```
grundsteuer_import_to_supabase
  gemeinden_json: [... JSON aus Schritt 2 ...]
  upsert: true
```

-> Schreibt in Supabase-Tabelle `hebesaetze`.

### Ohne GENESIS-Credentials (Schnellstart)

```
grundsteuer_fetch_xlsx
  bundesland: "Hessen"
```

-> Lädt das Destatis-XLSX direkt - keine Registrierung nötig.

---

## Datenquellen

- **Regionalstatistik GENESIS-Online** - Tabelle `71231-01-03-5` (Realsteuervergleich, regionale Tiefe Gemeinden)
  Lizenz: Datenlizenz Deutschland - Namensnennung - Version 2.0
- **Statistikportal.de** - Jährliche XLSX-Veröffentlichung der Hebesätze  
  Herausgeber: Statistische Ämter des Bundes und der Länder

---

## Supabase-Tabellenstruktur

Der Import-Tool erwartet eine Tabelle `hebesaetze` mit folgenden Feldern:

```sql
CREATE TABLE hebesaetze (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ags         TEXT NOT NULL,
  name        TEXT NOT NULL,
  bundesland  TEXT,
  grundsteuer_a INTEGER,
  grundsteuer_b INTEGER,
  gewerbesteuer INTEGER,
  jahr        INTEGER NOT NULL,
  quelle      TEXT,
  datenstand  TEXT,
  UNIQUE (ags, jahr)
);
```

Falls die Tabelle anders heißt oder andere Felder hat, muss das Mapping
in `grundsteuer_import_to_supabase` angepasst werden.


