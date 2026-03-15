# Flaconi Career Page Refactor Audit

## New Project Structure
- `flaconi-career-app/`: The core Next.js application.
  - `captured_dom/`: Contains cleaned, flattened JSON templates for all pages (`home`, `culture`, `locations`, `our-teams`, `jobs`, `karriere`).
  - `public/assets/`: Flattened asset structure:
    - `css/`: All stylesheets (flattened from WP paths).
    - `images/`: All images (flattened from WP paths).
    - `fonts/`: Web fonts.
    - `videos/`: Localized videos.
- `scrappers-logic/`: All original scraping and crawling scripts moved here for isolation.

## Key Improvements
1. **Asset Flattening**: Removed deep WordPress folder structures (`wp-content/uploads/2024/03/...`). All assets now live in clean, category-based folders with unique names.
2. **WordPress Cleanup**:
   - Stripped unnecessary `<script>` tags, WordPress metadata, generator tags, and internal link relations.
   - Removed WP-specific comments and artifacts from template files.
3. **Clean URL & Routing**:
   - Implemented a missing template for `/karriere/`.
   - Fixed routing logic to ensure all internal links use the app's `basePath` correctly.
   - Simplified `rewriteLinks` logic to focus only on routing, as assets are now hardcoded correctly in the JSON templates.
4. **Self-Contained Deployment**: The app is now fully ready for `next export` with all necessary assets bundled locally.

## Maintenance
- Scraper logic is isolated in `scrappers-logic/`.
- UI templates are centrally managed in `flaconi-career-app/captured_dom/`.
