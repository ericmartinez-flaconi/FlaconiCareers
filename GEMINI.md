# Developer & AI Assistant Guide: Flaconi Career Page

## Project Architecture
This project is a high-fidelity clone of the Flaconi Career page, migrated from WordPress to a clean Next.js (Node.js) environment.

### Core Repositories/Folders
- `flaconi-career-app/`: The primary Next.js application.
  - **Template-Based**: Instead of a traditional CMS, it uses "baked" JSON templates in `captured_dom/`.
  - **Zero-Regex Routing**: All internal links and asset paths are pre-processed into the JSON files.
  - **Static Export**: Configured for `output: export`, making it deployable to any static host (e.g., GitHub Pages).
- `scrappers-logic/`: The "Scrapping Logic" branch (originally `src`). Contains all scripts used to capture the DOM and assets from the original WordPress site.

## Technical Setup & Dependencies
- **Framework**: Next.js 15+ (App Router).
- **Styling**: Tailwind CSS 4.
- **Scraping**: Playwright Extra with Stealth plugin.
- **Data Parsing**: PapaParse (for Google Sheets integration in the Jobs section).

## Critical Maintenance Info
- **Do NOT manually edit `captured_dom` JSON files** unless you are performing a global search-and-replace for paths.
- **Assets**: All assets are flattened in `public/assets/`. If you add new assets, ensure they follow the `[category]/[flat_name]` convention.
- **Routing**: The `BASE_PATH` is centrally managed in `flaconi-career-app/src/CMS_CONFIG.ts`.

## Branching Strategy
- `master`: Contains only the `flaconi-career-app` files at the root (for clean deployment).
- `scrapping-logic`: Contains the original capture scripts and research files.
