-- 0022_scraper_import_staging.sql
-- Allow automated scraper runs to land in the approve pipeline first.

alter table public.import_rows
  add column if not exists hebesatz_b_wohnen int check (hebesatz_b_wohnen is null or (hebesatz_b_wohnen between 0 and 3000)),
  add column if not exists hebesatz_b_nichtwohnen int check (hebesatz_b_nichtwohnen is null or (hebesatz_b_nichtwohnen between 0 and 3000));

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
        hebesatz_b_wohnen = v_row.hebesatz_b_wohnen,
        hebesatz_b_nichtwohnen = v_row.hebesatz_b_nichtwohnen,
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
        hebesatz_b_wohnen,
        hebesatz_b_nichtwohnen,
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
        v_row.hebesatz_b_wohnen,
        v_row.hebesatz_b_nichtwohnen,
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

revoke execute on function public.approve_import_rows(uuid, uuid[]) from anon;
revoke execute on function public.approve_import_rows(uuid, uuid[]) from public;
grant execute on function public.approve_import_rows(uuid, uuid[]) to authenticated;
