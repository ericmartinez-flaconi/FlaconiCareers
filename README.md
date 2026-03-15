# Flaconi Website Capture CLI 🚀

A universal toolkit to capture website DOMs and localize assets into category-based flattened structures.

## Commands

### 1. `run` (The Main Engine)
Captures specific pages or a whole site and localizes all assets.
```bash
# Basic
npm run capture -- https://example.com

# Multi-slug with custom output and base-path
npm run capture -- https://example.com --slugs home,about,contact -o my-project -b /base/
```

### 2. `inspect` (The Discovery Tool)
Analyzes a target site's sitemap and URL structure without downloading anything.
```bash
npm run inspect -- https://www.flaconi.de/karriere/en/
```

### 3. `stats` (The Workspace Auditor)
Shows disk usage, template counts, and asset breakdown of your last run.
```bash
npm run stats
```

### 4. `clean` (The Resetter)
Wipes the output directory.
```bash
npm run clean
```

## Options (for `run`)
- `-o, --output <dir>`: Directory to save templates and assets (default: `output`)
- `-b, --base-path <path>`: Base URL path for assets in the templates (default: `/`)
- `-s, --slugs <slugs>`: Comma-separated list of slugs to capture.
- `-d, --discover`: Automatically find and capture all URLs from `sitemap.xml`.

## Architecture
- `bin/`: CLI entry point and subcommand definitions.
- `src/engine/`: Core logic using Playwright Extra + Stealth.
- `legacy-research/`: Archive of initial capture attempts.
