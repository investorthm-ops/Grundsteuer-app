#!/usr/bin/env python3
"""
Scraper fuer IHK Hessen Grundsteuer B Hebesaetze 2025.
Liest die HTML-Tabelle von der IHK Gießen-Friedberg-Seite
und schreibt die aktualisierten Grundsteuer B-Werte per 
Upsert in die Supabase-Datenbank.

Nutzung:
  python scripts/ihk_hessen_scraper.py
  python scripts/ihk_hessen_scraper.py --dry-run
"""

import argparse
import os
import re
import sys
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

IHK_URL = (
    "https://www.ihk.de/giessen-friedberg/geschaeftsbereiche/recht-und-steuern/"
    "steuern/hebesatz-2025-6494554"
)
SUPABASE_URL = ""
SUPABASE_SERVICE_KEY = ""
BATCH_SIZE = 500
FETCH_PAGE_SIZE = 1000


def load_env():
    global SUPABASE_URL, SUPABASE_SERVICE_KEY
    env_path = Path(__file__).resolve().parent.parent / ".env.local"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            os.environ.setdefault(key.strip(), val.strip())
    SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def parse_rate(val: str):
    """Wandle deutschen Zahlenstring in Float (oder None)."""
    val = val.strip().replace("%", "").strip()
    if not val or val in ("-", "."):
        return None
    val_clean = val.replace(".", "")
    if "," in val:
        val_clean = val_clean.replace(",", ".")
    try:
        num = float(val_clean)
        if 0 <= num <= 5000:
            return round(num, 2)
    except (ValueError, TypeError):
        pass
    return None


def fetch_html() -> str:
    """Rufe IHK-Seite ab und gib HTML-Text zurueck."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
    }
    resp = httpx.get(IHK_URL, headers=headers, follow_redirects=True, timeout=30)
    resp.raise_for_status()
    return resp.text


def parse_table(html: str) -> list[dict]:
    """Parse IHK HTML-Tabelle in Liste von {name, hebesatz_b, ...}."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        print("FEHLER: Keine Tabelle gefunden")
        return []

    rows = table.find_all("tr")
    if not rows:
        print("FEHLER: Keine Zeilen in Tabelle")
        return []

    results = []
    current_kreis = None
    for row in rows[1:]:  # Skip header row
        cells = row.find_all("td")
        if len(cells) < 4:
            continue

        # Section headers (Landkreis-Überschrift) haben <strong> in erster Zelle
        first = cells[0]
        if first.find("strong"):
            current_kreis = first.get_text(strip=True)
            continue

        name = first.get_text(strip=True)
        if not name:
            continue

        alter_raw = cells[1].get_text(strip=True)
        empfehlung_raw = cells[2].get_text(strip=True)
        neuer_raw = cells[3].get_text(strip=True)

        neuer = parse_rate(neuer_raw)
        alter = parse_rate(alter_raw)
        empfehlung = parse_rate(empfehlung_raw)

        results.append({
            "name": name,
            "kreis": current_kreis,
            "hebesatz_b": neuer,
            "hebesatz_b_alt": alter,
            "hebesatz_b_empfehlung": empfehlung,
        })

    return results


def fetch_existing_municipalities() -> dict:
    """Holt alle bestehenden Gemeindenamen aus Supabase."""
    result = {}
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return result
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }
    with httpx.Client(timeout=30.0) as client:
        offset = 0
        while True:
            url = (
                f"{SUPABASE_URL}/rest/v1/municipalities"
                f"?select=name,bundesland,datenstand&bundesland=eq.Hessen&order=name.asc"
                f"&limit={FETCH_PAGE_SIZE}&offset={offset}"
            )
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            page = resp.json()
            for r in page:
                result[r["name"]] = r
            if len(page) < FETCH_PAGE_SIZE:
                break
            offset += FETCH_PAGE_SIZE
    return result


# Manuelle Namenszuordnung von IHK-Kurzform zu DB-Langform
NAME_MAP = {
    'Frankfurt': 'Frankfurt am Main',
    'Offenbach': 'Offenbach am Main',
    'Heppenheim': 'Heppenheim (Bergstraße)',
    'Hirschhorn': 'Hirschhorn (Neckar)',
    'Münster': 'Münster (Hessen)',
    'Biebesheim': 'Biebesheim am Rhein',
    'Rüsselsheim': 'Rüsselsheim am Main',
    'Stockstadt': 'Stockstadt am Rhein',
    'Bad Homburg': 'Bad Homburg v. d. Höhe',
    'Königstein': 'Königstein im Taunus',
    'Kronberg': 'Kronberg im Taunus',
    'Oberursel': 'Oberursel (Taunus)',
    'Schmitten': 'Schmitten im Taunus',
    'Steinbach': 'Steinbach (Taunus)',
    'Bd Soden-Salmünster': 'Bad Soden-Salmünster',
    'Steinau a. d. Str.': 'Steinau an der Straße',
    'Bad Soden': 'Bad Soden am Taunus',
    'Flörsheim': 'Flörsheim am Main',
    'Hattersheim': 'Hattersheim am Main',
    'Hochheim': 'Hochheim am Main',
    'Hofheim': 'Hofheim am Taunus',
    'Kelkheim': 'Kelkheim (Taunus)',
    'Liederbach': 'Liederbach am Taunus',
    'Schwalbach': 'Schwalbach am Taunus',
    'Sulzbach': 'Sulzbach (Taunus)',
    'Fränk.-Crumbach': 'Fränkisch-Crumbach',
    'Höchst': 'Höchst i. Odw.',
    'Langen': 'Langen (Hessen)',
    'Mühlheim': 'Mühlheim am Main',
    'Eltville': 'Eltville am Rhein',
    'Rüdesheim': 'Rüdesheim am Rhein',
    'Friedberg': 'Friedberg (Hessen)',
    'Rosbach': 'Rosbach v. d. Höhe',
    'Heuchelheim': 'Heuchelheim a. d. Lahn',
    'Limburg': 'Limburg a. d. Lahn',
    'Selters': 'Selters (Taunus)',
    'Waldbrunn': 'Waldbrunn (Westerwald)',
    'Neustadt': 'Neustadt (Hessen)',
    'Weimar': 'Weimar (Lahn)',
    'Wetter': 'Wetter (Hessen)',
    'Lauterbach': 'Lauterbach (Hessen)',
    'Lautertal': 'Lautertal (Vogelsberg)',
    'Ehrenberg': 'Ehrenberg (Rhön)',
    'Gersfeld': 'Gersfeld (Rhön)',
    'Poppenhausen': 'Poppenhausen (Wasserkuppe)',
    'Tann': 'Tann (Rhön)',
    'Breitenbach': 'Breitenbach a. Herzberg',
    'Heringen': 'Heringen (Werra)',
    'Philippsthal': 'Philippsthal (Werra)',
    'Rotenburg': 'Rotenburg a. d. Fulda',
    'Borken': 'Borken (Hessen)',
    'Battenberg': 'Battenberg (Eder)',
    'Frankenberg': 'Frankenberg (Eder)',
    'Haina': 'Haina (Kloster)',
    'Hatzfeld': 'Hatzfeld (Eder)',
    'Willingen': 'Willingen (Upland)',
}

# Reichelsheim erscheint 2x (Odenwaldkreis + Wetteraukreis)
REICHELSHEIM_MAP = {
    'Odenwaldkreis': 'Reichelsheim (Odenwald)',
    'Wetteraukreis': 'Reichelsheim (Wetterau)',
}


def _norm(s: str) -> str:
    return (s.lower().replace(" ", "").replace("-", "")
            .replace("ß", "ss").replace("ä", "ae")
            .replace("ö", "oe").replace("ü", "ue"))


def build_update_rows(
    scraped: list[dict], existing: dict, force: bool = False
) -> tuple[list[dict], list[str], list[str]]:
    """Baue Upsert-Rows. Gib (rows, matched, unmatched) zurueck.
    
    Respektiert den Datenstand-Guard: Ueberschreibt ohne --force keine Records
    mit gleichem oder neuerem Datenstand.
    """
    rows = []
    matched_names = []
    unmatched_names = []
    skipped_datenstand = 0

    existing_keys = {name: data for name, data in existing.items()}
    IHK_DATENSTAND = "2025-06-30"

    for entry in scraped:
        name_raw = entry["name"]
        db_name = None

        if name_raw == "Reichelsheim":
            kreis = entry.get("kreis", "") or ""
            db_name = REICHELSHEIM_MAP.get(kreis)

        if db_name is None:
            db_name = NAME_MAP.get(name_raw)

        if db_name is None and name_raw in existing_keys:
            db_name = name_raw

        if db_name is None:
            n_name = _norm(name_raw)
            for full_name in existing:
                base = full_name.split(",")[0].strip()
                n_base = _norm(base)
                if n_name == n_base:
                    db_name = full_name
                    break

        if db_name is not None:
            # Datenstand-Guard: Nicht ueberschreiben, wenn gleicher/neuerer Stand existiert.
            old = existing_keys[db_name]
            old_datenstand = old.get("datenstand", "")
            if not force and old_datenstand >= IHK_DATENSTAND:
                skipped_datenstand += 1
                continue

            matched_names.append(db_name)
            rows.append({
                "name": db_name,
                "bundesland": "Hessen",
                "hebesatz_b": entry["hebesatz_b"],
                "datenstand": IHK_DATENSTAND,
                "quellenstatus": "bestaetigt",
                "quellenname": "IHK Gießen-Friedberg, Hebesätze 2025",
                "quellen_url": IHK_URL,
            })
        else:
            unmatched_names.append(f"{name_raw} (kreis={entry.get('kreis')})")

    if skipped_datenstand:
        print(f"   {skipped_datenstand} uebersprungen (gleicher/neuerer Datenstand)")

    return rows, matched_names, unmatched_names


def write_batch(client: httpx.Client, batch: list) -> tuple:
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


def write_to_supabase(rows: list):
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("  FEHLER: SUPABASE_URL oder SUPABASE_SERVICE_KEY nicht gesetzt")
        return 0, len(rows)

    written = 0
    errors = 0
    with httpx.Client(timeout=30.0) as client:
        for i in range(0, len(rows), BATCH_SIZE):
            batch = rows[i : i + BATCH_SIZE]
            ok, err = write_batch(client, batch)
            written += ok
            errors += err
            batch_num = i // BATCH_SIZE + 1
            detail = f"Batch {batch_num}: {ok} geschrieben"
            if err:
                detail += f", {err} Fehler"
            print(f"    {detail}")

    return written, errors


def main():
    parser = argparse.ArgumentParser(description="IHK Hessen Scraper")
    parser.add_argument("--dry-run", action="store_true", help="Nur anzeigen, nicht schreiben")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Auch Datensätze mit gleichem oder neuerem Datenstand überschreiben",
    )
    args = parser.parse_args()

    load_env()

    print("IHK Hessen Scraper - Grundsteuer B 2025")
    print()

    # 1. HTML holen
    print("1. IHK-Seite abrufen...")
    html = fetch_html()
    print(f"   {len(html)} Bytes erhalten")

    # 2. Tabelle parsen
    print("2. Tabelle parsen...")
    scraped = parse_table(html)
    print(f"   {len(scraped)} Gemeinden aus Tabelle")

    if not scraped:
        print("FEHLER: Keine Daten aus Tabelle extrahiert")
        sys.exit(1)

    # 3. Bestehende Daten aus Supabase holen
    print("3. Bestehende Gemeinden aus Supabase abrufen...")
    existing = fetch_existing_municipalities()
    print(f"   {len(existing)} Gemeinden in DB")

    # 4. Matchen
    print("4. Matchen...")
    rows, matched, unmatched = build_update_rows(scraped, existing, force=args.force)
    print(f"   {len(matched)} gematcht, {len(unmatched)} ungematcht")

    if unmatched:
        print(f"\n   Ungematchte Namen ({len(unmatched)}):")
        for u in unmatched[:20]:
            print(f"     - {u}")
        if len(unmatched) > 20:
            print(f"     ... und {len(unmatched)-20} weitere")

    if not rows:
        print("Keine zu aktualisierenden Gemeinden")
        sys.exit(0)

    # 5. Schreiben
    if args.dry_run:
        print(f"\n5. DRY RUN: {len(rows)} Zeilen wuerden geschrieben")
        for r in rows[:5]:
            print(f"   {r['name']}: B={r['hebesatz_b']}")
        if len(rows) > 5:
            print(f"   ... und {len(rows)-5} weitere")
    else:
        print(f"\n5. Schreiben nach Supabase ({len(rows)} Zeilen)...")
        written, errors = write_to_supabase(rows)
        print(f"\nFertig: {written} geschrieben, {errors} Fehler")

    print("Done")


if __name__ == "__main__":
    main()
