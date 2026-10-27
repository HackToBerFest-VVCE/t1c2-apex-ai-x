# JATAYU — Landslide Risk Monitoring System (Frontend)

A static, framework-free frontend that recreates the JATAYU UI reference: login, dashboard,
interactive map, risk analysis, alerts, and citizen report-activity flow.

## Structure
```
index.html            Login screen
dashboard.html         Overview: risk stat cards, donut chart, recent alerts
map.html                Interactive Leaflet map with risk-zone overlays + location panel
risk-analysis.html      Contributing-factor breakdown for a selected area
alerts.html              Active alerts table
report-activity.html     Citizen "report unusual activity" form + AI verification status
field-reports.html, data-layers.html, history.html, settings.html   Stub pages (wired into
                          nav + shell, ready for you to fill in with real data)

assets/css/tokens.css   Design tokens (colors, radii, fonts) — edit these to re-theme everything
assets/css/app.css      Shared shell: sidebar, topbar, cards, tables, badges
assets/css/login.css    Login-page-only styles
assets/js/main.js       Icon set (inline SVGs) + renderSidebar()/renderTopbar() + mobile nav toggle
assets/img/             Logo + generated mountain backdrop (SVG, no external image needed)
```

## Running it
No build step, no npm install required — plain HTML/CSS/JS.
Just open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```
then visit `http://localhost:8000`.

It pulls three things from CDN at runtime (needs internet in the browser, not in any build
step): Google Fonts (Inter/Poppins), Chart.js (dashboard donut), and Leaflet + OpenStreetMap
tiles (map page). Swap these for self-hosted copies if you need a fully offline build.

## Wiring it to your backend
Every page currently renders from small hard-coded JS arrays/objects near the bottom of each
file (e.g. `alerts`, `riskZones`, `factors` in the `<script>` blocks). Replace those literals
with `fetch()` calls to your API and the rest of the markup/styling will keep working as-is.

The sidebar and topbar are generated once per page via `renderSidebar("<page-key>")` and
`renderTopbar({ title, subtitle })` in `assets/js/main.js` — edit nav items or add pages there
in one place instead of every HTML file.

## Design tokens
Risk colors, the gold brand accent, and the dark navy palette all live as CSS variables at the
top of `assets/css/tokens.css` — change them there to reskin the whole app consistently.
