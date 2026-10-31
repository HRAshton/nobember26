#!/usr/bin/env python3
"""Local-only image slicer + drop-in GW2 Quest skin compiler.

No network access. Does not include or fetch any game assets.
Images are processed solely on the user's computer.
"""
from __future__ import annotations
import argparse, hashlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'local-input' / 'screenshots'
READY = ROOT / 'local-input' / 'ready-slices'
DEST = ROOT / 'assets' / 'real-ui'
MAP_FILE = ROOT / 'local-input' / 'slices.local.json'

# Slots with compatible selectors already present in the v1.0 frontend.
CSS_TARGETS = {
    'window_frame': '.game-window::before',
    'window_title': '.window-titlebar',
    'slot_empty': '.inventory-bag-area .item-slot',
    'hud_top': '.hud-top',
    'button': '.ingame-button',
    'chest_panel': '.chest-modal',
    'merchant_panel': '.game-window[data-screen="merchant"]',
    'trading_panel': '.game-window[data-screen="trading"]',
    'inventory_panel': '.game-window[data-screen="inventory"]',
    'wallet_panel': '.game-window[data-screen="wallet"]',
    'world_background': '.landscape',
    'book_pages': '.book-spread',
    'tooltip': '.item-tooltip',
    'menu_bar': '.game-menu-bar',
    'health_orb': '.skillbar-health',
    'minimap': '.mini-map-surface',
    'skill_a': '.skill-a',
    'skill_b': '.skill-b',
    'skill_c': '.skill-c',
    'skill_d': '.skill-d',
    'skill_e': '.skill-e',
    'skill_f': '.skill-f',
    'skill_g': '.skill-g',
}
# Use image file names item_chest.png, item_key.png, etc.
ITEMS = ['chest','key','gem','crest','book-1','book-2','book-3','book-final',
         'junk-seal','junk-tooth','junk-box', 'material-dust','material-ore',
         'material-shard','material-eternal','collectible-anchor',
         'collectible-caravan','collectible-captain','collectible-sigil','collectible-final',
         'bag','menu-inventory','menu-merchant','menu-trading','menu-wallet','deposit','compact']
VALID_NAMES = set(CSS_TARGETS)|{'item_'+x for x in ITEMS}
REQUIRED_FOR_STRICT = {'window_frame','window_title','slot_empty','chest_panel','merchant_panel','trading_panel'}


def check_rel(base: Path, name: str) -> Path:
    """Never load arbitrary paths from a copied mapping JSON."""
    if not isinstance(name,str) or not re.fullmatch(r'[\w .-]+\.(png|jpg|jpeg|webp)',name,re.I):
        raise ValueError(f'Unsafe or unsupported filename: {name!r}')
    p = (base / name).resolve()
    if p.parent != base.resolve():
        raise ValueError('Image must be directly inside ' + str(base))
    return p


def read_regions() -> list[dict]:
    if not MAP_FILE.exists(): return []
    data = json.loads(MAP_FILE.read_text(encoding='utf8'))
    if not isinstance(data,dict) or data.get('version') != 1 or not isinstance(data.get('regions'),list):
        raise ValueError('slices.local.json must be {"version":1,"regions":[...]}')
    return data['regions']


def make_images() -> tuple[dict, list]:
    from PIL import Image
    entries, warnings = {}, []
    for region in read_regions():
        name = region.get('name')
        if name not in VALID_NAMES: raise ValueError(f'Unknown slice name: {name!r}')
        if name in entries: raise ValueError('Duplicate region: ' + name)
        src = check_rel(SOURCE, region.get('file'))
        if not src.is_file(): raise FileNotFoundError('Missing screenshot: ' + str(src))
        xywh = region.get('rect')
        if not isinstance(xywh,list) or len(xywh)!=4 or any(type(n) is not int for n in xywh):
            raise ValueError(f'Invalid [x,y,width,height] for {name}: {xywh}')
        x,y,w,h = xywh
        with Image.open(src) as original:
            if x<0 or y<0 or w<=0 or h<=0 or x+w>original.width or y+h>original.height:
                raise ValueError(f'Slice out of screenshot bounds for {name}: {xywh}, image {original.size}')
            cropped = original.convert('RGBA').crop((x,y,x+w,y+h))
        target = DEST / (name+'.png')
        cropped.save(target,optimize=True)
        entries[name]={'file':target.name,'size':[w,h],'source':'screenshots/'+src.name}
        if 'slice' in region: entries[name]['slice'] = validate_slice(region['slice'],w,h)
    for name in sorted(VALID_NAMES):
        # Pre-cut images override crop instructions. This is easier when art is already sliced.
        found = next((READY/(name+ext) for ext in ('.png','.webp','.jpg','.jpeg') if (READY/(name+ext)).is_file()),None)
        if found:
            with Image.open(found) as original:
                if original.width<4 or original.height<4: raise ValueError(f'Image too small: {found.name}')
                original.convert('RGBA').save(DEST/(name+'.png'),optimize=True)
                dims=[original.width,original.height]
            entries[name]={'file':name+'.png','size':dims,'source':'ready-slices/'+found.name}
    if entries and 'window_frame' in entries and 'slice' not in entries['window_frame']:
        w,h = entries['window_frame']['size']
        # default nine-slice (adjust for best results in slicing metadata)
        entries['window_frame']['slice']=validate_slice([max(2,min(20,w//5)),max(2,min(20,h//5)),max(2,min(20,w//5)),max(2,min(20,h//5))],w,h)
        warnings.append('window_frame uses automatic 20px/default nine-slice; tune in mapping for pixel-perfect edges.')
    return entries,warnings


def validate_slice(s,w,h):
    if not isinstance(s,list) or len(s)!=4 or any(type(i) is not int or i<1 for i in s):
        raise ValueError('slice must be four positive integers [left,top,right,bottom]')
    l,t,r,b=s
    if l+r>=w or t+b>=h: raise ValueError('nine-slice margins must leave a nonempty center')
    return s


def css_for(entries):
    out=['/* Generated from local images; provenance: docs/ASSET_SOURCES.json. */',
         '/* To disable, remove this stylesheet link from index.html. */']
    for name in sorted(CSS_TARGETS):
        if name not in entries: continue
        url=entries[name]['file']
        sel=CSS_TARGETS[name]
        if name=='window_frame':
            l,t,r,b=entries[name]['slice']
            out.append(f'''{sel}{{content:"";position:absolute;inset:0;pointer-events:none;box-sizing:border-box;border-style:solid;border-width:{t}px {r}px {b}px {l}px;border-image-source:url("{url}");border-image-slice:{t} {r} {b} {l};border-image-width:{t}px {r}px {b}px {l}px;border-image-repeat:stretch;}}''')
        elif name=='slot_empty':
            out.append(f'{sel}, .inventory-bag-area .item-slot.slot-empty{{background-image:url("{url}");background-size:100% 100%;background-repeat:no-repeat;}}')
        elif name=='world_background':
            out.append(f'{sel}{{background-image:url("{url}");background-position:center;background-size:cover;}}')
        else:
            out.append(f'{sel}{{background-image:url("{url}");background-position:center;background-size:100% 100%;background-repeat:no-repeat;}}')
    return '\n'.join(out)+'\n'


def main():
    ap=argparse.ArgumentParser(description='Compile local screenshot crops into the existing interactive GW2 quest. Offline-only.')
    ap.add_argument('--check',action='store_true',help='List inputs and readiness without altering anything')
    ap.add_argument('--strict',action='store_true',help='Require essential six UI elements')
    ap.add_argument('--standalone',action='store_true',help='Regenerate embedded play-offline.html after compilation')
    args=ap.parse_args()
    regions=read_regions()
    declared={r.get('name') for r in regions}
    available={p.stem for p in READY.iterdir() if p.is_file() and p.suffix.lower() in ('.png','.webp','.jpg','.jpeg')} if READY.is_dir() else set()
    sources=declared|available
    missing=sorted(REQUIRED_FOR_STRICT-sources)
    if args.check:
        print('INPUTS: ready=',len(available),'regions=',len(declared))
        print('READY:', ', '.join(sorted(sources)) or '(none)')
        print('MISSING CORE:',', '.join(missing) or '(none)')
        print('Capture your own screenshots, mark rectangles in tools/calibrate.html, or supply ready-slices/*.png')
        return 0 if (not missing or not args.strict) else 2
    try:
        from PIL import Image  # optional dependency only needed to actually crop images
    except ImportError:
        print('Pillow missing: run python -m pip install -r requirements-local.txt',file=sys.stderr)
        return 2
    if not sources:
        print('No source images provided. Existing illustrated v1.0 theme remains operational.\n'
              'Open tools/calibrate.html or populate local-input/ready-slices, then run this command again.',file=sys.stderr)
        return 2
    if args.strict and missing:
        print('Missing required UI pieces:',', '.join(missing),file=sys.stderr)
        return 2
    DEST.mkdir(parents=True,exist_ok=True)
    entries,warnings=make_images()
    if not entries: raise ValueError('No valid cropped images generated')
    (DEST/'skin.css').write_text(css_for(entries),encoding='utf8')
    local_icons={name.removeprefix('item_'):'./assets/real-ui/'+v['file'] for name,v in entries.items() if name.startswith('item_')}
    (DEST/'asset-map.js').write_text('window.GW2_LOCAL_ASSETS = '+json.dumps(local_icons,ensure_ascii=False,sort_keys=True)+';\n',encoding='utf8')
    record={'format':1,'image_count':len(entries),'elements':entries,'missing_core':sorted(REQUIRED_FOR_STRICT-set(entries))}
    record['image_sha256']={name:hashlib.sha256((DEST/v['file']).read_bytes()).hexdigest() for name,v in entries.items()}
    (DEST/'asset-report.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf8')
    if args.standalone:
        import subprocess
        subprocess.run([sys.executable,str(ROOT/'build_standalone.py')],cwd=ROOT,check=True)
    print(f'OK: {len(entries)} local slices integrated. CSS and icon map generated. No network requests were made.')
    print('Still missing:',', '.join(record['missing_core']) or 'no essential UI pieces')
    for warning in warnings:print('NOTE:',warning)
    return 0

if __name__=='__main__':
    try: sys.exit(main())
    except Exception as exc:
        print('ERROR:',exc,file=sys.stderr);sys.exit(1)
