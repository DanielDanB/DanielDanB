#!/usr/bin/env python3
"""Načte PREHLED_ZAKAZEK_NOVY.xlsx a vytvoří data.json.
   Sloučené buňky se rozpouštějí do všech řádků, jinak by navazující
   řádky jedné zakázky přišly o název, číslo i termíny."""
import openpyxl, json, datetime, re, sys, collections, os

SRC = sys.argv[1] if len(sys.argv) > 1 else '/root/.claude/uploads/4bd30a38-3d51-5574-953c-342e4408e8c7/db046918-01_PREHLED_ZAKAZEK_NOVY.xlsx'
DEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')

LEGACY = {'name':1,'qty':2,'status':3,'requester':4,'code':5,'order':6,'dateOrder':7,'dateRequired':8,'dateDelivered':9,'invoice':10}
MID    = {'name':1,'qty':2,'status':3,'requester':4,'codePrefix':5,'codeNum':6,'center':7,'order':8,'dateOrder':9,'dateRequired':10,'dateDelivered':11,'invoice':12}
NEW    = {'name':1,'qty':2,'status':3,'requester':4,'owner':5,'codePrefix':6,'codeNum':7,'center':8,'order':9,'dateOrder':10,
          'planDesign':11,'planProd':12,'planAssembly':13,'planTuning':14,'dateRequired':15,'dateDelivered':16,'priority':17,'invoice':18}
LAYOUT = dict([(y, LEGACY) for y in ('2017','2018','2019','2020')] +
              [(y, MID)    for y in ('2021','2022','2023','2024','2025')] + [('2026', NEW)])
DATEF = set(['dateOrder','dateRequired','dateDelivered','planDesign','planProd','planAssembly','planTuning'])
CANON = {'design':'Design','schvalování':'Schvalování','příprava výroby':'Příprava výroby','výroba':'Výroba',
         'hotovo':'Hotovo','zrušeno':'Zrušeno','storno':'Zrušeno','zruseno':'Zrušeno'}

def as_date(v):
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime('%Y-%m-%d')
    if isinstance(v, str):
        s = v.strip()
        m = re.match(r'^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$', s)
        if m: return '%s-%02d-%02d' % (m.group(3), int(m.group(2)), int(m.group(1)))
    return None

def as_text(v):
    if v is None: return ''
    if isinstance(v, (datetime.datetime, datetime.date)): return v.strftime('%Y-%m-%d')
    if isinstance(v, float) and v == int(v): v = int(v)
    s = str(v).strip()
    return '' if s == '-' else s

def expand_merges(ws):
    """hodnota sloučené oblasti -> do všech jejích buněk"""
    grid = {}
    for rng in list(ws.merged_cells.ranges):
        top = ws.cell(row=rng.min_row, column=rng.min_col).value
        if top is None: continue
        for r in range(rng.min_row, rng.max_row + 1):
            for c in range(rng.min_col, rng.max_col + 1):
                grid[(r, c)] = top
    return grid

def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    orders, skipped = [], 0
    for year, L in sorted(LAYOUT.items()):
        ws = wb[year]
        merged = expand_merges(ws)
        for row in ws.iter_rows(min_row=3, max_row=ws.max_row):
            rn = row[0].row
            def raw(ci):
                v = row[ci - 1].value
                return merged.get((rn, ci)) if v is None else v
            o = {}
            for f, ci in L.items():
                v = raw(ci)
                o[f] = as_date(v) if f in DATEF else as_text(v)
            if 'codePrefix' in L:
                pref = o.pop('codePrefix', '').replace('-', '').strip()
                num = o.pop('codeNum', '').strip()
                o['code'] = ('%s-%s' % (pref, num)) if pref and num else (pref or num)
            # řádek musí nést něco podstatného, ne jen zbytkovou hodnotu ve sloupci
            if not (o.get('name') or o.get('order') or o.get('dateDelivered') or o.get('invoice')):
                skipped += 1
                continue
            raw_status = o.get('status', '')
            o['statusRaw'] = raw_status
            o['status'] = CANON.get(raw_status.lower(), 'Hotovo' if o.get('dateDelivered') else ('Ostatní' if raw_status else 'Nezadáno'))
            o['year'] = int(year)
            o['id'] = '%s-%d' % (year, rn)
            o['row'] = rn
            orders.append(o)

    # co zbylo prázdné po sloučení, doplníme z předchozího řádku téže zakázky
    last = {}
    for o in orders:
        y = o['year']
        if y not in last: last[y] = {}
        for f in ('code', 'name', 'requester', 'center', 'owner'):
            if o.get(f): last[y][f] = o[f]
            elif last[y].get(f):
                o[f] = last[y][f]
                o.setdefault('inherited', []).append(f)

    out = [dict((k, v) for k, v in o.items() if v not in ('', None, [], False)) for o in orders]
    with open(DEST, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
    print('%d zakázek (%d prázdných řádků vynecháno) -> %s' % (len(out), skipped, DEST))
    print('bez názvu:', sum(1 for o in out if not o.get('name')))
    print('podle roku:', dict(sorted(collections.Counter(o['year'] for o in out).items())))

main()
