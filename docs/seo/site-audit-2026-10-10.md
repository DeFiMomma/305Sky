# 305sky.com SEO check: October 10, 2026

Checked: the home page, robots.txt, the sitemap (179 URLs), Our Work, Aircraft Sales, and all
175 blog posts.

The site is hand-coded (PHP on an Apache server), not a website builder. The code can go on GitHub
and pages can be added directly.

## Fix now (these can hurt you)

### 1. A blog post claims 305 SKY holds a Part 145 certificate
`/blog/jet-engine-repair-and-maintenance-guide` says: *"We maintain FAA Part 145 certification,
operate four strategically located South Florida facilities…"*. 305 SKY doesn't have the
certificate yet. Presenting yourself as a repair station without one is an FAA problem, not just
an SEO one. **Remove that sentence today.**

Also reword these, which a reader could take as a company certification:
- `/blog/king-air-maintenance-guide`: "We're FAA-certified with over 55 years of combined aviation experience."
- `/blog/questions-to-ask-aircraft-seller-before-inspection`: "Our FAA certified mechanics…" (fine if every
  mechanic holds an FAA certificate; otherwise reword)
- `/blog/essential-tools-for-jet-engine-disassembly-and-inspection`: "FAA-certified tools" (tools aren't FAA-certified)

A safe wording until the certificate is issued: "FAA-certificated A&P mechanics" (only if true).

### 2. The "Challenger maintenance" post is about the Dodge Challenger car
`/blog/challenger-maintenance-near-me` covers dealerships, ASE-certified technicians and Dodge
Challenger service costs. It targets one of your most important keywords and would embarrass you
with any Challenger operator who finds it. **Unpublish it** (or replace it with the Challenger page
from `content/pages/challenger-maintenance.md` and redirect the old URL there).

Two more posts are about car and truck fleets, not aircraft:
- `/blog/south-florida-corporate-fleet-management-guide`
- `/blog/fleet-maintenance-management-best-practices`

Unpublish or rewrite them for aircraft fleets.

### 3. The blog is publishing 2–3 AI-written posts a day
175 posts since July 10, about 2,400 words each. Google's spam policies target "scaled content":
lots of pages made mainly to rank, with little original experience. The car posts show these are
not being reviewed. Risks: the whole site loses trust, and posts compete with the pages you
actually want to rank (for example, `/blog/aircraft-maintenance-vero-beach` competes with the
Vero Beach location page).

Recommendation:
- **Pause the automatic posting.**
- Keep posts that are accurate and useful, unpublish the rest, and redirect any that target a
  location or aircraft keyword to the matching new page:

| Old post | Redirect to |
|---|---|
| `/blog/aircraft-maintenance-vero-beach` | `/vero-beach-vrb-aircraft-maintenance` |
| `/blog/aircraft-maintenance-near-me-fort-lauderdale`, `/blog/jet-maintenance-near-me-fort-lauderdale`, `/blog/aircraft-maintenance-fort-lauderdale-best-aircraft-maintenance-company-fort-lauderdale` | `/fort-lauderdale-fll-aircraft-maintenance` |
| `/blog/challenger-maintenance-near-me` | `/challenger-maintenance` |
| `/blog/citation-maintenance-near-me` | `/citation-maintenance` |
| `/blog/king-air-maintenance-guide` | `/king-air-maintenance` |
| `/blog/aog-services-near-me`, `/blog/what-is-aog-maintenance-support-fort-lauderdale` | `/aog-aircraft-on-ground` |

- From now on, publish 1–2 posts a month that someone at 305 SKY has read, with real jobs and photos.
- Reconsider posts named after competitors (`seal-aviation-vs-competitors…`,
  `banyan-aviation-maintenance-alternatives`, `reliable-jet-maintenance-providers-guide`). They
  rarely bring customers and can read as hostile.

### 4. A fourth location: FXE
The site lists four locations: BCT, FLL, **Fort Lauderdale Executive (FXE)** at 1905 NW 51st Street,
Hangar 43A, and VRB. There are only three Google profiles. If FXE is a real, staffed location
with signage, it should get its own Google profile, which is a fourth map-pack chance and likely
an easier one. If it isn't staffed, remove it from the site so it doesn't conflict with FLL.

### 5. Hours conflict
The site's schema says Mon–Sat 8:00–20:00, while the site and the profiles say 24/7 AOG. Make the
schema hours match whatever the Google profiles show.

## Fix with the new pages

- **No location pages.** Every location lives only on the home page. Each Google profile should
  link to its own page (drafts are in `content/pages/`).
- **No aircraft pages.** The only aircraft content is blog posts. Build the aircraft pages.
- **Schema:** the home page schema gives "Boca Raton Airport" and "Vero Beach Regional Airport" as
  street addresses. Use the full addresses (3300 Airport Rd, Ste 202 and 2655 Airport N Dr) and
  move each location into its own `LocalBusiness` on its own page (`content/schema/`).
- **Sitemap:** the home page is listed as `/index.html` while the canonical is `/`. List `/`.
  Static pages (privacy policy) are marked "daily"; drop `changefreq` and `priority`, Google
  ignores them.
- **Home page headings:** there are four H1s (Talk to Our Team, Request a Call…). Keep one H1.
  A few headings run words together ("What SetsUs Apart", "Four South FloridaLocations") because
  of line breaks in the code. Add the missing spaces.
- **Blog post titles** don't name a location ("Aircraft Maintenance: Expert Care & 24/7 AOG
  Support" is the Vero Beach post).

## Already good

- Clear title and meta description on the home page, a canonical tag, mobile viewport
- Tap-to-call phone links, and one phone number used everywhere
- BCT address includes Ste 202; VRB address matches
- All images have alt text; pages load in under a second
- robots.txt allows crawling and points to the sitemap
- Real testimonials naming Gabriel; ask those customers to post them on Google too

## Still needed from you

- **Google profiles.** The share.google links don't open from my tools. Send screenshots of each
  profile's main view, plus the "Edit profile" screens (name, categories, address, hours,
  services). Also send the review count and rating for each.
- **FXE:** a real, staffed location or not?
- **Who runs the blog** and how posts get published. The automatic posting has to stop at the source.
