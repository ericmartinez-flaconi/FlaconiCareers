# Release v5.2.0 - Coherent Naming & Navigation Standard

This update unifies the project's naming conventions across templates, slugs, and menu items to ensure a seamless and predictable navigation experience.

### Major Improvements
- **Standardized Slugs**: All internal routes now use intuitive, human-readable slugs that match their content:
    - `karriere` / `howwework` → `how-we-hire`
    - `culture` → `life-at-flaconi`
- **Coherent File Structure**: Template files and captured DOM JSONs have been renamed to match these new slugs, removing the "messy" relationship between filenames and routes.
- **Global Link Cleanup**: Performed a project-wide replacement of legacy URLs in all HTML templates to ensure all internal navigation uses the new standard.
- **Improved Localization**: Refined the `TemplateRenderer` logic to correctly handle root-relative links and ensure they are properly localized without being skipped.

### Technical Changes
- **Simplified Routing**: The `Page` component now uses a unified mapping logic that supports both new standards and legacy aliases for backwards compatibility.
- **Enhanced Link Regex**: Updated the link rewriting engine to more accurately detect and localize internal paths while safely ignoring assets and already-localized routes.

---

# Release v5.1.0 - Template Correction & Asset Standardization

This update fixes the "How we hire" (karriere) page and standardizes the asset naming convention across the project.

### Major Improvements
- **"How we hire" Template Fix:** Corrected the `/karriere` page which was previously a duplicate of the home page. It now correctly renders the specialized hiring process content.
- **Standardized Asset Naming:** Implemented a new flattened naming convention (`category_flattenedOriginalPath`) for all newly captured assets. This improves file organization and prevents potential collisions.
- **Expanded Asset Library:** Successfully localized and integrated 90+ new assets (CSS and Images) required for the hiring process page.
- **JSON Format Cleanup:** Sanitized the captured DOM JSON files to follow the strict project standard (head, body, bodyClass, htmlClass), ensuring compatibility with the Next.js rendering engine.

### Technical Changes
- **Crawl Engine v5.1:** Updated the `Capturer` logic to support deep-path flattening for asset filenames.
- **Base Path Alignment:** Verified and aligned all internal asset references with the `/FlaconiCareers/` base path for production deployment.

---

# Release v2.0.0 - Major Responsive & Fidelity Fixes

This major update brings full responsiveness and enhanced visual fidelity to the flaconi Careers duplication.

### Major Improvements
- **Full Responsiveness:** Migrated from fixed style-flattening to dynamic media-query preservation. The layout now adapts perfectly to Mobile, Tablet, and Desktop viewports.
- **Enhanced Asset Injection:** All external stylesheets are now downloaded and inlined at the network level to bypass CORS and ensure 1:1 typography and icon rendering.
- **Seamless Local Navigation:** Deep link-rewriting across all body content ensures that navigating through the site (Culture, Teams, Jobs, etc.) keeps you entirely within the local prototype.
- **GitHub Pages Optimization:** Standardized routing with `trailingSlash` and `.nojekyll` to ensure robust hosting on GitHub's static environment.

### Technical Changes
- **Crawl Engine v5:** Implemented a new multi-stage crawler that captures raw DOM + Original CSS.
- **Routing:** Implemented Next.js catch-all routes with `generateStaticParams` for high-performance static export.
- **Layout:** Removed all framework-level style interference by giving the application total control over the root HTML/Body elements.

### Deployment
The live preview is updated and available at:
[https://ericmartinez-flaconi.github.io/FlaconiCareers/](https://ericmartinez-flaconi.github.io/FlaconiCareers/)
