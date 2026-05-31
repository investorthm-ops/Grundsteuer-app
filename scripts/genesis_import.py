#!/usr/bin/env python3
"""
GENESIS-Import für NRW + Hessen Hebesätze (2024).

Ruft Hebesätze aus der Regionalstatistik-GENESIS-API ab und schreibt
sie per Upsert in die Supabase-Datenbank.

Nutzung:
  python scripts/genesis_import.py              # NRW + Hessen
  python scripts/genesis_import.py --dry-run    # Trockentest

Umgebungsvariablen (aus .env.local):
  GENESIS_USERNAME, GENESIS_PASSWORD
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
"""

import argparse
import io
import os
import re
import sys
import zipfile
from pathlib import Path

import httpx

REGIONAL_API = "https://www.regionalstatistik.de/genesisws/rest/2020"
TABLE = "71231-01-03-5"
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
GENESIS_USER = os.environ.get("GENESIS_USERNAME", "")
GENESIS_PASS = os.environ.get("GENESIS_PASSWORD", "")
BATCH_SIZE = 500

# AGS-Praefixe: 05 = NRW, 06 = Hessen
STATES = {
    "Nordrhein-Westfalen": {"ags_prefix": "05", "kurz": "NW"},
    "Hessen": {"ags_prefix": "06", "kurz": "HE"},
}

# Spalten im GENESIS-CSV (Stand 2024):
# 0=Jahr, 1=Regionalschluessel, 2=Region,
# 3=Grundsteuer A IST, 4=Grundsteuer B IST, 5=Gewerbesteuer IST,
# 6=Grundsteuer A Grundbetrag, 7=Grundsteuer B Grundbetrag, 8=Gewerbesteuer Grundbetrag,
# 9=Grundsteuer A Hebesatz, 10=Grundsteuer B Hebesatz, 11=Gewerbesteuer Hebesatz,
# 12-16=Realsteueraufbringungskraft, 17=Gewerbesteuerumlage
COL_A = 9
COL_B = 10
COL_GEWERBE = 11


def load_env():
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())


def _parse_rate(val: str):
    val = val.strip().replace("%", "").strip()
    if not val or val in ("-", "."):
        return None
    val_clean = val.replace(".", "")
    if "," in val:
        val_clean = val_clean.replace(",", ".")
    try:
        num = float(val_clean)
        if 0 <= num <= 2000:
            return round(num, 2)
    except (ValueError, TypeError):
        pass
    return None


def _ags_level(ags: str) -> int:
    """Liefert die Verwaltungsebene anhand der AGS-Stelligkeit."""
    stripped = ags.strip()
    return len(stripped)


SKIP_SUFFIXES = (
    ", kreisfreie Stadt", ", Stadt", ", Kreisstadt",
    ", Landeshauptstadt", ", Wissenschaftsstadt", ", Karolingerstadt",
    ", Markt", ", Gemeinde", ", Kreis",
    ", gemfr. Geb.",
)


def _is_municipality(ags: str, name_raw: str) -> bool:
    """Gemeinden = 8-stellige AGS; kreisfreie Staedte = 5-stellig (ohne Landkreise)."""
    level = _ags_level(ags)
    if level == 8:
        # 8-stellig = Gemeinde; gemeindefreie Gebiete ueberspringen
        return "gemfr. Geb." not in name_raw
    if level == 5:
        # 5-stellig: nur kreisfreie Staedte behalten (keine Landkreise)
        return "kreisfreie Stadt" in name_raw and "Kreis" not in name_raw.replace("kreisfreie Stadt", "")
    return False


def _clean_name(name_raw: str) -> str:
    """Entfernt administrative Suffixe wie ', Stadt', ', kreisfreie Stadt' usw."""
    name = name_raw.strip()
    for suffix in SKIP_SUFFIXES:
        if name.endswith(suffix):
            name = name[: -len(suffix)]
            break
    # Bei mehrfachen Komma-Suffixen (z.B. "Darmstadt, kreisfreie Stadt, Wissenschaftsstadt")
    # den Rest nach erstem bekannten Suffix entfernen
    if ", " in name:
        parts = name.split(", ")
        # Pruefe ob der zweite Teil ein bekanntes Suffix ist
        for suffix in SKIP_SUFFIXES:
            suffix_clean = suffix.lstrip(", ")
            if len(parts) >= 2 and parts[1].startswith(suffix_clean):
                name = parts[0]
                break
    name = re.sub(r"\s+", " ", name).strip()
    return name


def extract_zip_content(content: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        csv_files = [n for n in archive.namelist() if n.lower().endswith(".csv")]
        if not csv_files:
            return ""
        raw = archive.read(csv_files[0])
        for enc in ("utf-8-sig", "latin-1", "cp1252"):
            try:
                return raw.decode(enc)
            except (UnicodeDecodeError, LookupError):
                continue
        return raw.decode("utf-8", errors="replace")


def parse_data_rows(text: str, bundesland: str):
    """Parst GENESIS-CSV in Gemeinde-Datensaetze."""
    gemeinden = []
    lines = text.replace("\r\n", "\n").split("\n")
    ags_prefix = STATES[bundesland]["ags_prefix"]

    for line in lines:
        line = line.strip()
        if not line:
            continue
        cols = line.split(";")
        if len(cols) < 12:
            continue
        if cols[1].strip() == "Regionalschlüssel":
            continue  # header row

        jahr_raw = cols[0].strip()
        ags = cols[1].strip()
        name_raw = cols[2].strip()

        if not ags.startswith(ags_prefix):
            continue
        if not jahr_raw.isdigit():
            continue
        if not _is_municipality(ags, name_raw):
            continue

        name = _clean_name(name_raw)

        hebesatz_a = _parse_rate(cols[COL_A] if len(cols) > COL_A else "")
        hebesatz_b = _parse_rate(cols[COL_B] if len(cols) > COL_B else "")
        hebesatz_gewerbe = _parse_rate(cols[COL_GEWERBE] if len(cols) > COL_GEWERBE else "")

        # Ueberspringe wenn gar keine Hebesatz-Daten vorhanden
        if hebesatz_a is None and hebesatz_b is None and hebesatz_gewerbe is None:
            continue

        gemeinden.append({
            "ags": ags,
            "name": name,
            "hebesatz_a": hebesatz_a,
            "hebesatz_b": hebesatz_b,
            "hebesatz_gewerbe": hebesatz_gewerbe,
        })

    # Dedupliziere
    seen = set()
    unique = []
    for g in gemeinden:
        key = g["ags"]
        if key not in seen:
            seen.add(key)
            unique.append(g)

    return unique


def fetch_state(bundesland: str, jahr: int = 2024):
    """Ruft Hebesaetze fuer ein Bundesland ab und gibt Gemeinden zurueck."""
    ags_prefix = STATES[bundesland]["ags_prefix"]

    params = {
        "name": TABLE,
        "area": "all",
        "compress": "false",
        "startyear": str(jahr),
        "endyear": str(jahr),
        "regionalvariable": "GEMEIN",
        "regionalkey": f"{ags_prefix}*",
        "language": "de",
    }

    resp = httpx.post(
        f"{REGIONAL_API}/data/tablefile",
        data=params,
        headers={"username": GENESIS_USER, "password": GENESIS_PASS},
        timeout=120.0,
    )
    resp.raise_for_status()

    ct = resp.headers.get("content-type", "")
    if "application/zip" not in ct.lower():
        err = resp.json() if resp.text.startswith("{") else resp.text[:300]
        print(f"  Keine Daten fuer {bundesland} {jahr}: {err}")
        return []

    raw_text = extract_zip_content(resp.content)
    gemeinden = parse_data_rows(raw_text, bundesland)
    print(f"  {bundesland} {jahr}: {len(gemeinden)} Gemeinden")
    return gemeinden


def to_supabase_rows(gemeinden, bundesland: str, jahr: int):
    rows = []
    for g in gemeinden:
        rows.append({
            "name": g["name"],
            "bundesland": bundesland,
            "kreis": None,
            "hebesatz_a": g["hebesatz_a"],
            "hebesatz_b": g["hebesatz_b"],
            "hebesatz_b_wohnen": None,
            "hebesatz_b_nichtwohnen": None,
            "hebesatz_gewerbe": g["hebesatz_gewerbe"],
            "datenstand": f"{jahr}-12-31",
            "quellenstatus": "bestaetigt",
            "quellenname": f"Regionalstatistik GENESIS, Tabelle {TABLE}",
            "quellen_url": "https://www.regionalstatistik.de",
        })
    return rows


def write_batch(client: httpx.Client, batch: list) -> tuple:
    """Schreibt ein Batch per Upsert. Gibt (ok_count, error_count) zurueck."""
    api_url = f"{SUPABASE_URL}/rest/v1/municipalities?on_conflict=bundesland,name"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }
    try:
        resp = client.post(api_url, headers=headers, json=batch, timeout=30.0)
        if resp.status_code in (200, 201, 204):
            return len(batch), 0
        print(f"    HTTP {resp.status_code}: {resp.text[:200]}")
        return 0, len(batch)
    except Exception as e:
        print(f"    Fehler: {e}")
        return 0, len(batch)


def fetch_existing_timestamps(bundesland: str) -> dict:
    """Holt existierende (bundesland, name)->datenstand aus Supabase.

    Ermoeglicht das Ueberspringen von Records mit neuerem Datenstand.
    """
    result = {}
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return result
    url = f"{SUPABASE_URL}/rest/v1/municipalities?select=name,datenstand&bundesland=eq.{bundesland}&limit=1000"
    headers = {"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(url, headers=headers)
        if resp.status_code == 200:
            for r in resp.json():
                result[r["name"]] = r.get("datenstand", "")
    return result


def write_to_supabase(rows, bundesland: str, jahr: int):
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("  FEHLER: SUPABASE_URL oder SUPABASE_SERVICE_KEY nicht gesetzt")
        return 0, len(rows)

    # Bestehende Datenstaende abrufen, um neuere nicht zu ueberschreiben
    existing = fetch_existing_timestamps(bundesland)
    import_datenstand = f"{jahr}-12-31"
    filtered = []
    skipped = 0
    for r in rows:
        old = existing.get(r["name"], "")
        if old > import_datenstand:
            skipped += 1
        else:
            filtered.append(r)

    if skipped:
        print(f"  {skipped} Gemeinden uebersprungen (neuerer Datenstand vorhanden)")

    if not filtered:
        print("  Keine zu aktualisierenden Gemeinden")
        return 0, 0

    written = 0
    errors = 0
    with httpx.Client(timeout=30.0) as client:
        for i in range(0, len(filtered), BATCH_SIZE):
            batch = filtered[i : i + BATCH_SIZE]
            ok, err = write_batch(client, batch)
            written += ok
            errors += err
            batch_num = i // BATCH_SIZE + 1
            detail = f"{batch_num}: {ok} geschrieben"
            if err:
                detail += f", {err} Fehler"
            print(f"    Batch {detail}")

    return written, errors


def main():
    parser = argparse.ArgumentParser(description="GENESIS-Import NRW + Hessen")
    parser.add_argument("--state", choices=list(STATES.keys()) + ["alle"], default="alle")
    parser.add_argument("--dry-run", action="store_true", help="Nur anzeigen, nicht schreiben")
    parser.add_argument("--year", type=int, default=2024, help="Jahr (Default: 2024)")
    args = parser.parse_args()

    load_env()

    if not GENESIS_USER or not GENESIS_PASS:
        print("FEHLER: GENESIS_USERNAME und GENESIS_PASSWORD muessen gesetzt sein")
        sys.exit(1)

    states = [args.state] if args.state != "alle" else list(STATES.keys())
    jahr = args.year

    print(f"GENESIS-Import {', '.join(states)} {jahr}")
    if args.dry_run:
        print("  *** DRY RUN ***")
    print()

    total_written = 0
    total_errors = 0
    total_gemeinden = 0

    for bundesland in states:
        print(f"--- {bundesland} ---")
        gemeinden = fetch_state(bundesland, jahr)
        total_gemeinden += len(gemeinden)

        if not gemeinden:
            print("  Keine Gemeinden gefunden\n")
            continue

        rows = to_supabase_rows(gemeinden, bundesland, jahr)

        if args.dry_run:
            print(f"  DRY RUN: {len(rows)} Zeilen")
            for r in rows[:5]:
                print(f"    {r['name']}: B={r['hebesatz_b']}%, A={r['hebesatz_a']}%, G={r['hebesatz_gewerbe']}%")
            if len(rows) > 5:
                print(f"    ... und {len(rows)-5} weitere")
        else:
            written, errors = write_to_supabase(rows, bundesland, jahr)
            total_written += written
            total_errors += errors
        print()

    print(f"{'='*50}")
    if args.dry_run:
        print(f"DRY RUN: {total_gemeinden} Gemeinden gelesen, nichts geschrieben")
    else:
        print(f"Fertig: {total_written} geschrieben, {total_errors} Fehler")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
