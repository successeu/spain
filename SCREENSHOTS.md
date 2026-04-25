# Screenshot fallback guide

If this environment reports:

> "Screenshot not attached: browser_container tool is not available..."

use one of these fallback paths.

## Option 1) Take screenshots locally (recommended)

1. Open the project on your machine in VS Code.
2. Start a local static server from the repo root:
   ```bash
   python3 -m http.server 4173
   ```
3. Open `http://localhost:4173/public/index.html`.
4. Use your browser devtools device toolbar:
   - Desktop: responsive mode off (or wide viewport).
   - Mobile: iPhone 13/14 style viewport.
5. Capture screenshots:
   - macOS: `Cmd + Shift + 4`
   - Windows: `Win + Shift + S`
6. Save files as:
   - `artifacts/hero-desktop.png`
   - `artifacts/hero-mobile.png`

## Option 2) Use Playwright locally

Install once:

```bash
npm i -D playwright
npx playwright install chromium
```

Then run the script included in this repo:

```bash
node scripts/capture-hero.mjs
```

It starts a temporary local static server, captures both breakpoints, and writes:

- `artifacts/hero-desktop.png`
- `artifacts/hero-mobile.png`

## Option 3) In GitHub PR comments

If tooling is blocked in CI/agent:

1. Upload screenshots manually to the PR conversation.
2. Add a short note:
   - "Captured locally because browser_container is unavailable in runner."
3. Include viewport/device details to keep review reproducible.
