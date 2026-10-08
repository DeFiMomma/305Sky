# Fort Lauderdale local landing page

`aircraft-management-maintenance-fort-lauderdale.html` is a standalone page targeting
**aircraft maintenance Fort Lauderdale** and **aircraft management Fort Lauderdale**.
It has no build step: upload it with `305sky-logo-light.png` (the logo recolored for dark
backgrounds) and an `images/` folder beside it, or copy its sections into your site builder.

The design follows the 305 SKY look: black, champagne gold, Cormorant Garamond serif
headings and Jost text. If 305sky.com uses different fonts or gold values, change the
`--gold…`, `--serif` and `--sans` variables at the top of the `<style>` block.

## Photos

The page has three photo slots. Until a photo exists it shows a dark, gold-lit backdrop,
so it never looks broken. Use your own photos, saved as compressed JPG/WebP:

| File | Use | Size |
|---|---|---|
| `images/hero.jpg` | Aircraft on the ramp / hangar at FLL (full-width hero) | ~2400×1500, < 400 KB |
| `images/engine.jpg` | Technician / engine work in the hangar | ~1400×1800, < 300 KB |
| `images/lounge.jpg` | Lobby or owner lounge | ~1400×1750, < 300 KB |

Publish it at: `https://<your-domain>/aircraft-maintenance-management-fort-lauderdale-fl/`

## 1. Fill in the placeholders (required before publishing)

Search the file for `{{`. Every placeholder must be replaced, including the ones in the
`<script type="application/ld+json">` block at the top.

| Placeholder | Example | Notes |
|---|---|---|
| `{{DOMAIN}}` | `305sky.com` | No `https://`, no trailing slash |
| `{{PHONE_DISPLAY}}` | `(954) 555-0123` | Shown on the page |
| `{{PHONE_E164}}` | `+19545550123` | Used in `tel:` links and structured data |
| `{{EMAIL}}` | `service@305sky.com` | |
| `{{OPENS_24H …}}` / `{{CLOSES_24H …}}` | `08:00` / `17:00` | Must match Google Business Profile hours |
| `{{HOURS_DISPLAY …}}` | `Mon–Fri 8:00 am – 5:00 pm · AOG by phone` | |
| `{{CERTIFICATIONS_SENTENCE …}}` | A&P / IA / Part 145 details | Only state what is true. Delete the paragraph if unsure |
| `{{GOOGLE_BUSINESS_PROFILE_URL}}`, `{{LINKEDIN_OR_INSTAGRAM_URL}}` | | Delete any line you don't have |

**Check these against what you actually do:** the fleet list comes from 305 SKY's job
history. The management services, owner benefits (preferred maintenance pricing, fuel
discounts, parking, hangar network), maintenance services and painting note come from
the earlier draft page. The airports list is a suggestion. Remove anything you don't
offer and add aircraft types you work on that aren't listed. The FAQ text appears twice
(visible and in the structured data), so edit both.

After publishing, paste the URL into Google's Rich Results Test
(https://search.google.com/test/rich-results) to confirm the structured data is valid.

## 2. What actually gets you onto page 1

The page covers on-page SEO: title, meta description, H1/H2 keywords, local content, NAP,
map, FAQ and LocalBusiness/Service schema. For local searches like these, Google mostly
ranks businesses on the following, in roughly this order:

1. **Google Business Profile.** This decides whether you show in the map pack, which
   appears above the organic results.
   - Primary category: *Aircraft maintenance company*. Secondary: *Aircraft management company*
     if available, otherwise *Aviation consultant*.
   - Name exactly "305 SKY" (no added keywords, which can get the profile suspended),
     the same address and phone as the page, and the same hours.
   - Set the website link to this page (or the homepage with this page linked prominently).
   - Add services ("Aircraft maintenance", "Aircraft management", "AOG support",
     "Phase inspections"…), real photos of the hangar, team and aircraft (with owner
     permission), and a post every week or two.
2. **Reviews.** Ask every satisfied customer for a Google review. Ask them to mention
   the aircraft type and the work done. Reply to every review.
3. **Consistent citations.** List the exact same name, address and phone on Bing Places,
   Apple Business Connect, Yelp, BBB, LinkedIn, and aviation directories (AirNav FBO/
   services listings for FLL, Aviation Week/AC-U-KWIK, Globalair.com, AvBuyer, etc.).
4. **Links and mentions.** Get linked from FBOs you work with, aircraft brokers, flight
   schools, type clubs (e.g. MU-2 and King Air owner groups) and local business groups
   (Greater Fort Lauderdale Chamber, Broward aviation groups).
5. **Supporting pages.** Link to this page from your homepage and main navigation.
   Over time, add separate pages for "Challenger 604 maintenance", "King Air
   maintenance", "AOG service South Florida" and "Aircraft management", each linking
   back here. Short job write-ups ("400-hour check on a Challenger 604 at FLL") are
   good content.
6. **Technical basics.** HTTPS, fast mobile load (this page has no JavaScript and loads
   quickly), and submit the URL in Google Search Console after publishing.

Expect weeks to months, not days. Track progress in Search Console (queries containing
"fort lauderdale") and the Google Business Profile performance tab.
