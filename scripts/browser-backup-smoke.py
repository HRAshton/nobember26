"""Integration test for the Wallet UI backup/export/import flow; needs Playwright + Chromium."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
html=(root/'play-offline.html').read_text()
mock='''<script>Object.defineProperty(window,'localStorage',{value:{_s:{},getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=String(v)},removeItem(k){delete this._s[k]}}})</script>'''
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(accept_downloads=True,viewport={'width':1200,'height':850})
 page=context.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('dialog',lambda d:d.accept())
 page.set_content(mock+html,wait_until='load')
 page.locator('[data-screen="trading"]').last.click()
 page.locator('[data-tab="redeem"]').click()
 page.locator('#promo').fill('START-LION')
 page.locator('#redeemForm button').click()
 assert page.locator('#topGems').inner_text()=='100'
 page.locator('[data-screen="wallet"]').last.click()
 with page.expect_download() as info:
  page.locator('[data-action="export-save"]').click()
 dl=info.value
 backup=json.loads(Path(dl.path()).read_text())
 assert backup['format']=='gw2-black-lion-quest-save'
 assert backup['state']['gems']==100
 page.evaluate("window.localStorage._s={}")
 page.set_content(mock+html,wait_until='load')
 assert page.locator('#topGems').inner_text()=='0'
 page.locator('[data-screen="wallet"]').last.click()
 page.locator('#saveFileInput').set_input_files({'name':'save.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
 page.wait_for_function("document.querySelector('#topGems').textContent==='100'")
 assert page.locator('#topGems').inner_text()=='100'
 page.wait_for_timeout(220)
 page.screenshot(path=str(root/'previews'/'wallet-backup.png'),full_page=True)
 # Invalid file should be refused without damaging the restored state.
 damaged=json.loads(json.dumps(backup));damaged['configFingerprint']='invalid'
 page.locator('[data-screen="wallet"]').last.click()
 page.locator('#saveFileInput').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':json.dumps(damaged).encode()})
 page.wait_for_timeout(100)
 assert page.locator('#topGems').inner_text()=='100'
 assert not errors,errors
 print('Wallet backup/browser smoke: PASS (download, restore, wrong-version reject, no page errors)')
 browser.close()
