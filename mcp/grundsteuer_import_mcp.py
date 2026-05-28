#!/usr/bin/env python3
"""
grundsteuer_import_mcp - MCP Server für den GrundsteuerMonitor

Automatisierter Daten-Import kommunaler Hebesätze aus öffentlichen deutschen
Statistikquellen (Destatis GENESIS-API, Statistikportal XLSX-Downloads) mit
optionalem direktem Schreiben in die Supabase-Datenbank des GrundsteuerMonitors.

Quellen:
  - Destatis GENESIS-Online REST-API (www-genesis.destatis.de)
  - Regionalstatistik.de GENESIS-API (www.regionalstatistik.de)
  - Statistikportal XLSX-Direktdownload

Verwendung (stdio, für Claude Desktop / Cowork):
  python grundsteuer_import_mcp.py

Umgebungsvariablen:
  GENESIS_USERNAME        Destatis GENESIS-Online Nutzername (kostenlose Registrierung)
  GENESIS_PASSWORD        Destatis GENESIS-Online Passwort
  SUPABASE_URL            Supabase Projekt-URL (optional, für Direktimport)
  SUPABASE_SERVICE_KEY    Supabase Service-Role-Key (optional, für Direktimport)
"""

from __future__ import annotations

import io
import json
import logging
import os
import zipfile
from enum import Enum
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, field_validator

# ---------------------------------------------------------------------------
# Logging (stderr, damit stdout für MCP-Protokoll frei bleibt)
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("grundsteuer_import_mcp")

# ---------------------------------------------------------------------------
# Konstanten
# ---------------------------------------------------------------------------
GENESIS_BASE = "https://www-genesis.destatis.de/api/rest/2020"
REGIONAL_BASE = "https://www.regionalstatistik.de/genesisws/rest/2020"

# Aktive API: Hebesätze liegen auf regionalstatistik.de (kommunale Ebene).
# Account ist getrennt vom Destatis-GENESIS — der Nutzer registriert sich auf
# regionalstatistik.de, daher zeigen alle Aufrufe standardmäßig dorthin.
API_BASE = REGIONAL_BASE

# Tabelle 71231-01-03-5 = Realsteuervergleich, regionale Tiefe Gemeinden
HEBESAETZE_TABLE = "71231-01-03-5"

# Direktdownload XLSX vom Statistikportal (jährliche Veröffentlichung)
STATISTIKPORTAL_XLSX = (
    "https://www.destatis.de/DE/Themen/Staat/Steuern/Steuereinnahmen/"
    "Publikationen/Downloads-Realsteuern/hebesaetze-realsteuern-8148001227005.xlsx"
    "?__blob=publicationFile"
)

GENESIS_USERNAME = os.environ.get("GENESIS_USERNAME", "")
GENESIS_PASSWORD = os.environ.get("GENESIS_PASSWORD", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# ---------------------------------------------------------------------------
# MCP-Server initialisieren
# ---------------------------------------------------------------------------
mcp = FastMCP(
    "grundsteuer_import_mcp",
    instructions=(
        "MCP-Server für den GrundsteuerMonitor. "
        "Importiert kommunale Hebesätze aus öffentlichen deutschen Statistikquellen "
        "und schreibt sie optional direkt in die Supabase-Datenbank. "
        "Beginne mit grundsteuer_check_sources, um verfügbare Quellen zu prüfen, "
        "dann grundsteuer_fetch_hebesaetze für den eigentlichen Datenabruf."
    ),
)


# ---------------------------------------------------------------------------
# Enums & Shared Models
# ---------------------------------------------------------------------------
class ResponseFormat(str, Enum):
    MARKDOWN = "markdown"
    JSON = "json"


class Bundesland(str, Enum):
    BW = "Baden-Württemberg"
    BY = "Bayern"
    BE = "Berlin"
    BB = "Brandenburg"
    HB = "Bremen"
    HH = "Hamburg"
    HE = "Hessen"
    MV = "Mecklenburg-Vorpommern"
    NI = "Niedersachsen"
    NW = "Nordrhein-Westfalen"
    RP = "Rheinland-Pfalz"
    SL = "Saarland"
    SN = "Sachsen"
    ST = "Sachsen-Anhalt"
    SH = "Schleswig-Holstein"
    TH = "Thüringen"


# Mapping Bundesland -> NUTS2-Schlüssel für die GENESIS-API
BUNDESLAND_KEY = {
    "Baden-Württemberg": "08",
    "Bayern": "09",
    "Berlin": "11",
    "Brandenburg": "12",
    "Bremen": "04",
    "Hamburg": "02",
    "Hessen": "06",
    "Mecklenburg-Vorpommern": "13",
    "Niedersachsen": "03",
    "Nordrhein-Westfalen": "05",
    "Rheinland-Pfalz": "07",
    "Saarland": "10",
    "Sachsen": "14",
    "Sachsen-Anhalt": "15",
    "Schleswig-Holstein": "01",
    "Thüringen": "16",
}


# ---------------------------------------------------------------------------
# Shared HTTP-Utilities
# ---------------------------------------------------------------------------
def _genesis_auth_params() -> dict[str, str]:
    """Basis-Auth-Parameter für GENESIS-API-Aufrufe."""
    return {
        "username": GENESIS_USERNAME,
        "password": GENESIS_PASSWORD,
        "language": "de",
    }


def _genesis_auth_headers() -> dict[str, str]:
    """Regionalstatistik erwartet die Zugangsdaten als HTTP-Header."""
    return {
        "username": GENESIS_USERNAME,
        "password": GENESIS_PASSWORD,
    }


def _handle_http_error(e: Exception) -> str:
    """Einheitliche, sprechende Fehlermeldungen."""
    if isinstance(e, httpx.HTTPStatusError):
        sc = e.response.status_code
        if sc == 401:
            return (
                "Fehler: Authentifizierung fehlgeschlagen. "
                "Bitte GENESIS_USERNAME und GENESIS_PASSWORD als Umgebungsvariablen setzen. "
                "Kostenlose Registrierung: https://www.regionalstatistik.de"
            )
        if sc == 403:
            return "Fehler: Zugriff verweigert. Prüfe deine GENESIS-Zugangsdaten."
        if sc == 404:
            return "Fehler: Ressource nicht gefunden. Prüfe Tabellenname und Parameter."
        if sc == 429:
            return "Fehler: Rate-Limit erreicht. Bitte kurz warten und erneut versuchen."
        return f"Fehler: HTTP {sc} - {e.response.text[:300]}"
    if isinstance(e, httpx.TimeoutException):
        return "Fehler: Zeitüberschreitung beim Abruf. Bitte erneut versuchen."
    return f"Unerwarteter Fehler: {type(e).__name__}: {e}"


async def _get(url: str, params: dict | None = None, timeout: float = 30.0) -> dict:
    """Einfacher async GET mit JSON-Antwort (folgt Redirects)."""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(url, params=params, timeout=timeout)
        resp.raise_for_status()
        return resp.json()


async def _post_json(url: str, data: dict | None = None, timeout: float = 30.0) -> dict:
    """POST mit Header-Login fuer Regionalstatistik-JSON-Endpunkte."""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.post(
            url,
            headers=_genesis_auth_headers(),
            data=data or {},
            timeout=timeout,
        )
        resp.raise_for_status()
        return resp.json()


async def _post_bytes(url: str, data: dict | None = None, timeout: float = 60.0) -> tuple[bytes, str]:
    """POST mit Header-Login fuer Regionalstatistik-Dateiantworten."""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.post(
            url,
            headers=_genesis_auth_headers(),
            data=data or {},
            timeout=timeout,
        )
        resp.raise_for_status()
        return resp.content, resp.headers.get("content-type", "")


async def _get_bytes(url: str, timeout: float = 60.0) -> bytes:
    """Async GET für Binärdaten (z. B. XLSX)."""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(url, timeout=timeout)
        resp.raise_for_status()
        return resp.content


# ---------------------------------------------------------------------------
# Tool 1: Quellenverfügbarkeit prüfen
# ---------------------------------------------------------------------------
class CheckSourcesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Ausgabeformat: 'markdown' (lesbar) oder 'json' (maschinenlesbar)",
    )


@mcp.tool(
    name="grundsteuer_check_sources",
    annotations={
        "title": "Datenquellen prüfen",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def grundsteuer_check_sources(params: CheckSourcesInput) -> str:
    """Prüft, welche Datenquellen und Credentials verfügbar sind.

    Gibt einen Überblick über:
    - GENESIS-API-Konfiguration (Username vorhanden?)
    - Supabase-Konfiguration (URL + Key vorhanden?)
    - Erreichbarkeit der öffentlichen Destatis-Endpunkte

    Args:
        params (CheckSourcesInput): response_format

    Returns:
        str: Status-Übersicht aller Quellen und Credentials

    Beispiele:
        - Vor dem ersten Import prüfen: grundsteuer_check_sources aufrufen
        - Nach Env-Variablen setzen: Konfigurationsstatus validieren
    """
    results: dict[str, Any] = {}

    # Credentials
    results["genesis_username_set"] = bool(GENESIS_USERNAME)
    results["genesis_password_set"] = bool(GENESIS_PASSWORD)
    results["supabase_url_set"] = bool(SUPABASE_URL)
    results["supabase_key_set"] = bool(SUPABASE_SERVICE_KEY)

    # Erreichbarkeit GENESIS (öffentlicher Whoami-Endpunkt)
    try:
        data = await _get(
            f"{API_BASE}/helloworld/whoami",
            params={"language": "de"},
            timeout=10.0,
        )
        results["genesis_api_reachable"] = True
        results["genesis_whoami"] = data.get("Status", {}).get("Content") or data.get("User-Agent", "OK")
    except Exception as e:
        results["genesis_api_reachable"] = False
        results["genesis_error"] = str(e)[:200]

    # Erreichbarkeit Statistikportal XLSX (HEAD-Request)
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.head(STATISTIKPORTAL_XLSX, timeout=10.0)
        results["statistikportal_xlsx_reachable"] = resp.status_code < 400
        results["statistikportal_content_type"] = resp.headers.get("content-type", "")
    except Exception as e:
        results["statistikportal_xlsx_reachable"] = False
        results["statistikportal_error"] = str(e)[:200]

    if params.response_format == ResponseFormat.JSON:
        return json.dumps(results, indent=2, ensure_ascii=False)

    # Markdown-Ausgabe
    lines = ["# GrundsteuerMonitor - Quellenstatus\n"]

    def status_icon(ok: bool) -> str:
        return "OK" if ok else "FEHLT"

    lines.append("## Credentials")
    lines.append(
        f"- {status_icon(results['genesis_username_set'])} "
        f"GENESIS_USERNAME: {'gesetzt' if results['genesis_username_set'] else 'FEHLT - kostenlos registrieren auf www.regionalstatistik.de'}"
    )
    lines.append(
        f"- {status_icon(results['genesis_password_set'])} "
        f"GENESIS_PASSWORD: {'gesetzt' if results['genesis_password_set'] else 'FEHLT'}"
    )
    lines.append(
        f"- {status_icon(results['supabase_url_set'])} "
        f"SUPABASE_URL: {'gesetzt' if results['supabase_url_set'] else 'optional - ohne kein Direktimport'}"
    )
    lines.append(
        f"- {status_icon(results['supabase_key_set'])} "
        f"SUPABASE_SERVICE_KEY: {'gesetzt' if results['supabase_key_set'] else 'optional'}"
    )
    lines.append("")
    lines.append("## Externe Endpunkte")
    lines.append(
        f"- {status_icon(results.get('genesis_api_reachable', False))} "
        f"Regionalstatistik GENESIS-API: {results.get('genesis_whoami', results.get('genesis_error', '-'))}"
    )
    lines.append(
        f"- {status_icon(results.get('statistikportal_xlsx_reachable', False))} "
        f"Statistikportal XLSX-Download: {results.get('statistikportal_content_type', results.get('statistikportal_error', '-'))}"
    )
    lines.append("")
    if not results["genesis_username_set"]:
        lines.append(
            "> **Nächster Schritt:** Kostenlose Registrierung unter "
            "https://www.regionalstatistik.de, dann `GENESIS_USERNAME` und "
            "`GENESIS_PASSWORD` als Umgebungsvariablen setzen."
        )
    else:
        lines.append(
            "> **Nächster Schritt:** `grundsteuer_fetch_hebesaetze` aufrufen "
            "um Daten für ein Bundesland abzurufen."
        )

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tool 2: Hebesätze abrufen (GENESIS-API)
# ---------------------------------------------------------------------------
class FetchHebesaetzeInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)

    bundesland: Optional[str] = Field(
        default=None,
        description=(
            "Bundesland-Name (z. B. 'Bayern', 'Nordrhein-Westfalen'). "
            "Ohne Angabe werden alle Bundesländer abgerufen (langsam!)."
        ),
    )
    jahr: int = Field(
        default=2024,
        description="Berichtsjahr (z. B. 2024). GENESIS hat meist ein Jahr Verzug.",
        ge=2010,
        le=2030,
    )
    limit: int = Field(
        default=50,
        description="Max. Anzahl zurückgegebener Gemeinden pro Aufruf (1-500)",
        ge=1,
        le=500,
    )
    offset: int = Field(
        default=0,
        description="Offset für Paginierung",
        ge=0,
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="Ausgabeformat: 'markdown' oder 'json'",
    )

    @field_validator("bundesland")
    @classmethod
    def validate_bundesland(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v not in BUNDESLAND_KEY:
            options = ", ".join(sorted(BUNDESLAND_KEY.keys()))
            raise ValueError(
                f"Unbekanntes Bundesland '{v}'. Gültige Werte: {options}"
            )
        return v


@mcp.tool(
    name="grundsteuer_fetch_hebesaetze",
    annotations={
        "title": "Hebesätze aus GENESIS abrufen",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def grundsteuer_fetch_hebesaetze(params: FetchHebesaetzeInput) -> str:
    """Ruft kommunale Hebesätze (Grundsteuer A, B + Gewerbesteuer) aus der
    Regionalstatistik-GENESIS-REST-API ab (Tabelle 71231-01-03-5).

    Erfordert GENESIS_USERNAME und GENESIS_PASSWORD als Umgebungsvariablen.
    Kostenlose Registrierung: https://www.regionalstatistik.de

    Args:
        params (FetchHebesaetzeInput):
            - bundesland (Optional[str]): Filtert auf ein Bundesland
            - jahr (int): Berichtsjahr (Standard: 2024)
            - limit (int): Max. Ergebnisse (1-500, Standard: 50)
            - offset (int): Paginierungsoffset (Standard: 0)
            - response_format: 'markdown' oder 'json'

    Returns:
        str: Liste der Gemeinden mit Hebesätzen oder Fehlermeldung.

        JSON-Schema bei response_format='json':
        {
            "total": int,
            "count": int,
            "offset": int,
            "has_more": bool,
            "next_offset": int | null,
            "jahr": int,
            "bundesland": str | null,
            "gemeinden": [
                {
                    "ags": str,           # Amtlicher Gemeindeschlüssel
                    "name": str,          # Gemeindename
                    "bundesland": str,
                    "grundsteuer_a": int | null,
                    "grundsteuer_b": int | null,
                    "gewerbesteuer": int | null,
                    "jahr": int
                }
            ]
        }

    Beispiele:
        - Alle Bayern-Gemeinden 2024: bundesland='Bayern', jahr=2024
        - Mit Paginierung: offset=50, limit=50
        - Nach Supabase-Import-Tool weiterreichen: response_format='json'
    """
    if not GENESIS_USERNAME or not GENESIS_PASSWORD:
        return (
            "Fehler: GENESIS_USERNAME und GENESIS_PASSWORD sind nicht gesetzt.\n"
            "Bitte zuerst `grundsteuer_check_sources` ausführen und die Zugangsdaten "
            "als Umgebungsvariablen eintragen.\n"
            "Kostenlose Registrierung: https://www.regionalstatistik.de"
        )

    try:
        # Regionalstatistik-API: Tabellendaten abrufen
        api_params = {
            "name": HEBESAETZE_TABLE,
            "area": "all",
            "compress": "false",
            "transpose": "false",
            "startyear": str(params.jahr),
            "endyear": str(params.jahr),
            "regionalvariable": "GEMEIN",
            "regionalkey": (
                BUNDESLAND_KEY[params.bundesland] + "*"
                if params.bundesland
                else "*"
            ),
            "language": "de",
        }

        content, content_type = await _post_bytes(
            f"{API_BASE}/data/tablefile",
            data=api_params,
            timeout=120.0,
        )

        raw_content = _extract_tablefile_content(content, content_type)
        gemeinden = _parse_genesis_csv(raw_content, params.jahr)

        # Paginierung
        total = len(gemeinden)
        sliced = gemeinden[params.offset : params.offset + params.limit]
        has_more = total > params.offset + len(sliced)
        next_offset = params.offset + len(sliced) if has_more else None

        result = {
            "total": total,
            "count": len(sliced),
            "offset": params.offset,
            "has_more": has_more,
            "next_offset": next_offset,
            "jahr": params.jahr,
            "bundesland": params.bundesland,
            "gemeinden": sliced,
        }

        if params.response_format == ResponseFormat.JSON:
            return json.dumps(result, indent=2, ensure_ascii=False)

        return _format_hebesaetze_markdown(result)

    except Exception as e:
        return _handle_http_error(e)


def _extract_tablefile_content(content: bytes, content_type: str) -> str:
    """Entpackt Regionalstatistik-Tablefile-Antworten als CSV-Text."""
    if "application/zip" in content_type:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            csv_names = [name for name in archive.namelist() if name.lower().endswith(".csv")]
            if not csv_names:
                return ""
            raw = archive.read(csv_names[0])
            return _decode_csv_bytes(raw)

    text = _decode_csv_bytes(content)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return text

    obj = data.get("Object")
    if isinstance(obj, dict):
        return obj.get("Content", "")
    return ""


def _decode_csv_bytes(raw: bytes) -> str:
    """Dekodiert GENESIS-CSV-Dateien robust."""
    for encoding in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return raw.decode(encoding)
        except UnicodeDecodeError:
            continue
    return raw.decode("latin-1", errors="replace")


def _parse_genesis_csv(content: str, jahr: int) -> list[dict]:
    """Parst das Regionalstatistik-CSV in eine Liste von Gemeinde-Dicts."""
    gemeinden: list[dict] = []
    if not content:
        return gemeinden

    for line in content.splitlines():
        parts = [p.strip('"') for p in line.split(";")]
        if len(parts) < 12:
            continue
        if parts[0].strip() != str(jahr):
            continue
        ags = parts[1].strip()
        if not ags or not ags.isdigit() or len(ags) != 8:
            continue

        def _int_or_none(val: str) -> Optional[int]:
            val = val.strip().replace(".", "").replace(",", "")
            try:
                return int(val)
            except ValueError:
                return None

        gemeinden.append(
            {
                "ags": ags,
                "name": parts[2].strip(),
                "bundesland": _bundesland_from_ags(ags),
                "grundsteuer_a": _int_or_none(parts[9]),
                "grundsteuer_b": _int_or_none(parts[10]),
                "gewerbesteuer": _int_or_none(parts[11]),
                "jahr": jahr,
            }
        )
    return gemeinden


def _bundesland_from_ags(ags: str) -> str:
    for bundesland, prefix in BUNDESLAND_KEY.items():
        if ags.startswith(prefix):
            return bundesland
    return ""


def _format_hebesaetze_markdown(result: dict) -> str:
    """Markdown-Ausgabe für Hebesatz-Ergebnisse."""
    lines = [
        f"# Hebesätze {result['jahr']}"
        + (f" - {result['bundesland']}" if result["bundesland"] else " - Deutschland"),
        "",
        f"**{result['total']} Gemeinden gefunden** | Zeige {result['count']} "
        f"(Offset {result['offset']})",
        "",
        "| AGS | Gemeinde | GrSt A | GrSt B | GewSt |",
        "|-----|----------|-------:|-------:|------:|",
    ]
    for g in result["gemeinden"]:
        lines.append(
            f"| {g['ags']} | {g['name']} "
            f"| {g['grundsteuer_a'] or '-'} "
            f"| {g['grundsteuer_b'] or '-'} "
            f"| {g['gewerbesteuer'] or '-'} |"
        )
    lines.append("")
    if result["has_more"]:
        lines.append(
            f"> Weitere Gemeinden verfügbar. Nächsten Aufruf mit `offset={result['next_offset']}` starten."
        )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tool 3: Statistikportal XLSX herunterladen und parsen
# ---------------------------------------------------------------------------
class FetchXlsxInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    bundesland: Optional[str] = Field(
        default=None,
        description="Filtert das XLSX auf ein Bundesland (z. B. 'Bayern'). Ohne Angabe: alle.",
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="'markdown' oder 'json'",
    )

    @field_validator("bundesland")
    @classmethod
    def validate_bundesland(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if v not in BUNDESLAND_KEY:
            options = ", ".join(sorted(BUNDESLAND_KEY.keys()))
            raise ValueError(f"Unbekanntes Bundesland '{v}'. Gültige Werte: {options}")
        return v


@mcp.tool(
    name="grundsteuer_fetch_xlsx",
    annotations={
        "title": "Statistikportal XLSX herunterladen",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    },
)
async def grundsteuer_fetch_xlsx(params: FetchXlsxInput) -> str:
    """Lädt das jährliche Hebesatz-XLSX direkt vom Statistischen Bundesamt (Destatis)
    und gibt die Daten strukturiert zurück. Keine Authentifizierung erforderlich.

    Ideal als Fallback wenn keine GENESIS-Zugangsdaten vorhanden sind,
    oder für einen schnellen Einstieg / einmaligen Abgleich.

    Args:
        params (FetchXlsxInput):
            - bundesland (Optional[str]): Filtert auf ein Bundesland
            - response_format: 'markdown' oder 'json'

    Returns:
        str: Hebesätze aus der XLSX-Datei, paginiert auf max. 100 Einträge.

    Hinweis: Erfordert openpyxl (pip install openpyxl).

    Beispiele:
        - Schnelltest ohne Credentials: grundsteuer_fetch_xlsx aufrufen
        - Bestimmtes Bundesland: bundesland='Hessen'
    """
    try:
        import openpyxl  # noqa: F401
    except ImportError:
        return (
            "Fehler: openpyxl ist nicht installiert.\n"
            "Bitte installieren mit: pip install openpyxl\n"
            "Danach erneut versuchen."
        )

    try:
        raw = await _get_bytes(STATISTIKPORTAL_XLSX)
    except Exception as e:
        return _handle_http_error(e)

    try:
        import openpyxl

        wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
        ws = wb.active

        gemeinden: list[dict] = []
        header_found = False
        col_ags = col_name = col_bl = col_gra = col_grb = col_gew = None
        jahr_detected = None

        for row in ws.iter_rows(values_only=True):
            if row is None:
                continue

            # Headerzeile erkennen
            if not header_found:
                row_str = [str(c).lower() if c else "" for c in row]
                if any("ags" in c or "schlüssel" in c for c in row_str):
                    header_found = True
                    for i, cell in enumerate(row_str):
                        if "ags" in cell or "schlüssel" in cell:
                            col_ags = i
                        elif "gemeinde" in cell or "name" in cell:
                            col_name = i
                        elif "land" in cell and col_bl is None:
                            col_bl = i
                        elif "grundsteuer a" in cell or "gr.st. a" in cell:
                            col_gra = i
                        elif "grundsteuer b" in cell or "gr.st. b" in cell:
                            col_grb = i
                        elif "gewerbe" in cell:
                            col_gew = i
                        elif "jahr" in cell or "berichts" in cell:
                            jahr_detected = i
                continue

            if col_ags is None:
                continue

            ags_val = row[col_ags] if col_ags is not None else None
            if not ags_val:
                continue

            def _safe_int(col: Optional[int]) -> Optional[int]:
                if col is None or row[col] is None:
                    return None
                try:
                    return int(float(str(row[col]).replace(",", ".")))
                except (ValueError, TypeError):
                    return None

            bl_name = str(row[col_bl]).strip() if col_bl is not None and row[col_bl] else ""
            if params.bundesland and params.bundesland not in bl_name:
                continue

            jahr_val = (
                int(row[jahr_detected])
                if jahr_detected is not None and row[jahr_detected]
                else 2024
            )

            gemeinden.append(
                {
                    "ags": str(ags_val).strip(),
                    "name": str(row[col_name]).strip() if col_name is not None else "",
                    "bundesland": bl_name,
                    "grundsteuer_a": _safe_int(col_gra),
                    "grundsteuer_b": _safe_int(col_grb),
                    "gewerbesteuer": _safe_int(col_gew),
                    "jahr": jahr_val,
                }
            )

        result = {
            "total": len(gemeinden),
            "count": min(len(gemeinden), 100),
            "offset": 0,
            "has_more": len(gemeinden) > 100,
            "next_offset": 100 if len(gemeinden) > 100 else None,
            "quelle": "Statistisches Bundesamt - Hebesätze der Realsteuern (XLSX)",
            "bundesland": params.bundesland,
            "gemeinden": gemeinden[:100],
        }

        if params.response_format == ResponseFormat.JSON:
            return json.dumps(result, indent=2, ensure_ascii=False)
        return _format_hebesaetze_markdown(result)

    except Exception as e:
        return f"Fehler beim XLSX-Parsen: {type(e).__name__}: {e}"


# ---------------------------------------------------------------------------
# Tool 4: Supabase-Import
# ---------------------------------------------------------------------------
class ImportToSupabaseInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, validate_assignment=True)

    gemeinden_json: str = Field(
        ...,
        description=(
            "JSON-String mit einer Liste von Gemeinde-Objekten "
            "(Ausgabe von grundsteuer_fetch_hebesaetze mit response_format='json', "
            "Feld 'gemeinden'). "
            "Jedes Objekt braucht mindestens: ags, name, grundsteuer_b, jahr."
        ),
    )
    upsert: bool = Field(
        default=True,
        description=(
            "True (Standard): Vorhandene Einträge (AGS+Jahr) werden aktualisiert. "
            "False: Nur neue Einträge werden eingefügt."
        ),
    )
    dry_run: bool = Field(
        default=False,
        description=(
            "True: Daten werden nur validiert, aber nicht geschrieben (Testlauf). "
            "False (Standard): Echtes Schreiben in Supabase."
        ),
    )

    @field_validator("gemeinden_json")
    @classmethod
    def validate_json(cls, v: str) -> str:
        try:
            data = json.loads(v)
            if not isinstance(data, list):
                raise ValueError("JSON muss eine Liste sein")
            return v
        except json.JSONDecodeError as e:
            raise ValueError(f"Ungültiges JSON: {e}")


@mcp.tool(
    name="grundsteuer_import_to_supabase",
    annotations={
        "title": "Hebesätze in Supabase importieren",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def grundsteuer_import_to_supabase(params: ImportToSupabaseInput) -> str:
    """Schreibt eine Liste von Gemeinde-Hebesätzen direkt in die Supabase-Datenbank
    des GrundsteuerMonitors (Tabelle: hebesaetze).

    Erfordert SUPABASE_URL und SUPABASE_SERVICE_KEY als Umgebungsvariablen.

    Workflow:
        1. grundsteuer_fetch_hebesaetze mit response_format='json' aufrufen
        2. Aus dem JSON das Feld 'gemeinden' extrahieren
        3. Als JSON-String an dieses Tool übergeben

    Args:
        params (ImportToSupabaseInput):
            - gemeinden_json (str): JSON-Array mit Gemeinde-Objekten
            - upsert (bool): Bestehende Einträge aktualisieren (Standard: True)
            - dry_run (bool): Nur validieren, nicht schreiben (Standard: False)

    Returns:
        str: Import-Ergebnis mit Anzahl erstellter/aktualisierter Einträge

    Beispiele:
        - Dry-Run zuerst: dry_run=True, um Daten zu prüfen
        - Produktiv: upsert=True (sichere Standard-Einstellung)
    """
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return (
            "Fehler: SUPABASE_URL und SUPABASE_SERVICE_KEY sind nicht gesetzt.\n"
            "Diese Umgebungsvariablen werden für den Direktimport benötigt.\n"
            "Alternativ: Daten mit response_format='json' abrufen und manuell "
            "in Supabase importieren."
        )

    gemeinden: list[dict] = json.loads(params.gemeinden_json)

    # Felder auf Supabase-Schema mappen
    rows = []
    errors = []
    for i, g in enumerate(gemeinden):
        if not g.get("ags") or not g.get("name") or g.get("grundsteuer_b") is None:
            errors.append(f"Zeile {i}: ags, name oder grundsteuer_b fehlt - übersprungen")
            continue
        rows.append(
            {
                "ags": g["ags"],
                "name": g["name"],
                "bundesland": g.get("bundesland", ""),
                "grundsteuer_a": g.get("grundsteuer_a"),
                "grundsteuer_b": g["grundsteuer_b"],
                "gewerbesteuer": g.get("gewerbesteuer"),
                "jahr": g.get("jahr", 2024),
                "quelle": g.get("quelle", "Regionalstatistik GENESIS"),
                "datenstand": g.get("datenstand", "geprüft"),
            }
        )

    if params.dry_run:
        return (
            f"**Dry-Run abgeschlossen**\n\n"
            f"- Valide Einträge: {len(rows)}\n"
            f"- Übersprungen: {len(errors)}\n"
            + ("\n".join(f"  - {e}" for e in errors[:10]) if errors else "")
            + "\n\nKein Schreiben in Supabase (dry_run=True)."
        )

    # Supabase REST-API: Batch-Upsert
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/hebesaetze"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates" if params.upsert else "resolution=ignore-duplicates",
    }

    # In Batches zu 500 schreiben
    BATCH_SIZE = 500
    created = 0
    updated = 0
    batch_errors = []

    try:
        async with httpx.AsyncClient() as client:
            for start in range(0, len(rows), BATCH_SIZE):
                batch = rows[start : start + BATCH_SIZE]
                resp = await client.post(
                    url,
                    headers={**headers, "Prefer": headers["Prefer"] + ",return=representation"},
                    json=batch,
                    timeout=30.0,
                )
                if resp.status_code in (200, 201):
                    created += len(batch)
                elif resp.status_code == 409 and not params.upsert:
                    # Duplikate ignoriert
                    pass
                else:
                    batch_errors.append(
                        f"Batch {start}-{start+len(batch)}: HTTP {resp.status_code} - {resp.text[:200]}"
                    )
    except Exception as e:
        return _handle_http_error(e)

    lines = [
        f"## Import abgeschlossen\n",
        f"- **Einträge verarbeitet:** {len(rows)}",
        f"- **Einträge importiert/aktualisiert:** {created}",
        f"- **Übersprungen (fehlende Pflichtfelder):** {len(errors)}",
    ]
    if batch_errors:
        lines.append(f"- **Fehler:** {len(batch_errors)}")
        for be in batch_errors[:5]:
            lines.append(f"  - {be}")
    if errors:
        lines.append("\n**Übersprungene Einträge (erste 10):**")
        for e in errors[:10]:
            lines.append(f"  - {e}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tool 5: Gemeinde-Schnellsuche (öffentlich, kein Login)
# ---------------------------------------------------------------------------
class SearchGemeindeInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    query: str = Field(
        ...,
        description="Gemeindename oder AGS-Anfang (z. B. 'München', '09162')",
        min_length=2,
        max_length=100,
    )
    response_format: ResponseFormat = Field(
        default=ResponseFormat.MARKDOWN,
        description="'markdown' oder 'json'",
    )


@mcp.tool(
    name="grundsteuer_search_gemeinde",
    annotations={
        "title": "Gemeinde suchen (GENESIS)",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def grundsteuer_search_gemeinde(params: SearchGemeindeInput) -> str:
    """Sucht Gemeinden in der GENESIS-Datenbank nach Name oder AGS-Präfix.

    Nützlich um den korrekten AGS (Amtlichen Gemeindeschlüssel) für eine
    Gemeinde herauszufinden, bevor Hebesätze importiert werden.

    Erfordert GENESIS_USERNAME und GENESIS_PASSWORD.

    Args:
        params (SearchGemeindeInput):
            - query (str): Suchbegriff (Gemeindename oder AGS-Anfang)
            - response_format: 'markdown' oder 'json'

    Returns:
        str: Liste passender Gemeinden mit AGS und Bundesland

    Beispiele:
        - Nach Name suchen: query='München'
        - Nach AGS-Präfix: query='09162'
        - Alle NRW-Gemeinden: query='05' (AGS-Präfix für NRW)
    """
    if not GENESIS_USERNAME or not GENESIS_PASSWORD:
        return (
            "Fehler: GENESIS_USERNAME und GENESIS_PASSWORD fehlen.\n"
            "Bitte `grundsteuer_check_sources` ausführen."
        )

    try:
        data = await _get(
            f"{API_BASE}/catalogue/variables",
            params={
                **_genesis_auth_params(),
                "filter": params.query,
                "type": "Regionalmerkmal",
                "area": "all",
            },
            timeout=20.0,
        )

        items = data.get("List", {}).get("Items", [])
        if not items:
            return f"Keine Gemeinden gefunden für Suche: '{params.query}'"

        result = {
            "total": len(items),
            "query": params.query,
            "gemeinden": [
                {
                    "ags": item.get("Code", ""),
                    "name": item.get("Content", ""),
                    "type": item.get("Type", ""),
                }
                for item in items[:50]
            ],
        }

        if params.response_format == ResponseFormat.JSON:
            return json.dumps(result, indent=2, ensure_ascii=False)

        lines = [
            f"# Gemeinde-Suche: '{params.query}'\n",
            f"**{result['total']} Treffer** (max. 50 angezeigt)\n",
            "| AGS | Name |",
            "|-----|------|",
        ]
        for g in result["gemeinden"]:
            lines.append(f"| {g['ags']} | {g['name']} |")
        return "\n".join(lines)

    except Exception as e:
        return _handle_http_error(e)


# ---------------------------------------------------------------------------
# Einstiegspunkt
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    mcp.run()



