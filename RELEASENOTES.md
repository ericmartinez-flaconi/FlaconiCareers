# Release v1.0.0 - flaconi Careers 1:1 Duplication

This is the initial release of the **flaconi Careers** high-fidelity reproduction.

### Key Features
- **1:1 Pixel-Perfect Duplication:** Using computed-style flattening to bake every visual property from the live site directly into the local copy.
- **Full Navigation:** All primary sections (Culture, Locations, Our Teams, Jobs) are replicated and navigable within the local app.
- **Link Mapping:** Career-related links point to local Next.js routes, while external corporate and social links are preserved.
- **Portable Architecture:** All captured DOM files are contained within the `captured_dom/` folder for immediate local serving.

### Technical Stack
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0 + Inline Computed Styles
- **Crawl Engine:** Playwright Stealth + Node.js
- **Asset Handling:** Direct CSS inlining and Base-URL injection

### Deployment Notes
To run this project locally:
1. `npm install`
2. `npm run dev -- -p 8080`
3. Visit [http://localhost:8080](http://localhost:8080)
