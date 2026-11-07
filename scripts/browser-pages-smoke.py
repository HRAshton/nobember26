"""Exercise the Pages artifact over HTTP under a repository-style subpath."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
from browser_runtime import launch_browser

root = Path(__file__).resolve().parent.parent
assert (root / '_site/index.html').is_file(), 'Run npm run build:pages first.'


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
origin = f'http://127.0.0.1:{server.server_port}'
url = origin + '/_site/'
errors = []
failed_requests = []
external_requests = []


def check_page(page):
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failed_requests.append(response.url) if response.status >= 400 else None)
    page.on('requestfailed', lambda request: failed_requests.append(request.url))
    page.on('request', lambda request: external_requests.append(request.url) if request.url.startswith(('http:', 'https:')) and not request.url.startswith(origin + '/') else None)
    page.goto(url, wait_until='networkidle')
    assert page.locator('.world-hud, .mini-map, .skillbar, .menu-place, .world-location').count() == 0
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    assert page.evaluate('Array.from(document.images).every(image => image.complete && image.naturalWidth > 0)')


try:
    with sync_playwright() as playwright:
        browser = launch_browser(playwright)
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        check_page(page)
        page.screenshot(path=str(root / 'previews/desktop.png'), full_page=True)
        page.locator('[data-screen="trading"]').first.click()
        page.locator('[data-tab="redeem"]').click()
        page.locator('#promo').fill('gem')
        page.locator('#redeemForm button').click()
        page.locator('[data-tab="store"]').click()
        page.locator('[data-action="buy-key"]').click()
        page.locator('[data-screen="inventory"]').first.click()
        page.locator('[data-item="regular-chest"]').dblclick()
        page.locator('[data-action="open-chest"]').click()
        page.locator('[data-action="skip-open"]').click()
        page.locator('[data-action="read-new-book"]').click()
        assert page.evaluate('QUEST_CONFIG.gifts[0].clue') in page.locator('.book-pages').inner_text()
        page.reload(wait_until='networkidle')
        state = page.evaluate('GW2Engine.read(QUEST_CONFIG, localStorage)')
        assert state['opened'] == 1 and state['keys'] == 0 and len(state['books']) == 1
        assert page.locator('[data-item="book-gift-1"]').count() == 1
        for screen in ['merchant', 'wallet', 'trading', 'inventory']:
            page.locator(f'[data-screen="{screen}"]').first.click()
            assert page.locator('#window').get_attribute('data-screen') == screen
        mobile = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        check_page(mobile)
        mobile.screenshot(path=str(root / 'previews/mobile.png'), full_page=True)
        mobile.locator('[data-screen="wallet"]').last.click()
        assert mobile.locator('.wallet-screen').is_visible()
        assert not errors, errors
        assert not failed_requests, failed_requests
        assert not external_requests, external_requests
        browser.close()
finally:
    server.shutdown()
    server.server_close()
    thread.join()

print('Pages browser smoke: PASS (repository subpath, assets, navigation, codes, journal, reload, mobile, no decorative HUD)')
