#!/usr/bin/env python3
"""Optional user-run downloader for public GW2 item icons via the official API.

Downloaded images stay on user's computer. This script does not upload images anywhere.
"""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urlparse
import json, sys

ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'local-input'/'ready-slices'
ICONS={20316:'item_chest.png',19980:'item_key.png',24272:'item_material-dust.png',19703:'item_material-ore.png',24273:'item_material-shard.png',24295:'item_material-eternal.png'}

def main():
    OUTPUT.mkdir(parents=True,exist_ok=True)
    url='https://api.guildwars2.com/v2/items?ids='+','.join(map(str,ICONS))+'&lang=en'
    print('Fetching public metadata from official GW2 API...')
    with urlopen(Request(url,headers={'User-Agent':'GW2-LAN-FanQuest/1.0'}),timeout=15) as r:
        items=json.load(r)
    downloaded=0
    for item in items:
        filename=ICONS.get(item.get('id'))
        if not filename:continue
        target=OUTPUT/filename
        if target.is_file(): print('Skip existing file:',filename);continue
        link=item.get('icon','');u=urlparse(link)
        if u.scheme!='https' or u.hostname!='render.guildwars2.com' or not u.path.endswith('.png'):
            print('Skip invalid icon URL for',item['id']);continue
        with urlopen(Request(link,headers={'User-Agent':'GW2-LAN-FanQuest/1.0'}),timeout=15) as r:
            content=r.read(2_000_001)
            if len(content)>2_000_000 or not content.startswith(b'\x89PNG\r\n\x1a\n'):
                raise ValueError('Unexpected icon file contents for '+filename)
        target.write_bytes(content);downloaded+=1
        print('Saved',target.relative_to(ROOT))
    print('Done,',downloaded,'new PNG images. Run tools/finish_local.py next.')

if __name__=='__main__':
    try:main()
    except Exception as e:print('ERROR:',e,file=sys.stderr);sys.exit(1)
