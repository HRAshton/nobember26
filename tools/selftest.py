#!/usr/bin/env python3
"""Offline compiler regression test using only synthetic, original geometry."""
import json, subprocess, sys, tempfile, shutil
from pathlib import Path
from PIL import Image,ImageDraw
script=Path(__file__).with_name('finish_local.py')
with tempfile.TemporaryDirectory(prefix='gw2-local-compiler-') as td:
    root=Path(td)
    for p in ['tools','local-input/screenshots','local-input/ready-slices','assets/real-ui']:(root/p).mkdir(parents=True,exist_ok=True)
    shutil.copy2(script,root/'tools/finish_local.py')
    shutil.rmtree(root/'local-input/ready-slices')
    result=subprocess.run([sys.executable,str(root/'tools/finish_local.py'),'--check'],capture_output=True,text=True,timeout=30)
    assert result.returncode==0 and 'MISSING CORE:' in result.stdout,(result.stdout,result.stderr)
    (root/'local-input/ready-slices').mkdir()
    im=Image.new('RGBA',(100,80),'#a6a1aa');d=ImageDraw.Draw(im);d.rectangle((8,8,50,42),outline='#3b2c20',width=3)
    im.save(root/'local-input/screenshots/sample.png')
    (root/'local-input/slices.local.json').write_text(json.dumps({'version':1,'regions':[{'name':'slot_empty','file':'sample.png','rect':[8,8,42,34]}]}))
    im2=Image.new('RGB',(18,18),'#d4ad72');im2.save(root/'local-input/ready-slices/item_key.png')
    result=subprocess.run([sys.executable,str(root/'tools/finish_local.py')],capture_output=True,text=True,timeout=30)
    assert result.returncode==0,(result.stdout,result.stderr)
    assert Image.open(root/'assets/real-ui/slot_empty.png').size==(42,34)
    assert Image.open(root/'assets/real-ui/item_key.png').size==(18,18)
    assert '.item-slot' in (root/'assets/real-ui/skin.css').read_text()
    assert 'key' in (root/'assets/real-ui/asset-map.js').read_text()
    bad=json.dumps({'version':1,'regions':[{'name':'slot_empty','file':'../elsewhere.png','rect':[0,0,1,1]}]})
    (root/'local-input/slices.local.json').write_text(bad)
    result=subprocess.run([sys.executable,str(root/'tools/finish_local.py')],capture_output=True,text=True,timeout=30)
    assert result.returncode!=0, 'unsafe path accepted'
print('PASS: screen crops + ready-slices precedence + CSS + icon map + traversal rejection')
