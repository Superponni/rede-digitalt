"""QA-skjermbilder for scrollytelling: scroller stegvis så ScrollTrigger utløses."""
import sys, os, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3100"
slug = sys.argv[1]
viewport_arg = sys.argv[2] if len(sys.argv) > 2 else "desktop"

VIEWPORTS = {
    "desktop": (1366, 800),
    "mobile": (390, 844),
}
w, h = VIEWPORTS[viewport_arg]
outdir = f"/tmp/qa/{slug}/{viewport_arg}"
os.makedirs(outdir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
    page.goto(f"{BASE}/artikler/{slug}", wait_until="load")
    time.sleep(2.5)
    total = page.evaluate("document.body.scrollHeight")
    step = int(h * 0.7)
    positions = list(range(0, total, step))
    # cap til ~16 steg
    if len(positions) > 16:
        idx = [round(i * (len(positions) - 1) / 15) for i in range(16)]
        positions = [positions[i] for i in sorted(set(idx))]
    for i, y in enumerate(positions):
        page.evaluate(f"window.scrollTo({{top:{y}, behavior:'instant'}})")
        time.sleep(0.7)
        page.screenshot(path=f"{outdir}/{i:02d}.png")
    browser.close()
    print(f"{slug}/{viewport_arg}: {len(positions)} shots, total height {total}px")
