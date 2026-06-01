import math
from typing import Any

import httpx

BATCH_SIZE = 500
FETCH_PAGE_SIZE = 1000


def supabase_headers(service_key: str) -> dict[str, str]:
    return {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }


def fetch_existing_municipalities(
    supabase_url: str,
    service_key: str,
    bundesland: str | None = None,
) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    if not supabase_url or not service_key:
        return result

    headers = supabase_headers(service_key)
    filters = f"&bundesland=eq.{bundesland}" if bundesland else ""
    select = (
        "id,name,bundesland,kreis,hebesatz_a,hebesatz_b,hebesatz_b_wohnen,"
        "hebesatz_b_nichtwohnen,hebesatz_gewerbe,vorjahr_b,datenstand,"
        "quellenstatus,quellenname,quellen_url"
    )

    with httpx.Client(timeout=30.0) as client:
        offset = 0
        while True:
            url = (
                f"{supabase_url}/rest/v1/municipalities"
                f"?select={select}{filters}&order=name.asc"
                f"&limit={FETCH_PAGE_SIZE}&offset={offset}"
            )
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            page = resp.json()
            for row in page:
                result[row["name"]] = row
            if len(page) < FETCH_PAGE_SIZE:
                break
            offset += FETCH_PAGE_SIZE

    return result


def _same_number(left: Any, right: Any) -> bool:
    if left is None and right is None:
        return True
    if left is None or right is None:
        return False
    try:
        return math.isclose(float(left), float(right), abs_tol=0.001)
    except (TypeError, ValueError):
        return False


def build_staging_rows(
    rows: list[dict[str, Any]],
    existing: dict[str, dict[str, Any]],
    warning: str | None = None,
) -> list[dict[str, Any]]:
    staging_rows: list[dict[str, Any]] = []

    for index, row in enumerate(rows, start=2):
        errors: list[str] = []
        warnings: list[str] = []
        if warning:
            warnings.append(warning)

        name = row.get("name")
        bundesland = row.get("bundesland")
        hebesatz_b = row.get("hebesatz_b")
        existing_row = existing.get(name) if name else None

        if not name:
            errors.append("Gemeindename fehlt.")
        if not bundesland:
            errors.append("Bundesland fehlt.")
        if hebesatz_b is None:
            errors.append("Grundsteuer B fehlt.")

        if existing_row and row.get("datenstand") and existing_row.get("datenstand"):
            if row["datenstand"] < existing_row["datenstand"]:
                warnings.append("Datenstand ist älter als der bestehende Datensatz.")

        compared_fields = (
            "hebesatz_a",
            "hebesatz_b",
            "hebesatz_b_wohnen",
            "hebesatz_b_nichtwohnen",
            "hebesatz_gewerbe",
        )
        has_conflict = bool(
            existing_row
            and any(
                field in row and not _same_number(row.get(field), existing_row.get(field))
                for field in compared_fields
            )
        )

        if errors:
            status = "error"
        elif has_conflict:
            status = "conflict"
        elif warnings:
            status = "warning"
        else:
            status = "valid"

        old_b = existing_row.get("hebesatz_b") if existing_row else None
        delta_b = None
        if hebesatz_b is not None and old_b is not None:
            delta_b = round(float(hebesatz_b) - float(old_b), 2)

        staging_rows.append({
            "row_number": index,
            "status": status,
            "action": "update" if existing_row else "create",
            "municipality_id": existing_row.get("id") if existing_row else None,
            "raw_data": row,
            "errors": errors,
            "warnings": warnings,
            "existing_snapshot": existing_row,
            "name": name,
            "bundesland": bundesland,
            "kreis": row.get("kreis"),
            "hebesatz_a": row.get("hebesatz_a"),
            "hebesatz_b": hebesatz_b,
            "hebesatz_b_wohnen": row.get("hebesatz_b_wohnen"),
            "hebesatz_b_nichtwohnen": row.get("hebesatz_b_nichtwohnen"),
            "hebesatz_gewerbe": row.get("hebesatz_gewerbe"),
            "vorjahr_b": old_b,
            "datenstand": row.get("datenstand"),
            "quellenname": row.get("quellenname"),
            "quellen_url": row.get("quellen_url"),
            "delta_b": delta_b,
        })

    return staging_rows


def stage_import_run(
    supabase_url: str,
    service_key: str,
    source_name: str,
    source_url: str | None,
    data_stand: str,
    staging_rows: list[dict[str, Any]],
) -> tuple[str | None, int]:
    if not supabase_url or not service_key:
        print("  FEHLER: SUPABASE_URL oder SUPABASE_SERVICE_KEY nicht gesetzt")
        return None, len(staging_rows)

    summary = {
        "total_rows": len(staging_rows),
        "valid_rows": sum(1 for row in staging_rows if row["status"] == "valid"),
        "warning_rows": sum(1 for row in staging_rows if row["status"] == "warning"),
        "error_rows": sum(1 for row in staging_rows if row["status"] == "error"),
        "conflict_rows": sum(1 for row in staging_rows if row["status"] == "conflict"),
        "new_rows": sum(1 for row in staging_rows if row["action"] == "create" and row["status"] != "error"),
        "update_rows": sum(1 for row in staging_rows if row["action"] == "update" and row["status"] != "error"),
        "skipped_rows": sum(1 for row in staging_rows if row["action"] == "skip"),
    }

    headers = supabase_headers(service_key)
    headers["Prefer"] = "return=representation"
    run_payload = {
        "source_name": source_name,
        "source_url": source_url,
        "data_stand": data_stand,
        "status": "validated",
        **summary,
    }

    errors = 0
    with httpx.Client(timeout=30.0) as client:
        run_resp = client.post(
            f"{supabase_url}/rest/v1/import_runs",
            headers=headers,
            json=run_payload,
        )
        if run_resp.status_code not in (200, 201):
            print(f"  FEHLER: Importlauf konnte nicht angelegt werden: HTTP {run_resp.status_code}")
            print(f"  {run_resp.text[:300]}")
            return None, len(staging_rows)

        run_id = run_resp.json()[0]["id"]
        rows_headers = supabase_headers(service_key)
        for i in range(0, len(staging_rows), BATCH_SIZE):
            batch = [
                {
                    **row,
                    "import_run_id": run_id,
                }
                for row in staging_rows[i : i + BATCH_SIZE]
            ]
            resp = client.post(
                f"{supabase_url}/rest/v1/import_rows",
                headers=rows_headers,
                json=batch,
                timeout=30.0,
            )
            if resp.status_code not in (200, 201, 204):
                errors += len(batch)
                print(f"    HTTP {resp.status_code}: {resp.text[:300]}")
            else:
                print(f"    Batch {i // BATCH_SIZE + 1}: {len(batch)} Zeilen vorgemerkt")

    return run_id, errors
