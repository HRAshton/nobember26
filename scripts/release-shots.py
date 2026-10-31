from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_runtime import launch_browser, load_document
root=Path(__file__).resolve().parent.parent
out=root/'previews';out.mkdir(exist_ok=True)
html=(root/'play-offline.html').read_text(encoding='utf8')
shim='<script>Object.defineProperty(window,"localStorage",{value:{_s:{},getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=String(v)},removeItem(k){delete this._s[k]}}})</script>'
with sync_playwright() as p:
 browser=launch_browser(p)
 page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 load_document(page, shim+html,wait_until='load')
 page.locator('.game-menu-bar [data-screen="trading"]').click()
 assert page.locator('.store-feature').is_visible()
 page.screenshot(path=str(out/'trading-company.png'),full_page=True)
 page.locator('.game-menu-bar [data-screen="merchant"]').click()
 assert page.locator('.merchant-header').is_visible()
 page.screenshot(path=str(out/'merchant.png'),full_page=True)
 assert not errors,errors
 browser.close()
print('Additional visuals verified: Trading Company / Merchant')
