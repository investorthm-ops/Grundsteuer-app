-- 0007_prevent_duplicate_municipalities.sql
-- Prevent exact duplicate municipality records for the same federal state.

create unique index if not exists municipalities_bundesland_name_unique_idx
  on public.municipalities(bundesland, name);
