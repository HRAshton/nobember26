"""Optional integration smoke test; requires playwright+Chromium. Captures release previews."""
from pathlib import Path
import time,json
from playwright.sync_api import sync_playwright
from browser_runtime import launch_browser, load_document
root=Path(__file__).resolve().parent.parent
out=root/'previews';out.mkdir(exist_ok=True)
html=(root/'play-offline.html').read_text(encoding='utf8')
def document(saved=None):
 return '<script>Object.defineProperty(window,"localStorage",{value:{_s:'+json.dumps(saved or {})+',getItem(k){return this._s[k]||null},setItem(k,v){this._s[k]=String(v)},removeItem(k){delete this._s[k]}}})</script>'+html
try:
 with sync_playwright() as p:
  browser=launch_browser(p)
  page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[]
  requests=[]
  page.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) and r.url!='https://quest.test/' else None)
  page.on('pageerror',lambda e:errors.append(str(e)))
  load_document(page, document(),wait_until='load')
  assert page.title().endswith('v1.3')
  assert page.locator('[data-item="regular-chest"]').count()==1
  assert page.locator('#audioToggle').get_attribute('aria-pressed')=='false'
  page.screenshot(path=str(out/'desktop.png'),full_page=True)
  page.locator('#audioToggle').click()
  assert page.locator('#audioToggle').get_attribute('aria-pressed')=='true'
  snapshot=page.evaluate('window.localStorage._s')
  load_document(page, document(snapshot),wait_until='load')
  assert page.locator('#audioToggle').get_attribute('aria-pressed')=='true'
  # M shortcut toggles back off, ensuring screenshots are silent.
  page.keyboard.press('m')
  assert page.locator('#audioToggle').get_attribute('aria-pressed')=='false'
  page.locator('[data-item="regular-chest"]').click(button='right')
  page.locator('[data-menu-action="preview"]').click()
  assert page.locator('.chest-preview').is_visible()
  assert 'At the Edge of Dawn' not in page.locator('.chest-preview').inner_text()
  page.screenshot(path=str(out/'chest-preview.png'),full_page=True)
  page.locator('[data-action="close-modal"]').last.click()
  page.locator('[data-item="regular-chest"]').dblclick()
  assert page.locator('.faithful-chest .chest-side').count()==2
  page.screenshot(path=str(out/'chest-window.png'),full_page=True)
  page.locator('[data-action="close-modal"]').last.click()
  for code in ['START-LION','GIFT-ONE','GIFT-TWO']:
   page.locator('[data-screen="trading"]').first.click()
   page.locator('[data-tab="redeem"]').click()
   page.locator('#promo').fill(code)
   page.locator('#redeemForm button').click()
   page.locator('[data-tab="store"]').click()
   page.locator('[data-action="buy-key"]').click()
   page.locator('[data-screen="inventory"]').first.click()
   page.locator('[data-item="regular-chest"]').dblclick()
   page.locator('[data-action="open-chest"]').click()
   assert page.locator('.opening-modal').is_visible()
   page.locator('[data-action="skip-open"]').click()
   assert page.locator('.reward-modal').is_visible()
   # Three pieces of decorative loot first; the clue book is revealed last.
   assert page.locator('[data-inspect-reward]').count()==4
   ids=page.locator('[data-inspect-reward]').evaluate_all('(els)=>els.map(x=>x.dataset.inspectReward)')
   assert ids[-1].startswith('book-'),ids
   if code=='START-LION':
    page.wait_for_timeout(1100)
    page.screenshot(path=str(out/'loot-reveal.png'),full_page=True)
    # A junk item can be inspected from its own reward slot.
    page.locator('[data-inspect-reward]').first.click()
    assert page.locator('.detail-modal').is_visible()
    assert 'Junk' in page.locator('.detail-modal').inner_text()
    page.locator('[data-action="close-modal"]').last.click()
    # The read-journal button opens ONLY the received book.
    # Inspecting an item leaves the reward panel, but the journal is in inventory.
    page.locator('[data-screen="inventory"]').first.click()
    page.locator('[data-item="book-gift-1"]').dblclick()
    assert page.locator('.book-spread').is_visible()
    page.locator('[data-action="close-modal"]').last.click()
   else:
    page.locator('[data-action="read-new-book"]').click()
    assert page.locator('.book-spread').is_visible()
    page.locator('[data-action="close-modal"]').last.click()
  page.locator('[data-screen="inventory"]').first.click()
  page.locator('[data-item="book-gift-1"]').dblclick()
  assert page.locator('.book-spread').is_visible()
  assert page.locator('.book-navigation').inner_text().count('Collected journals')==1
  assert page.locator('.book-navigation button[data-booknav]').count()==2
  assert page.locator('.book-navigation button[data-booknav]').last.is_enabled()
  page.screenshot(path=str(out/'journal-spread.png'),full_page=True)
  page.keyboard.press('ArrowRight')
  assert "The Cartographer's Journal II" in page.locator('.book-modal').inner_text()
  page.keyboard.press('ArrowLeft')
  assert "The Cartographer's Journal I" in page.locator('.book-modal').inner_text()
  page.locator('[data-action="close-modal"]').last.click()
  page.locator('[data-screen="merchant"]').first.click()
  page.locator('[data-action="sell-all"]').click()
  assert '90' in page.locator('.vendor-bottom').inner_text()
  page.locator('[data-screen="trading"]').first.click()
  page.locator('[data-tab="exchange"]').click()
  page.locator('#exchangeQty').fill('90')
  page.locator('#exchangeForm button').click()
  assert page.locator('#topGems').inner_text()=='90'
  page.locator('[data-tab="redeem"]').click()
  page.locator('#promo').fill('LAST-SECRET')
  page.locator('#redeemForm button').click()
  page.locator('[data-tab="store"]').click()
  page.locator('[data-action="buy-key"]').click()
  assert page.locator('.secret-modal').is_visible()
  page.screenshot(path=str(out/'secret-acquired.png'),full_page=True)
  page.locator('[data-action="close-modal"]').last.click()
  page.locator('[data-screen="inventory"]').first.click()
  page.locator('[data-item="bonus-chest"]').dblclick()
  page.locator('[data-action="open-chest"]').click()
  assert page.locator('.opening-legendary').is_visible()
  page.screenshot(path=str(out/'legendary-opening.png'),full_page=True)
  page.locator('[data-action="skip-open"]').click()
  assert page.locator('.reward-legendary').is_visible()
  assert page.locator('.legendary-kicker').is_visible()
  page.wait_for_timeout(1000)
  page.screenshot(path=str(out/'legendary-rewards.png'),full_page=True)
  page.locator('[data-action="close-modal"]').last.click()
  assert page.locator('[data-item="bonus-chest"]').count()==0
  snapshot=page.evaluate('window.localStorage._s')
  load_document(page, document(snapshot),wait_until='load')
  page.locator('[data-screen="inventory"]').first.click()
  assert page.locator('[data-item="legendary-book"]').count()==1
  assert len(errors)==0,errors
  assert not requests,requests
  assert page.evaluate('Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)')
  mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True, reduced_motion='reduce')
  mobile.on('pageerror',lambda e:errors.append('mobile: '+str(e)))
  load_document(mobile, document(),wait_until='load')
  mobile.screenshot(path=str(out/'mobile.png'),full_page=True)
  assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
  mobile.locator('[data-screen="trading"]').last.click()
  mobile.locator('[data-tab="redeem"]').click()
  mobile.locator('#promo').fill('START-LION')
  mobile.locator('#redeemForm button').click()
  mobile.locator('[data-tab="store"]').click()
  mobile.locator('[data-action="buy-key"]').click()
  mobile.locator('[data-screen="inventory"]').last.click()
  mobile.locator('[data-item="regular-chest"]').tap()
  mobile.locator('[data-action="selected-use"]').click()
  mobile.locator('[data-action="open-chest"]').click()
  # Motion setting must bypass long animation without losing any rewards.
  assert mobile.locator('.reward-modal').is_visible()
  assert len(errors)==0,errors
  print('Browser smoke: PASS. Full story, bonus, reload, audio toggle, reduced motion, mobile responsive.')
  print('Previews:',', '.join(str(f.name) for f in sorted(out.glob('*.png'))))
  browser.close()
finally:
 pass
