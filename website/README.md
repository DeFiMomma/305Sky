# 305 SKY website pages: developer handoff

A new homepage and three standalone, SEO-ready location pages in the 305 SKY style (black, champagne gold,
Cormorant Garamond headings, Jost body text). Neither page needs a build step. Each one
is a single HTML file with its CSS inline and a few lines of JavaScript for the header
and scroll fades. The content stays visible if the JavaScript doesn't run.

| File | Publish at | Target searches |
|---|---|---|
| `index.html` | `/` (replaces the current homepage) | 305 SKY brand, aircraft management & maintenance South Florida; links to every location page |
| `aircraft-management-maintenance-fort-lauderdale.html` | `/aircraft-maintenance-management-fort-lauderdale-fl/` | aircraft maintenance / aircraft management Fort Lauderdale |
| `mid-heavy-jet-maintenance-vero-beach.html` | `/mid-heavy-jet-maintenance-vero-beach-fl/` | mid / heavy jet maintenance Vero Beach, aircraft maintenance / management Vero Beach |
| `aog-maintenance-aircraft-management-boca-raton.html` | `/aog-maintenance-aircraft-management-boca-raton-fl/` | AOG maintenance, aircraft management, pre-buy inspection, records review, Garmin avionics installation Boca Raton |

The pages link to each other (Vero Beach mention on the FLL page, "Two Florida
locations" section on the VRB page, and both footers). **Keep those URLs**, or update
the links in both files if you change them. Each published page must have a canonical
URL that matches where it is served.

305 SKY has four locations: FLL, FXE, BCT and VRB. FLL, VRB and BCT have pages, and they
link to each other. FXE is listed on every page (heritage figures, locations grid, service
areas, FAQ, footer) as plain text. When it gets its own page, turn those mentions into links.
The Boca Raton page deliberately doesn't advertise hangar space there.

Upload alongside the pages:

```
305sky-logo.png          favicon
305sky-logo-light.png    logo recolored for dark backgrounds (header + footer)
images/                  page photos (below)
```

If the site runs on a builder (WordPress, Webflow, Wix, Squarespace), you can paste each
page into a full-width custom-code/HTML block. Keep the `<head>` contents too: the title,
meta description, canonical and the `application/ld+json` structured data block. Most
builders have a per-page SEO / head-code setting for these. To match 305sky.com's exact
fonts or gold, change `--gold…`, `--serif` and `--sans` at the top of each `<style>` block.

## Photos

A photo slot with no image shows a dark, gold-lit backdrop, so a missing photo never looks
broken. Use compressed JPG/WebP.

| File | Page | Shows | Status |
|---|---|---|---|
| `images/hero.jpg` | FLL | Challenger on the ramp at the FLL hangar at sunset | ✅ Included (shown full-width below the headline) |
| `images/engine.jpg` | FLL | Technician / engine work (~1400×1800) | Needed |
| `images/lounge.jpg` | FLL | FLL lobby | ✅ Included |
| `images/vrb-hangar.jpg` | VRB | Vero Beach hangar with the 305 SKY sign | ✅ Included (a higher-resolution original, ≥ 2400px wide, will look sharper on large screens) |
| `images/vrb-work.jpg` | VRB | Technicians at work in the Vero Beach hangar (~1400×1800) | Needed |
| `images/bct-hero.mp4`, `bct-hero.webm`, `bct-hero-poster.jpg` | BCT | Muted looping video of the BCT ramp (tail numbers blurred), with a poster still | ✅ Included. Upload all three; the page plays WebM where supported and falls back to MP4 |
| `images/bct-aog.jpg` | BCT | AOG / technician or avionics work (~1400×1800) | Needed |

## 1. Fill in the placeholders (required before publishing)

Search each file for `{{`. Replace every placeholder, including the ones in the
structured-data block at the top.

| Placeholder | Example | Notes |
|---|---|---|
| `{{DOMAIN}}` | `305sky.com` | No `https://`, no trailing slash |
| `{{PHONE_DISPLAY}}` / `{{PHONE_E164}}` | `(954) 555-0123` / `+19545550123` | FLL phone |
| `{{VRB_PHONE_DISPLAY}}` / `{{VRB_PHONE_E164}}` | `(772) 555-0123` / `+17725550123` | Vero Beach phone. A local 772 number helps local ranking; otherwise use the main line |
| `{{BCT_PHONE_DISPLAY}}` / `{{BCT_PHONE_E164}}` | `(561) 555-0123` / `+15615550123` | Boca Raton phone (also the AOG line on that page). A local 561 number helps local ranking; otherwise use the main line |
| `{{VRB_STREET_ADDRESS}}`, `{{VRB_ZIP}}` | | Vero Beach hangar address. Also update the map `q=` query in the VRB page, which currently points at Vero Beach Regional Airport |
| `{{EMAIL}}` | `service@305sky.com` | |
| `{{OPENS_24H …}}` / `{{CLOSES_24H …}}` | `08:00` / `17:00` | Must match each Google Business Profile |
| `{{HOURS_DISPLAY …}}` | `Mon–Fri 8:00 am – 5:00 pm · AOG by phone` | |
| `{{GOOGLE_BUSINESS_PROFILE_URL}}`, `{{VRB_GOOGLE_BUSINESS_PROFILE_URL}}`, `{{BCT_GOOGLE_BUSINESS_PROFILE_URL}}`, `{{LINKEDIN_OR_INSTAGRAM_URL}}` | | Delete any line you don't have |

**Homepage:** `index.html` replaces the current 305sky.com homepage. It describes 305 SKY as one
organization (Organization + WebSite structured data) and links to each location page. The
location pages point back to it with `parentOrganization`, so Google treats them as one
brand with several locations. Replacing the homepage changes no URLs, but keep any existing
pages it used to link to reachable from the main navigation. Extra placeholders:
`{{LINKEDIN_URL}}`, `{{INSTAGRAM_URL}}`, `{{VRB_PHONE_DISPLAY}}`, `{{VRB_PHONE_E164}}`.

**Map pack plan:** `LOCAL-SEO-90-DAY-PLAN.md` is the 90-day plan for Google Business
Profiles, reviews, citations and links.

**Content to confirm with 305 SKY before launch:**
- **FLL:** the fleet list comes from job history. The management services, owner
  benefits (preferred maintenance pricing, fuel discounts, parking, hangar network),
  maintenance services and painting note come from 305 SKY's draft page.
- **VRB:** the 12,000+ sq ft hangar, large-cabin jets (Falcon 900, G450, Global Express)
  worked inside, and full-service management are from 305 SKY. The page assumes the
  hangar is at Vero Beach Regional (VRB); correct it if not. The service-area airport
  lists are suggestions.
- **BCT:** office at 3300 Airport Rd, Ste 202, Boca Raton, FL 33431. Services: AOG
  maintenance, aircraft management, pre-buy inspections, records review and Garmin avionics
  installations. The avionics section names product categories only (displays, navigators,
  autopilots, ADS-B). Add specific Garmin models or dealer status only if 305 SKY confirms them.
- Each FAQ appears twice, once visible and once in the structured data. Edit both.

**Launch checklist (developer):**
- **Maps:** replace each page's map `<iframe>` with the embed code from that location's
  Google Business Profile (Google Maps → the 305 SKY listing → Share → Embed a map), so
  the map is tied to the listing rather than a plain address search. Keep the iframe
  inside the existing `.map` wrapper so the dark styling still applies.
- **AI search crawlers:** make sure the site's `robots.txt` doesn't block `OAI-SearchBot`,
  `GPTBot`, `PerplexityBot`, `ClaudeBot` or `Google-Extended`. Some site builders block them by default.
- **Bing:** verify the site in Bing Webmaster Tools and submit the sitemap. ChatGPT search
  draws on Bing's index.
- **Sitemap:** add both page URLs to the site's `sitemap.xml`.
- **Credentials (optional next step):** both pages have an "Our Heritage" section (founded
  2019, 55+ years of combined generational experience). If 305 SKY holds an FAA Part 145
  certificate, A&P/IA credentials or OEM training, add them there. Only list what's true.

After publishing, run each URL through Google's Rich Results Test
(https://search.google.com/test/rich-results) and submit both in Google Search Console.

## 2. What gets you onto page 1

The pages cover on-page SEO: title, meta description, H1/H2 keywords, local content,
name/address/phone, map, FAQ and LocalBusiness/Service structured data. For local
searches, Google mostly ranks businesses on the following:

1. **A Google Business Profile for each location.** Vero Beach needs its own profile,
   verified at the hangar address. Each profile decides whether that location shows in
   the map results above the organic listings.
   - Primary category: *Aircraft maintenance company*. Secondary: *Aircraft management
     company* if available, otherwise *Aviation consultant*.
   - Name exactly "305 SKY" on both (no added keywords, which risks suspension). Use the
     same address, phone and hours as the matching page.
   - Link each profile's website to its own location page.
   - Add services ("Mid-size jet maintenance", "Heavy jet maintenance", "AOG support",
     "Aircraft management"…), real hangar photos (a large jet inside the Vero Beach
     hangar is the strongest image you have), and post every week or two.
2. **Reviews.** Ask every satisfied customer for a Google review on the right location's
   profile, mentioning the aircraft type and the work done ("G450 inspection in Vero
   Beach"). Reply to every review.
3. **Consistent citations** for each location: Bing Places, Apple Business Connect, Yelp,
   BBB, LinkedIn, and aviation directories (AirNav FBO/services for FLL and VRB, AC-U-KWIK,
   Globalair.com, AvBuyer).
4. **Links and mentions:** the FBOs at FLL and VRB, aircraft brokers, Falcon / Gulfstream /
   Global operators and owner groups, the Indian River County Chamber and the Greater Fort
   Lauderdale Chamber.
5. **Supporting pages.** Link both location pages from the homepage and main navigation.
   Later, add pages such as "Gulfstream G450 maintenance", "Falcon 900 maintenance",
   "Global Express maintenance" and "AOG service Treasure Coast" that link back to the
   location pages. Short job write-ups ("G450 96-month inspection in Vero Beach") work well.
6. **Technical basics:** HTTPS, fast mobile load, and photos compressed to the sizes above.

Expect weeks to months, not days. Track progress in Search Console (queries containing
"fort lauderdale" / "vero beach") and each Google Business Profile's performance tab.
