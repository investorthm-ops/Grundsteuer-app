# -*- coding: utf-8 -*-
import io, re

src = r'C:\Users\User\Documents\Claude\GrundsteuerMonitor\.claude\worktrees\musing-nightingale-d48d68\supabase\migrations\0013_hessen_hebesaetze_2024_genesis.sql'
text = io.open(src, encoding='utf-8').read()

# extract value rows (lines starting with two spaces and "(")
lines = text.splitlines()
val_lines = [ln for ln in lines if ln.startswith("  ('")]
# strip trailing comma on each for clean rejoin
val_lines = [ln.rstrip(',') for ln in val_lines]
print('value rows:', len(val_lines))

head = """insert into public.municipalities
  (name, bundesland, hebesatz_a, hebesatz_b, hebesatz_gewerbe, datenstand, quellenstatus, quellenname, quellen_url)
values
"""
foot = """
on conflict (bundesland, name) do update set
  vorjahr_b        = municipalities.hebesatz_b,
  hebesatz_a       = excluded.hebesatz_a,
  hebesatz_b       = excluded.hebesatz_b,
  hebesatz_gewerbe = excluded.hebesatz_gewerbe,
  datenstand       = excluded.datenstand,
  quellenstatus    = excluded.quellenstatus,
  quellenname      = excluded.quellenname,
  quellen_url      = excluded.quellen_url,
  updated_at       = now();
"""

size = 105
batches = [val_lines[i:i+size] for i in range(0, len(val_lines), size)]
base = r'C:\Users\User\Documents\Claude\GrundsteuerMonitor\.claude\worktrees\musing-nightingale-d48d68\scripts'
for idx, b in enumerate(batches, 1):
    out = head + ",\n".join(b) + foot
    p = base + r'\hessen_batch_p%d.sql' % idx
    io.open(p, 'w', encoding='utf-8').write(out)
    print('batch', idx, 'rows', len(b), '->', p)
