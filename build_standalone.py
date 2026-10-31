"""Build a single-file playable preview including custom local skin, when available.

Local only; processes already-present image files. No remote downloads.
"""
from pathlib import Path
import base64, json, mimetypes, re
root=Path(__file__).parent
html=(root/'index.html').read_text(encoding='utf8')
css=(root/'style.css').read_text(encoding='utf8')

def image_data(f):
    content = f.read_bytes()
    mime=mimetypes.guess_type(f.name)[0] or 'application/octet-stream'
    return 'data:'+mime+';base64,'+base64.b64encode(content).decode('ascii')

assets={f.stem:image_data(f) for f in (root/'assets').glob('*.svg')}
# Embed CSS game background sources from author's original v1.0 art.
css=re.sub(r"url\(['\"]?(\./assets/[^)'\"]+)['\"]?\)",lambda m:'url("'+image_data(root/m.group(1))+'")' if (root/m.group(1)).is_file() else m.group(0),css)
html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+css+'</style>')
html=html.replace('<link rel="icon" href="./assets/crest.svg" type="image/svg+xml">','')
for name,data in assets.items():
    html=html.replace(f'src="./assets/{name}.svg"',f'src="{data}"')
# Static HUD icons use the same local skin as dynamically rendered items.
html=re.sub(r'(<img\b[^>]*?\bsrc=")(\./assets/[^"<>]+)(")',lambda m:m.group(1)+image_data(root/m.group(2))+m.group(3) if (root/m.group(2)).is_file() else m.group(0),html)

skin=root/'assets/real-ui/skin.css'
if skin.exists():
    skin_css=skin.read_text(encoding='utf8')
    skin_css=re.sub(r'url\(["\']([^"\']+\.png)["\']\)',lambda m:'url("'+image_data(skin.parent/m.group(1))+'")' if (skin.parent/m.group(1)).is_file() else m.group(0),skin_css)
    html=html.replace('<link rel="stylesheet" href="./assets/real-ui/skin.css">','<style>'+skin_css+'</style>')

icon_map={}
map_file=root/'assets/real-ui/asset-map.js'
if map_file.exists():
    content=map_file.read_text(encoding='utf8').strip()
    match=re.fullmatch(r'window\.GW2_LOCAL_ASSETS\s*=\s*(\{.*\});',content,re.S)
    if match:
        for name,src in json.loads(match.group(1)).items():
            img_path=root/src
            if img_path.is_file(): icon_map[name]=image_data(img_path)
html=html.replace('<script src="./assets/real-ui/asset-map.js"></script>',
                  '<script>window.GW2_LOCAL_ASSETS='+json.dumps(icon_map)+';</script>')
app=(root/'app.js').read_text(encoding='utf8')
app=app.replace("const a='./assets/';",'const ASSET_DATA='+json.dumps(assets)+';const a="";')
app=app.replace("(a+name+'.svg')","(ASSET_DATA[name]||'')")
for name in ('config.js','engine.js','sound.js','app.js'):
    script=app if name=='app.js' else (root/name).read_text(encoding='utf8')
    html=html.replace(f'<script src="./{name}"></script>','<script>'+script+'</script>')
(root/'play-offline.html').write_text(html,encoding='utf8')
print('Standalone file:',root/'play-offline.html','bytes:',(root/'play-offline.html').stat().st_size)
