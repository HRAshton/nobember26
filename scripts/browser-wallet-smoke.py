"""Check the currency Wallet and automatic progress saving without transfer UI."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_runtime import launch_browser, load_document

root=Path(__file__).resolve().parent.parent
html=(root/'play-offline.html').read_text(encoding='utf8')

def document(saved=None):
    return '<script>Object.defineProperty(window,"localStorage",{value:{_s:'+json.dumps(saved or {})+',getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=String(v)},removeItem(k){delete this._s[k]}}})</script>'+html

def check_wallet(page, gems, keys):
    page.locator('[data-screen="wallet"]:visible').first.click()
    balances=[''.join(text.split()) for text in page.locator('.wallet-line strong').all_text_contents()]
    assert balances==[str(gems),'0g00s00c',str(keys)],balances
    assert page.locator('.save-controls, .save-buttons, #saveFileInput, [data-action="export-save"], [data-action="import-save"]').count()==0
    assert 'Local Save' not in page.locator('.wallet-screen').inner_text()
    assert page.locator('.wallet-screen input[type="file"]').count()==0
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')

with sync_playwright() as p:
    browser=launch_browser(p)
    page=browser.new_page(viewport={'width':1200,'height':850})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    load_document(page,document())
    page.locator('[data-screen="trading"]').first.click()
    page.locator('[data-tab="redeem"]').click()
    page.locator('#promo').fill('START-LION')
    page.locator('#redeemForm button').click()
    check_wallet(page,100,0)
    saved=page.evaluate('localStorage._s')
    load_document(page,document(saved))
    check_wallet(page,100,0)
    page.locator('.wallet-screen [data-screen="trading"]').click()
    page.locator('[data-action="buy-key"]').click()
    check_wallet(page,0,1)
    saved=page.evaluate('localStorage._s')
    load_document(page,document(saved))
    check_wallet(page,0,1)
    page.screenshot(path=str(root/'previews/wallet.png'),full_page=True)
    mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    mobile.on('pageerror',lambda e:errors.append(str(e)))
    load_document(mobile,document(saved))
    check_wallet(mobile,0,1)
    mobile.screenshot(path=str(root/'previews/wallet-mobile.png'),full_page=True)
    assert not errors,errors
    browser.close()
print('Wallet smoke: PASS (balances, automatic saving, reload, mobile, no import/export UI)')
