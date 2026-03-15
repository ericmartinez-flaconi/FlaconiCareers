# Changelog

## [v5.0.0-cli-tool] - 2026-03-15

### Added
- **Blessed-contrib Dashboard:** Introduced a sophisticated, real-time CLI dashboard for capture and inspection processes.
  - Live progress bars, asset distribution charts, language breakdowns, and activity logs.
  - Enhanced visual appeal and human-centered feedback.
- **CLI Subcommands:** Refactored the tool into distinct commands:
  - `run`: The main capture engine with dashboard.
  - `inspect`: Pre-flight site analysis (sitemap discovery, link checks).
  - `stats`: Audits captured data in the output directory.
  - `clean`: Wipes the output directory.
- **Improved Sitemap Discovery:** Enhanced `discoverSitemap` to check multiple common paths (`sitemap.xml`, `sitemap_index.xml`, `en/sitemap.xml`, `karriere/sitemap.xml`, `karriere/en/sitemap.xml`).
- **Structural Spidering Fallback:** Implemented a fallback mechanism to discover main pages by analyzing `nav`, `header`, and `footer` links when no sitemap is found.

### Fixed
- Resolved `NaN` timer issue in the dashboard.
- Addressed terminal rendering errors during capture.

### Refactored
- **Core Engine:** `src/engine/capturer.js` now includes `onProgress` callbacks for dashboard integration.
- **CLI Entry Point:** `bin/capture.js` restructured to handle subcommands and dashboard initialization.
- **Asset Localization:** Ensured consistent pathing for localized assets.

## Versioning Scheme
- **App (`master` branch):** `v5.0.0-source`
- **CLI Tool (`scrapping-logic` branch):** `v5.0.0-cli-tool` (this release)

## To Use the CLI Tool:
- `npm run capture -- <url> [--discover]`
- `npm run inspect -- <url>`
- `npm run stats`
- `npm run clean`
