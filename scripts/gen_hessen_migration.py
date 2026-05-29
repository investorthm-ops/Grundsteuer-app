# -*- coding: utf-8 -*-
import json, io

src = r'C:\Users\User\.claude\projects\C--Users-User-Documents-Claude-GrundsteuerMonitor--claude-worktrees-musing-nightingale-d48d68\bba344c2-5cbd-4826-bb9f-a092bb5895f3\tool-results\mcp-grundsteuer-import-grundsteuer_fetch_hebesaetze-1780060583697.txt'
inner = json.loads(json.load(io.open(src, encoding='utf-8'))['result'])
gem = [x for x in inner['gemeinden'] if x.get('grundsteuer_b') is not None]

db_raw = "Aarbergen|Abtsteinach|Ahnatal|Alheim|Allendorf (Eder)|Allendorf (Lumda)|Alsbach-Hähnlein|Alsfeld|Altenstadt|Amöneburg|Angelburg|Antrifttal|Aßlar|Babenhausen|Bad Arolsen|Bad Camberg|Bad Emstal|Bad Endbach|Bad Hersfeld|Bad Homburg v. d. Höhe|Bad Karlshafen|Bad König|Bad Nauheim|Bad Orb|Bad Salzschlirf|Bad Schwalbach|Bad Soden am Taunus|Bad Soden-Salmünster|Bad Sooden-Allendorf|Bad Vilbel|Bad Wildungen|Bad Zwesten|Battenberg (Eder)|Baunatal|Bebra|Bensheim|Berkatal|Beselich|Biblis|Bickenbach|Biebergemünd|Biebertal|Biebesheim am Rhein|Biedenkopf|Birkenau|Birstein|Bischoffen|Bischofsheim|Borken (Hessen)|Brachttal|Braunfels|Brechen|Breidenbach|Breitenbach a. Herzberg|Breitscheid|Brensbach|Breuberg|Breuna|Brombachtal|Bromskirchen|Bruchköbel|Büdingen|Burghaun|Burgwald|Bürstadt|Buseck|Büttelborn|Butzbach|Calden|Cölbe|Cornberg|Darmstadt|Dautphetal|Dieburg|Diemelsee|Diemelstadt|Dietzenbach|Dietzhölztal|Dillenburg|Dipperz|Dornburg|Dreieich|Driedorf|Ebersburg|Ebsdorfergrund|Echzell|Edermünde|Edertal|Egelsbach|Ehrenberg (Rhön)|Ehringshausen|Eichenzell|Einhausen|Eiterfeld|Elbtal|Eltville am Rhein|Elz|Eppertshausen|Eppstein|Erbach|Erlensee|Erzhausen|Eschborn|Eschenburg|Eschwege|Espenau|Feldatal|Felsberg|Fernwald|Fischbachtal|Flieden|Flörsbachtal|Flörsheim am Main|Florstadt|Frankenau|Frankenberg (Eder)|Frankfurt am Main|Fränkisch-Crumbach|Freiensteinau|Freigericht|Friedberg (Hessen)|Friedewald|Friedrichsdorf|Frielendorf|Fritzlar|Fronhausen|Fulda|Fuldabrück|Fuldatal|Fürth|Gedern|Geisenheim|Gelnhausen|Gemünden (Felda)|Gemünden (Wohra)|Gernsheim|Gersfeld (Rhön)|Gießen|Gilserberg|Ginsheim-Gustavsburg|Gladenbach|Glashütten|Glauburg|Gorxheimertal|Grasellenbach|Grävenwiesbach|Grebenau|Grebenhain|Grebenstein|Greifenstein|Griesheim|Groß-Bieberau|Groß-Gerau|Groß-Rohrheim|Groß-Umstadt|Groß-Zimmern|Großalmerode|Großenlüder|Großkrotzenburg|Grünberg|Gründau|Gudensberg|Guxhagen|Habichtswald|Hadamar|Haiger|Haina (Kloster)|Hainburg|Hammersbach|Hanau|Hasselroth|Hattersheim am Main|Hatzfeld (Eder)|Hauneck|Haunetal|Heidenrod|Helsa|Heppenheim (Bergstraße)|Herborn|Herbstein|Heringen (Werra)|Herleshausen|Hessisch Lichtenau|Heuchelheim a. d. Lahn|Heusenstamm|Hilders|Hirschhorn (Neckar)|Hirzenhain|Hochheim am Main|Höchst i. Odw.|Hofbieber|Hofgeismar|Hofheim am Taunus|Hohenahr|Hohenroda|Hohenstein|Homberg (Efze)|Homberg (Ohm)|Hosenfeld|Hünfeld|Hünfelden|Hungen|Hünstetten|Hüttenberg|Idstein|Immenhausen|Jesberg|Jossgrund|Kalbach|Karben|Kassel|Kaufungen|Kefenrod|Kelkheim (Taunus)|Kelsterbach|Kiedrich|Kirchhain|Kirchheim|Kirtorf|Knüllwald|Königstein im Taunus|Korbach|Körle|Kriftel|Kronberg im Taunus|Künzell|Lahnau|Lahntal|Lampertheim|Langen (Hessen)|Langenselbold|Langgöns|Laubach|Lauterbach (Hessen)|Lautertal (Odenwald)|Lautertal (Vogelsberg)|Leun|Lich|Lichtenfels|Liebenau|Liederbach am Taunus|Limburg a. d. Lahn|Limeshain|Linden|Lindenfels|Linsengericht|Lohfelden|Löhnberg|Lohra|Lollar|Lorch|Lorsch|Ludwigsau|Lützelbach|Mainhausen|Maintal|Malsfeld|Marburg|Meinhard|Meißner|Melsungen|Mengerskirchen|Merenberg|Messel|Michelstadt|Mittenaar|Modautal|Mörfelden-Walldorf|Mörlenbach|Morschen|Mossautal|Mücke|Mühlheim am Main|Mühltal|Münchhausen|Münster (Hessen)|Münzenberg|Nauheim|Naumburg|Neckarsteinach|Nentershausen|Neu-Anspach|Neu-Eichenberg|Neu-Isenburg|Neuberg|Neuenstein|Neuental|Neuhof|Neukirchen|Neustadt (Hessen)|Nidda|Niddatal|Nidderau|Niedenstein|Niederaula|Niederdorfelden|Niedernhausen|Nieste|Niestetal|Nüsttal|Ober-Mörlen|Ober-Ramstadt|Oberaula|Obertshausen|Oberursel (Taunus)|Oberzent|Oestrich-Winkel|Offenbach am Main|Ortenberg|Ottrau|Otzberg|Petersberg|Pfungstadt|Philippsthal (Werra)|Pohlheim|Poppenhausen (Wasserkuppe)|Rabenau|Ranstadt|Rasdorf|Raunheim|Rauschenberg|Reichelsheim (Odenwald)|Reichelsheim (Wetterau)|Reinhardshagen|Reinheim|Reiskirchen|Riedstadt|Rimbach|Ringgau|Rockenberg|Rodenbach|Rödermark|Rodgau|Romrod|Ronneburg|Ronshausen|Rosbach v. d. Höhe|Rosenthal|Roßdorf|Rotenburg a. d. Fulda|Rüdesheim am Rhein|Runkel|Rüsselsheim am Main|Schaafheim|Schauenburg|Schenklengsfeld|Schlangenbad|Schlitz|Schlüchtern|Schmitten im Taunus|Schöffengrund|Schöneck|Schotten|Schrecksbach|Schwalbach am Taunus|Schwalmstadt|Schwalmtal|Schwarzenborn|Seeheim-Jugenheim|Seligenstadt|Selters (Taunus)|Siegbach|Sinn|Sinntal|Söhrewald|Solms|Sontra|Spangenberg|Stadtallendorf|Staufenberg|Steffenberg|Steinau an der Straße|Steinbach (Taunus)|Stockstadt am Rhein|Sulzbach (Taunus)|Tann (Rhön)|Taunusstein|Trebur|Trendelburg|Twistetal|Ulrichstein|Usingen|Vellmar|Viernheim|Villmar|Vöhl|Volkmarsen|Wabern|Wächtersbach|Wald-Michelbach|Waldbrunn (Westerwald)|Waldeck|Waldems|Waldkappel|Waldsolms|Walluf|Wanfried|Wartenberg|Wehretal|Wehrheim|Weilburg|Weilmünster|Weilrod|Weimar (Lahn)|Weinbach|Weißenborn|Weiterstadt|Wesertal|Wettenberg|Wetter (Hessen)|Wetzlar|Wiesbaden|Wildeck|Willingen (Upland)|Willingshausen|Witzenhausen|Wohratal|Wölfersheim|Wolfhagen|Wöllstadt|Zierenberg|Zwingenberg"
db_names = set(db_raw.split('|'))

special = {'Bad Homburg v.d.Höhe': 'Bad Homburg v. d. Höhe'}

def normalize(n):
    base = n.split(',', 1)[0].strip() if ',' in n else n.strip()
    return special.get(base, base)

rows = []
seen = {}
collisions = []
for x in gem:
    norm = normalize(x['name'])
    if norm not in db_names:
        print('STILL UNMATCHED:', repr(x['name']), '->', repr(norm)); continue
    if norm in seen:
        collisions.append((norm, seen[norm], x['name']))
    seen[norm] = x['name']
    rows.append((norm, x['grundsteuer_a'], x['grundsteuer_b'], x['gewerbesteuer']))

print('collisions:', collisions)
print('rows to write:', len(rows))
bad = [r for r in rows if 'Ã' in r[0] or '�' in r[0]]
print('mojibake rows:', len(bad))

def sql_str(s):
    return "'" + s.replace("'", "''") + "'"

def sql_int(v):
    return 'null' if v is None else str(int(v))

header = """-- 0013_hessen_hebesaetze_2024_genesis.sql
-- Update von Hessen-Gemeinden mit Hebesaetzen 2024.
-- Quelle: Regionalstatistik GENESIS, Tabelle 71231-01-03-5 (Berichtsjahr 2024).
-- Namen wurden auf das bestehende DB-Format normalisiert (Suffixe wie ', Stadt'
-- entfernt), damit der Upsert ueber (bundesland, name) bestehende Zeilen
-- aktualisiert statt Duplikate anzulegen. Bei Update wird der bisherige
-- hebesatz_b als vorjahr_b gesichert.

insert into public.municipalities
  (name, bundesland, hebesatz_a, hebesatz_b, hebesatz_gewerbe, datenstand, quellenstatus, quellenname, quellen_url)
values
"""
vals = []
for norm, a, b, gw in rows:
    vals.append(f"  ({sql_str(norm)}, 'Hessen', {sql_int(a)}, {sql_int(b)}, {sql_int(gw)}, date '2024-12-31', 'bestaetigt', 'Regionalstatistik GENESIS, Tabelle 71231-01-03-5', 'https://www.regionalstatistik.de')")
footer = """
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
out = header + ",\n".join(vals) + footer
dest = r'C:\Users\User\Documents\Claude\GrundsteuerMonitor\.claude\worktrees\musing-nightingale-d48d68\supabase\migrations\0013_hessen_hebesaetze_2024_genesis.sql'
io.open(dest, 'w', encoding='utf-8').write(out)
print('written:', dest)
