-- 0002_import_pipeline.sql
-- Schema for PROJ-4: Import- und Quellenpipeline

-- =========================================================
-- import_runs
-- =========================================================
create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  data_stand date not null,
  status text not null default 'validated'
    check (status in ('uploaded', 'validated', 'partially_approved', 'approved', 'discarded', 'failed')),
  total_rows int not null default 0,
  valid_rows int not null default 0,
  warning_rows int not null default 0,
  error_rows int not null default 0,
  conflict_rows int not null default 0,
  new_rows int not null default 0,
  update_rows int not null default 0,
  skipped_rows int not null default 0,
  approved_rows int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists import_runs_created_at_idx on public.import_runs(created_at desc);
create index if not exists import_runs_status_idx on public.import_runs(status);

alter table public.import_runs enable row level security;

drop policy if exists "import_runs_select_admin" on public.import_runs;
create policy "import_runs_select_admin"
  on public.import_runs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

drop policy if exists "import_runs_insert_admin" on public.import_runs;
create policy "import_runs_insert_admin"
  on public.import_runs
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

drop policy if exists "import_runs_update_admin" on public.import_runs;
create policy "import_runs_update_admin"
  on public.import_runs
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- =========================================================
-- import_rows
-- =========================================================
create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.import_runs(id) on delete cascade,
  row_number int not null,
  status text not null
    check (status in ('valid', 'warning', 'error', 'conflict', 'approved', 'skipped')),
  action text not null default 'create'
    check (action in ('create', 'update', 'skip')),
  municipality_id uuid references public.municipalities(id) on delete set null,
  raw_data jsonb not null default '{}'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  existing_snapshot jsonb,
  name text,
  bundesland text,
  kreis text,
  hebesatz_a int check (hebesatz_a is null or (hebesatz_a between 0 and 2000)),
  hebesatz_b int check (hebesatz_b is null or (hebesatz_b between 0 and 2000)),
  hebesatz_gewerbe int check (hebesatz_gewerbe is null or (hebesatz_gewerbe between 0 and 2000)),
  vorjahr_b int check (vorjahr_b is null or (vorjahr_b between 0 and 2000)),
  datenstand date,
  quellenname text,
  quellen_url text,
  delta_b int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (import_run_id, row_number)
);

create index if not exists import_rows_import_run_id_idx on public.import_rows(import_run_id);
create index if not exists import_rows_status_idx on public.import_rows(status);
create index if not exists import_rows_municipality_id_idx on public.import_rows(municipality_id);

alter table public.import_rows enable row level security;

drop policy if exists "import_rows_select_admin" on public.import_rows;
create policy "import_rows_select_admin"
  on public.import_rows
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

drop policy if exists "import_rows_insert_admin" on public.import_rows;
create policy "import_rows_insert_admin"
  on public.import_rows
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

drop policy if exists "import_rows_update_admin" on public.import_rows;
create policy "import_rows_update_admin"
  on public.import_rows
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'admin'
    )
  );

-- =========================================================
-- municipalities source metadata
-- =========================================================
alter table public.municipalities
  add column if not exists source_import_run_id uuid references public.import_runs(id) on delete set null,
  add column if not exists quellenname text,
  add column if not exists quellen_url text;

create index if not exists municipalities_source_import_run_id_idx
  on public.municipalities(source_import_run_id);

-- =========================================================
-- updated_at triggers
-- =========================================================
drop trigger if exists import_runs_set_updated_at on public.import_runs;
create trigger import_runs_set_updated_at
  before update on public.import_runs
  for each row execute function public.set_updated_at();

drop trigger if exists import_rows_set_updated_at on public.import_rows;
create trigger import_rows_set_updated_at
  before update on public.import_rows
  for each row execute function public.set_updated_at();

-- =========================================================
-- approve function
-- =========================================================
create or replace function public.approve_import_rows(p_import_run_id uuid, p_row_ids uuid[] default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean;
  v_row import_rows%rowtype;
  v_approved int := 0;
  v_skipped int := 0;
begin
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ) into v_is_admin;

  if not v_is_admin then
    raise exception 'Forbidden';
  end if;

  for v_row in
    select *
    from public.import_rows
    where import_run_id = p_import_run_id
      and status in ('valid', 'warning', 'conflict')
      and (p_row_ids is null or id = any(p_row_ids))
    order by row_number
  loop
    if v_row.action = 'skip' then
      update public.import_rows set status = 'skipped' where id = v_row.id;
      v_skipped := v_skipped + 1;
    elsif v_row.action = 'update' and v_row.municipality_id is not null then
      update public.municipalities
      set
        name = v_row.name,
        bundesland = v_row.bundesland,
        kreis = v_row.kreis,
        hebesatz_a = v_row.hebesatz_a,
        hebesatz_b = v_row.hebesatz_b,
        hebesatz_gewerbe = v_row.hebesatz_gewerbe,
        vorjahr_b = v_row.vorjahr_b,
        datenstand = v_row.datenstand,
        quellenstatus = 'bestaetigt',
        source_import_run_id = p_import_run_id,
        quellenname = v_row.quellenname,
        quellen_url = v_row.quellen_url
      where id = v_row.municipality_id;

      update public.import_rows set status = 'approved' where id = v_row.id;
      v_approved := v_approved + 1;
    else
      insert into public.municipalities (
        name,
        bundesland,
        kreis,
        hebesatz_a,
        hebesatz_b,
        hebesatz_gewerbe,
        vorjahr_b,
        datenstand,
        quellenstatus,
        created_by,
        source_import_run_id,
        quellenname,
        quellen_url
      )
      values (
        v_row.name,
        v_row.bundesland,
        v_row.kreis,
        v_row.hebesatz_a,
        v_row.hebesatz_b,
        v_row.hebesatz_gewerbe,
        v_row.vorjahr_b,
        v_row.datenstand,
        'bestaetigt',
        auth.uid(),
        p_import_run_id,
        v_row.quellenname,
        v_row.quellen_url
      )
      returning id into v_row.municipality_id;

      update public.import_rows
      set status = 'approved', municipality_id = v_row.municipality_id
      where id = v_row.id;
      v_approved := v_approved + 1;
    end if;
  end loop;

  update public.import_runs
  set
    approved_rows = (
      select count(*) from public.import_rows
      where import_run_id = p_import_run_id and status = 'approved'
    ),
    skipped_rows = (
      select count(*) from public.import_rows
      where import_run_id = p_import_run_id and status = 'skipped'
    ),
    status = case
      when exists (
        select 1 from public.import_rows
        where import_run_id = p_import_run_id
          and status in ('valid', 'warning', 'conflict')
      ) then 'partially_approved'
      else 'approved'
    end
  where id = p_import_run_id;

  return jsonb_build_object('approved', v_approved, 'skipped', v_skipped);
end;
$$;
