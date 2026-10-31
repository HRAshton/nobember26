#!/usr/bin/env python3
"""Visual QA: make a contact sheet of generated local slices; no network requests."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,math
base=Path(__file__).resolve().parents[1]
path=base/'assets/real-ui/asset-report.json'
if not path.exists():raise SystemExit('Run finish_local.py first.')
entries=json.loads(path.read_text(encoding='utf8'))['elements']
if not entries:raise SystemExit('No slices to inspect.')
w,h=236,206;cols=4;rows=math.ceil(len(entries)/cols)
out=Image.new('RGB',(w*cols,h*rows),'#242930');d=ImageDraw.Draw(out)
for i,(name,meta) in enumerate(sorted(entries.items())):
 x=(i%cols)*w;y=(i//cols)*h
 im=Image.open(base/'assets/real-ui'/meta['file']).convert('RGBA')
 im.thumbnail((w-18,h-53))
 bg=Image.new('RGBA',im.size,'#383a3b');bg.alpha_composite(im)
 out.paste(bg.convert('RGB'),(x+(w-im.width)//2,y+10))
 d.text((x+9,y+h-33),name,fill='#f0dfc5')
 d.text((x+9,y+h-17),str(meta['size']),fill='#a5adba')
target=base/'assets/real-ui/contact-sheet.png';out.save(target)
print(target)
