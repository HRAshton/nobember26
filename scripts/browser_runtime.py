"""Use an installed browser on Windows; honor an explicit browser elsewhere."""
import os
import shutil
import sys


def launch_browser(playwright):
    explicit = os.environ.get('QUEST_BROWSER_EXECUTABLE')
    if explicit:
        return playwright.chromium.launch(headless=True, executable_path=explicit)
    if sys.platform == 'win32':
        return playwright.chromium.launch(headless=True, channel='msedge')
    installed = shutil.which('chromium') or shutil.which('chromium-browser')
    options = {'executable_path': installed} if installed else {}
    return playwright.chromium.launch(headless=True, **options)


def load_document(page, html, **_):
    """Navigate to an intercepted document, including on reload.

    document.write/set_content can retain document event listeners in Chromium;
    a real navigation gives every application instance a fresh document.
    """
    url = 'https://quest.test/'
    page.unroute(url)
    page.route(url, lambda route: route.fulfill(content_type='text/html; charset=utf-8', body=html))
    page.goto(url, wait_until='load')
