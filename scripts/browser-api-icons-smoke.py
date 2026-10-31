"""Mock GW2 API for icon-upgrade path; does not require live internet.
   The test deliberately overrides the HTTP-only guard in its in-memory HTML,
   because the test page is loaded with set_content (about:blank).
   The packaged application is NOT modified.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'play-offline.html').read_text()
assert "if(!['http:','https:'].includes(location.protocol))return;" in html
html=html.replace("if(!['http:','https:'].includes(location.protocol))return;","if(false)return;")
# 1x1 png fixture, not any copyrighted art
png=(root/'assets'/'granite-grain.png').read_bytes()
host='https://render.guildwars2.com/file/'
items=[{'id':20316,'icon':host+'A'*40+'/1000.png'},{'id':19980,'icon':host+'B'*40+'/2000.png'}]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('https://api.guildwars2.com/v2/items**',lambda r:r.fulfill(status=200,json=items,headers={'access-control-allow-origin':'*'}))
 page.route('https://render.guildwars2.com/file/**',lambda r:r.fulfill(status=200,content_type='image/png',body=png,headers={'access-control-allow-origin':'*'}))
 page.set_content('''<script>Object.defineProperty(window,'localStorage',{value:{_s:{},getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=String(v)}}})</script>'''+html,wait_until='load')
 page.wait_for_function("document.querySelector('img[data-art=chest]')?.src.includes('render.guildwars2.com')",timeout=5000)
 page.locator('[data-screen="trading"]').first.click()
 page.wait_for_function("document.querySelector('img[data-art=key]')?.src.includes('render.guildwars2.com')",timeout=5000)
 assert page.locator('img[data-art=key]').first.evaluate('(el)=>el.naturalWidth>0')
 assert not errors,errors
 print('GW2 API icon upgrade mock: PASS (local fallback replaced by valid official-domain URLs)')
 browser.close()
