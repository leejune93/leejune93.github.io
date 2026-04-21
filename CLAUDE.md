# Southern CGS — Production Website

## Project Overview
Custom-coded production website for Southern Central Gas Supplies (SCGS), a UK-based B2B gas equipment distributor. Migrated from Framer to custom HTML/CSS/JS.

**Client:** Alvin Gibson — Southern Central Gas Supplies
**Designer/Developer:** Lee June — Lee June Designs
**Reference project:** `C:\Users\Lee June\OneDrive\Documents\Claude-Code\SouthernCGS` (wireframes, proposals, sales docs, design decisions)

## Tech Stack
- **HTML/CSS/JS** — static site, no framework
- **Hosting:** Cloudflare Pages (free)
- **Version Control:** GitHub
- **Forms:** Formspree (free tier Phase 1, paid with file upload Phase 2)
- **Booking:** Calendly (free embed)
- **Social Feeds:** Elfsight (Instagram/LinkedIn, ~£5-10/month, Alvin's account)
- **Google Maps:** Free iframe embed on contact page
- **Newsletter:** Formspree for Phase 1 (emails to inbox), Mailchimp Phase 2
- **Product Data (Phase 2):** Google Sheets as CMS — Alvin fills spreadsheet, site reads via API

## Design Direction
- **Industrial, editorial, premium** — serif headings (Georgia), sans-serif body (Inter)
- **Brand color:** #FF3B49 (coral red) — accent only
- **Nav bar:** Solid red background, white text
- **Layout:** Minimalistic white backgrounds, generous whitespace, sharp corners (border-radius: 0)
- **No shadows** — flat design with 1px borders
- **Buttons:** Uppercase, sharp edges, red primary, hover to black
- **Typography:** H1: 72px, H2: 32px, H3: 20px, H4: 13px uppercase
- **Section padding:** 120px vertical
- **Container max-width:** 1440px

## Project Structure
```
SouthernCGS-Production/
├── index.html                     # Homepage (10 sections)
├── assets/
│   ├── css/styles.css            # Full production CSS
│   ├── js/components.js          # Nav/footer loader, active states, mobile menu
│   ├── js/product-loader.js      # Google Sheets product fetcher, filtering, lightbox
│   ├── images/                   # Alvin's product/brand images go here
│   └── fonts/
├── components/
│   ├── nav.html                  # Shared nav (red bar, mega menu, mobile hamburger)
│   └── footer.html               # Shared footer (newsletter, social, links)
├── data/
│   └── scgs-products.csv         # CSV template for Google Sheets import
└── pages/
    ├── industries.html
    ├── services.html
    ├── resources.html
    ├── about.html
    ├── contact.html
    └── products/
        ├── index.html            # Products landing
        ├── regulators.html       # Sidebar + product grid (JS filtering)
        ├── valves.html
        ├── filters.html
        ├── laboratory-fittings.html
        └── accessories.html
```

## Shared Components
Nav and footer are loaded via JS (`components.js`):
- Every page has `<div id="nav-placeholder"></div>` and `<div id="footer-placeholder"></div>`
- `components.js` fetches `/components/nav.html` and `/components/footer.html`
- Active nav states set via `data-page` attributes on nav links
- Active product category states set via `data-category` attributes
- **Requires local server to test** (use VS Code Live Server extension)

## Nav Structure
- **Primary nav (red bar):** SOUTHERN CGS logo | Home, Industries, Products ▼ (mega menu), Services, Resources, About Us | Book a Meeting (white border), Send an Enquiry (black bg)
- **Secondary nav (grey bar):** Regulators, Valves, Filters, Laboratory Fittings, Accessories
- **Mega menu:** All 5 categories with full subcategories (23 total)

## Product Pages — Google Sheets Powered
- Each product category page has a **left sidebar** (240px) with subcategory links
- **Main grid** (3-column) shows products fetched from Google Sheets
- Clicking sidebar items filters products via JavaScript (show/hide, no page reload)
- **Lightbox** opens on product image click for close-up view
- Product data loaded from Google Sheets: `1dDgP2aJGq3LIOSxUmhWW53f5mTs0EV8mY2wwG4PLy8M`
- Sheet columns: **Name, Description, Category, Subcategory, Image, Spec Sheet**
- Images: paste Google Drive share links (auto-converted to direct URLs)
- Spec Sheets: paste Google Drive PDF share links (auto-converted to preview URLs)
- `product-loader.js` handles fetching, rendering, filtering, and lightbox
- Hardcoded fallback cards hidden while Google Sheets data loads

## Pages Status
| Page | Status | Notes |
|---|---|---|
| Homepage (index.html) | ✅ Built | All 10 sections, centered hero, product carousel |
| Products landing | ✅ Built | 5 category cards (grid-3), CTA |
| Regulators | ✅ Built | Sidebar + product grid, Google Sheets powered, lightbox |
| Valves | ✅ Built | Same structure |
| Filters | ✅ Built | Same structure |
| Laboratory Fittings | ✅ Built | Same + full-width banner image section |
| Accessories | ✅ Built | Same structure |
| Industries | ✅ Built | 8 industry cards + Why Trust SCGS section |
| Services | ✅ Built | 4 alternating left/right blocks with checkmark bullets |
| Resources | ✅ Built | Category filter tabs, video section, LinkedIn feed, insights placeholder |
| About | ✅ Built | Our Story, Meet the Founder, Supplier Trust, Values |
| Contact | ✅ Built | Formspree form (placeholder ID), Calendly placeholder, contact info card |

## Phase 1 vs Phase 2

### Phase 1 (Current)
- All 12 pages built and styled ✅
- Google Sheets CMS for product data ✅ (moved from Phase 2)
- Product sidebar filtering + lightbox ✅
- Contact form (Formspree basic) — placeholder, awaiting Alvin's form ID
- Calendly booking embed — placeholder, awaiting Alvin's Calendly URL
- Google Maps embed — placeholder, awaiting Alvin's address
- Elfsight social feeds — placeholder, awaiting Alvin's widget ID
- Newsletter signup (Formspree) — placeholder
- Responsive design ✅
- Deploy to Cloudflare Pages — not started

### Phase 2 (Future)
- File upload on contact form (Formspree paid)
- Blog/case studies CMS
- Email marketing (Mailchimp)
- Individual product detail pages

## Reference Files
For wireframe designs, content, and all project context:
- **Mid-wireframe:** `../SouthernCGS/mid-wireframe/` — styled wireframes with all content
- **Low-fi wireframe:** `../SouthernCGS/low-fidelity-wireframe/` — blueprint wireframes
- **Design decisions:** `../SouthernCGS/design/DESIGN-DECISIONS.md`
- **User personas:** `../SouthernCGS/design/USER-PERSONAS.md`
- **PRD:** `../SouthernCGS/design/PRD-SCGS-Wireframe.md`
- **Proposal:** `../SouthernCGS/proposals/SCGS-Website-Proposal.md`
- **Retainer agreement:** `../SouthernCGS/sales/SCGS-Retainer-Agreement.docx`

## Key Design Details
- **Hero:** Centered layout, max-width 980px content, 820px heading, 21:9 image placeholder below
- **Product categories (homepage):** Full-width 5-column grid, 4px gaps, no margins
- **Services (homepage):** 2-column grid (not 4)
- **Product pages:** 240px sidebar + 3-column product grid, JS filtering
- **Section labels:** Centered by default, use `.section-label-left` for left-aligned
- **Service page bullets:** Checkmarks inside 24px rounded red circles
- **Testimonials:** Red left border accent bar
- **Footer:** Newsletter signup, 4 social icons (fb, X, ig, in), 64px brand padding-right
- **Placeholders on grey sections:** Use white background for contrast

## Retainer Agreement
- £600/year paid upfront, starts when site goes live
- Up to 4 product card uploads/month
- Minor content updates weekly (text, images, contact info)
- Urgent: 3 business days, non-urgent: weekends
- Alvin owns all accounts and code
