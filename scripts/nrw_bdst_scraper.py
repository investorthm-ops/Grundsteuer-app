#!/usr/bin/env python3
"""
NRW BdSt PDF Scraper fuer Grundsteuer B 2025.
Parst die BdSt NRW PDF-Tabelle und schreibt die aktuellen
Grundsteuer B-Werte per Upsert in die Supabase-Datenbank.

Nutzung:
  python scripts/nrw_bdst_scraper.py
  python scripts/nrw_bdst_scraper.py --dry-run
"""

import argparse
import os
import re
import sys
import tempfile
from pathlib import Path

import httpx
import pdfplumber
from import_staging import (
    build_staging_rows,
    fetch_existing_municipalities,
    stage_import_run,
)

PDF_URL = (
    "https://steuerzahler.de/fileadmin/user_upload/"
    "LV_Nordrhein-Westfalen/Dateien/"
    "Grundsteuer_B-Hebes%C3%A4tze_in_NRW.pdf"
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


def download_pdf() -> bytes:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36"
        ),
    }
    resp = httpx.get(PDF_URL, headers=headers, follow_redirects=True, timeout=30)
    resp.raise_for_status()
    return resp.content


def extract_data(pdf_bytes: bytes) -> list[dict]:
    """Extrahiere alle Gemeindedaten aus der PDF-Tabelle."""
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        temp_file.write(pdf_bytes)
        pdf_path = Path(temp_file.name)
    finally:
        temp_file.close()

    results = []
    try:
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                if not tables:
                    continue
                for table in tables:
                    for row in table[1:]:  # Skip header row
                        if len(row) < 6:
                            continue
                        kreis = (row[0] or "").strip()
                        stadt = (row[1] or "").strip()
                        art = (row[2] or "").strip()
                        einheitlich = (row[3] or "").strip()
                        wohnen = (row[4] or "").strip()
                        nichtwohnen = (row[5] or "").strip()

                        if not stadt:
                            continue

                        # "kreisfreie Stadt" combine: kreis="kreisfreie Stadt", stadt="Aachen"
                        if kreis == "kreisfreie Stadt":
                            full_kreis = f"kreisfreie Stadt {stadt}"
                        else:
                            full_kreis = kreis

                        # Parse rates
                        if art.startswith("einheitlich"):
                            hebesatz_b = parse_rate(einheitlich)
                            hebesatz_b_wohnen = None
                            hebesatz_b_nichtwohnen = None
                        else:
                            hebesatz_b = None
                            hebesatz_b_wohnen = parse_rate(wohnen)
                            hebesatz_b_nichtwohnen = parse_rate(nichtwohnen)

                        results.append({
                            "name_pdf": stadt,
                            "kreis": full_kreis,
                            "hebesatz_b": hebesatz_b,
                            "hebesatz_b_wohnen": hebesatz_b_wohnen,
                            "hebesatz_b_nichtwohnen": hebesatz_b_nichtwohnen,
                        })
    finally:
        pdf_path.unlink(missing_ok=True)
    return results


# Manuelle Namenszuordnung von PDF-Kurzform zu DB-Langform (NRW)
NAME_MAP_NRW = {
    'Ahlen': 'Ahlen, Stadt',
    'Arnsberg': 'Arnsberg, Stadt',
    'Attendorn': 'Attendorn, Stadt',
    'Bad Berleburg': 'Bad Berleburg, Stadt',
    'Bad Driburg': 'Bad Driburg, Stadt',
    'Bad Honnef': 'Bad Honnef, Stadt',
    'Bad Laasphe': 'Bad Laasphe, Stadt',
    'Bad Lippspringe': 'Bad Lippspringe, Stadt',
    'Bad Münstereifel': 'Bad Münstereifel, Stadt',
    'Bad Oeynhausen': 'Bad Oeynhausen, Stadt',
    'Bad Salzuflen': 'Bad Salzuflen, Stadt',
    'Bad Sassendorf': 'Bad Sassendorf',
    'Bad Wünnenberg': 'Bad Wünnenberg, Stadt',
    'Balve': 'Balve, Stadt',
    'Beckum': 'Beckum, Stadt',
    'Bergisch Gladbach': 'Bergisch Gladbach, Stadt',
    'Bergkamen': 'Bergkamen, Stadt',
    'Bergneustadt': 'Bergneustadt, Stadt',
    'Beverungen': 'Beverungen, Stadt',
    'Bielefeld': 'Bielefeld, Stadt',
    'Blomberg': 'Blomberg, Stadt',
    'Bocholt': 'Bocholt, Stadt',
    'Bochum': 'Bochum, Stadt',
    'Bonn': 'Bonn, Stadt',
    'Borchen': 'Borchen',
    'Borgentreich': 'Borgentreich, Stadt',
    'Borken': 'Borken, Stadt',
    'Bornheim': 'Bornheim, Stadt',
    'Bottrop': 'Bottrop, Stadt',
    'Brakel': 'Brakel, Stadt',
    'Brilon': 'Brilon, Stadt',
    'Brühl': 'Brühl, Stadt',
    'Bünde': 'Bünde, Stadt',
    'Büren': 'Büren, Stadt',
    'Castrop-Rauxel': 'Castrop-Rauxel, Stadt',
    'Coesfeld': 'Coesfeld, Stadt',
    'Datteln': 'Datteln, Stadt',
    'Delbrück': 'Delbrück, Stadt',
    'Detmold': 'Detmold, Stadt',
    'Dinslaken': 'Dinslaken, Stadt',
    'Dormagen': 'Dormagen, Stadt',
    'Dorsten': 'Dorsten, Stadt',
    'Dortmund': 'Dortmund, Stadt',
    'Drensteinfurt': 'Drensteinfurt, Stadt',
    'Drolshagen': 'Drolshagen',
    'Duisburg': 'Duisburg, Stadt',
    'Dülmen': 'Dülmen, Stadt',
    'Düren': 'Düren, Stadt',
    'Düsseldorf': 'Düsseldorf, Stadt',
    'Eitorf': 'Eitorf',
    'Elsdorf': 'Elsdorf, Stadt',
    'Emmerich': 'Emmerich am Rhein, Stadt',
    'Emsdetten': 'Emsdetten, Stadt',
    'Engelskirchen': 'Engelskirchen',
    'Enger': 'Enger, Stadt',
    'Ennepetal': 'Ennepetal, Stadt',
    'Ennigerloh': 'Ennigerloh, Stadt',
    'Ense': 'Ense',
    'Erftstadt': 'Erftstadt, Stadt',
    'Erkelenz': 'Erkelenz, Stadt',
    'Erkrath': 'Erkrath, Stadt',
    'Erndtebrück': 'Erndtebrück',
    'Erwitte': 'Erwitte, Stadt',
    'Eschweiler': 'Eschweiler, Stadt',
    'Espelkamp': 'Espelkamp, Stadt',
    'Essen': 'Essen, Stadt',
    'Euskirchen': 'Euskirchen, Stadt',
    'Extertal': 'Extertal',
    'Finnentrop': 'Finnentrop',
    'Frechen': 'Frechen, Stadt',
    'Freudenberg': 'Freudenberg, Stadt',
    'Fröndenberg': 'Fröndenberg/Ruhr, Stadt',
    'Gangelt': 'Gangelt',
    'Geilenkirchen': 'Geilenkirchen, Stadt',
    'Geldern': 'Geldern, Stadt',
    'Gelsenkirchen': 'Gelsenkirchen, Stadt',
    'Gescher': 'Gescher, Stadt',
    'Geseke': 'Geseke, Stadt',
    'Gevelsberg': 'Gevelsberg, Stadt',
    'Gladbeck': 'Gladbeck, Stadt',
    'Goch': 'Goch, Stadt',
    'Greven': 'Greven, Stadt',
    'Grevenbroich': 'Grevenbroich, Stadt',
    'Gronau': 'Gronau (Westf.), Stadt',
    'Gummersbach': 'Gummersbach, Stadt',
    'Gütersloh': 'Gütersloh, Stadt',
    'Haan': 'Haan, Stadt',
    'Hagen': 'Hagen, Stadt',
    'Halle': 'Halle (Westf.), Stadt',
    'Hallenberg': 'Hallenberg, Stadt',
    'Haltern am See': 'Haltern am See, Stadt',
    'Halver': 'Halver, Stadt',
    'Hamm': 'Hamm, Stadt',
    'Hamminkeln': 'Hamminkeln, Stadt',
    'Harsewinkel': 'Harsewinkel, Stadt',
    'Hattingen': 'Hattingen, Stadt',
    'Havixbeck': 'Havixbeck',
    'Heek': 'Heek',
    'Heiden': 'Heiden',
    'Heiligenhaus': 'Heiligenhaus, Stadt',
    'Heimbach': 'Heimbach, Stadt',
    'Heinsberg': 'Heinsberg, Stadt',
    'Hellenthal': 'Hellenthal',
    'Hemer': 'Hemer, Stadt',
    'Hennef': 'Hennef (Sieg), Stadt',
    'Herdecke': 'Herdecke, Stadt',
    'Herford': 'Herford, Stadt',
    'Herne': 'Herne, Stadt',
    'Herscheid': 'Herscheid',
    'Herten': 'Herten, Stadt',
    'Herzebrock-Clarholz': 'Herzebrock-Clarholz',
    'Herzogenrath': 'Herzogenrath, Stadt',
    'Hiddenhausen': 'Hiddenhausen',
    'Hilchenbach': 'Hilchenbach, Stadt',
    'Hilden': 'Hilden, Stadt',
    'Hille': 'Hille',
    'Holzwickede': 'Holzwickede',
    'Hopsten': 'Hopsten',
    'Horn-Bad Meinberg': 'Horn-Bad Meinberg, Stadt',
    'Hörstel': 'Hörstel, Stadt',
    'Höxter': 'Höxter, Stadt',
    'Eslohe': 'Eslohe (Sauerland)',
    'Langenfeld': 'Langenfeld (Rheinl.), Stadt',
    'Leichlingen': 'Leichlingen (Rheinl.), Stadt',
    'Menden': 'Menden (Sauerland), Stadt',
    'Monheim': 'Monheim am Rhein, Stadt',
    'Mülheim': 'Mülheim an der Ruhr, Stadt',
    'Stolberg': 'Stolberg (Rhld.), Stadt',
    'Sundern': 'Sundern (Sauerland), Stadt',
    'Voerde': 'Voerde (Niederrhein), Stadt',
    'Werther': 'Werther (Westf.), Stadt',
}

# All NRW Kreise for reference
NRW_KREISE = {
    'Borken', 'Coesfeld', 'Düren', 'Ennepe-Ruhr-Kreis', 'Euskirchen',
    'Gütersloh', 'Heinsberg', 'Herford', 'Hochsauerlandkreis', 'Höxter',
    'Kleve', 'Lippe', 'Märkischer Kreis', 'Mettmann', 'Minden-Lübbecke',
    'Oberbergischer Kreis', 'Olpe', 'Paderborn', 'Rhein-Erft-Kreis',
    'Rhein-Kreis Neuss', 'Rhein-Sieg-Kreis', 'Rheinisch-Bergischer Kreis',
    'Siegen-Wittgenstein', 'Soest', 'Steinfurt', 'Unna', 'Viersen',
    'Warendorf', 'Wesel',
}


def _norm(s: str) -> str:
    s = s.split(",")[0].strip()
    s = re.sub(r'\s*\([^)]*\)', '', s)
    s = re.sub(r'\s+am\s+\w+', '', s)
    s = re.sub(r'\s+an\s+der\s+\w+', '', s)
    s = re.sub(r'\s+im\s+\w+', '', s)
    s = re.sub(r'\s+an\s+der\s+\w+', '', s)
    s = re.sub(r'\s*a\.\s*d\.\s*\w+', '', s)
    s = re.sub(r'\s+v\.\s*d\.\s*\w+', '', s)
    s = re.sub(r'/\w+', '', s)
    return (s.lower().replace(" ", "").replace("-", "")
            .replace("ß", "ss").replace("ä", "ae")
            .replace("ö", "oe").replace("ü", "ue")
            .replace("/", "").replace("(", "").replace(")", ""))


def fetch_existing_nrw_municipalities() -> dict:
    """Holt alle NRW-Gemeindenamen aus Supabase."""
    return fetch_existing_municipalities(SUPABASE_URL, SUPABASE_SERVICE_KEY, "Nordrhein-Westfalen")


def build_update_rows(
    scraped: list[dict], existing: dict, force: bool = False
) -> tuple[list[dict], list[str], list[str]]:
    """Baue Upsert-Rows mit Namensmatching."""
    rows = []
    matched_names = []
    unmatched_names = []
    skipped_datenstand = 0
    NRW_DATENSTAND = "2025-06-30"

    # Build lookup by normalized name (strip comma suffixes for matching)
    existing_norm = {}
    for db_name, data in existing.items():
        base = db_name.split(",")[0].strip()
        key = _norm(base)
        existing_norm[key] = db_name

    for entry in scraped:
        name_pdf = entry["name_pdf"]
        db_name = None

        # 1. Manual override
        if name_pdf in NAME_MAP_NRW:
            candidate = NAME_MAP_NRW[name_pdf]
            if candidate in existing:
                db_name = candidate

        # 2. Direct match
        if db_name is None and name_pdf in existing:
            db_name = name_pdf

        # 3. Normalized match (compare base name without comma suffix)
        if db_name is None:
            n_pdf = _norm(name_pdf)
            db_name = existing_norm.get(n_pdf)

        if db_name is not None:
            old_datenstand = existing[db_name].get("datenstand", "")
            if not force and old_datenstand >= NRW_DATENSTAND:
                skipped_datenstand += 1
                continue

            matched_names.append(db_name)
            # hebesatz_b is NOT NULL; for differenzierte use the wohnen rate
            b_val = entry["hebesatz_b"]
            if b_val is None and entry["hebesatz_b_wohnen"] is not None:
                b_val = entry["hebesatz_b_wohnen"]
            rows.append({
                "name": db_name,
                "bundesland": "Nordrhein-Westfalen",
                "hebesatz_b": b_val,
                "hebesatz_b_wohnen": entry["hebesatz_b_wohnen"],
                "hebesatz_b_nichtwohnen": entry["hebesatz_b_nichtwohnen"],
                "datenstand": NRW_DATENSTAND,
                "quellenstatus": "bestaetigt",
                # WICHTIG: Diese Quelle liefert NUR Grundsteuer B. hebesatz_a und
                # hebesatz_gewerbe werden bewusst nicht geschrieben und bleiben auf
                # ihrem bisherigen (i. d. R. 2024er) Stand. Der Quellenname macht das
                # transparent, damit A/Gewerbe nicht faelschlich als 2025-bestaetigt
                # gelten (vgl. Migration 0021).
                "quellenname": "BdSt NRW - Grundsteuer B 2025; Grundsteuer A und Gewerbesteuer Stand 2024 (nicht reformbestaetigt)",
                "quellen_url": PDF_URL,
            })
        else:
            unmatched_names.append(name_pdf)

    if skipped_datenstand:
        print(f"   {skipped_datenstand} uebersprungen (gleicher/neuerer Datenstand)")

    return rows, matched_names, unmatched_names


def stage_to_import_pipeline(rows: list):
    existing = fetch_existing_nrw_municipalities()
    staging_rows = build_staging_rows(
        rows,
        existing,
        warning="Automatischer BdSt-Scraper: vor Produktivuebernahme im Adminbereich freigeben.",
    )
    run_id, errors = stage_import_run(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        "BdSt NRW - Grundsteuer B 2025",
        PDF_URL,
        "2025-06-30",
        staging_rows,
    )
    if run_id:
        print(f"  Importlauf vorgemerkt: {run_id}")
    return len(staging_rows) - errors, errors


def main():
    parser = argparse.ArgumentParser(description="NRW BdSt PDF Scraper")
    parser.add_argument("--dry-run", action="store_true", help="Nur anzeigen, nicht schreiben")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Auch Datensätze mit gleichem oder neuerem Datenstand überschreiben",
    )
    args = parser.parse_args()

    load_env()

    print("NRW BdSt PDF Scraper - Grundsteuer B 2025")
    print()

    # 1. PDF herunterladen
    print("1. PDF herunterladen...")
    pdf_bytes = download_pdf()
    print(f"   {len(pdf_bytes)} Bytes")

    # 2. Tabelle extrahieren
    print("2. Tabelle extrahieren...")
    scraped = extract_data(pdf_bytes)
    print(f"   {len(scraped)} Gemeinden aus PDF")

    if not scraped:
        print("FEHLER: Keine Daten aus PDF extrahiert")
        sys.exit(1)

    # 3. Bestehende NRW-Daten holen
    print("3. Bestehende NRW-Gemeinden aus Supabase abrufen...")
    existing = fetch_existing_nrw_municipalities()
    print(f"   {len(existing)} NRW-Gemeinden in DB")

    # 4. Matchen
    print("4. Matchen...")
    rows, matched, unmatched = build_update_rows(scraped, existing, force=args.force)
    print(f"   {len(matched)} gematcht, {len(unmatched)} ungematcht")

    if unmatched:
        print(f"\n   Ungematchte Namen ({len(unmatched)}):")
        for u in unmatched:
            print(f"     - {u}")

    if not rows:
        print("Keine zu aktualisierenden Gemeinden")
        sys.exit(0)

    # 5. Schreiben
    if args.dry_run:
        print(f"\n5. DRY RUN: {len(rows)} Zeilen wuerden geschrieben")
        for r in rows[:5]:
            parts = [f"{r['name']}"]
            if r['hebesatz_b'] is not None:
                parts.append(f"B={r['hebesatz_b']}")
            if r['hebesatz_b_wohnen'] is not None:
                parts.append(f"Wohnen={r['hebesatz_b_wohnen']}")
            if r['hebesatz_b_nichtwohnen'] is not None:
                parts.append(f"Nicht-Wohnen={r['hebesatz_b_nichtwohnen']}")
            print(f"   {', '.join(parts)}")
        if len(rows) > 5:
            print(f"   ... und {len(rows)-5} weitere")
    else:
        print(f"\n5. Importlauf vormerken ({len(rows)} Zeilen)...")
        written, errors = stage_to_import_pipeline(rows)
        print(f"\nFertig: {written} Zeilen vorgemerkt, {errors} Fehler")

    print("Done")


if __name__ == "__main__":
    main()
