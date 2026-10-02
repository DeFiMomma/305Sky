# 305 SKY Ops

Work orders, technician time tracking, quoting and invoicing for 305 SKY LLC aircraft maintenance.

The work order is the single source of truth. Quotes, invoices and the QuickBooks export are
all produced by one pricing calculation (`src/lib/pricing`), so they cannot disagree.

## What's in the app

| Screen | Who | What it does |
|---|---|---|
| Work orders | Office | Every open job, AOG first, with live totals and "vs quote" drift |
| Work order | Office | Tasks/discrepancies, labor, parts & charges, live totals, ready-to-quote/invoice checks, quotes, payments |
| Quote | Office | Printable quote frozen from the work order, with deposit, in the same layout as the Aerokeeper documents |
| Invoice | Office | Live draft invoice from the work order in the same layout, with payments and balance due |
| Parts | Office | Technician part requests → sourcing → ordered → received, with a one-click RFQ email |
| Labor | Office | Utilization per technician against the 80% target, and every time entry |
| Technician app (`/tech`) | Technicians | Clock in/out, start/stop a task, request a part, report a discrepancy (phone-sized) |

Screenshots are in `docs/screenshots/`; sample printed quote and invoice PDFs are in `docs/samples/`.

### Quotes vs. the work order

- **Billed to date** uses hours actually logged.
- **A quote** freezes the work order using estimated hours (or hours already logged, if more).
- The work order compares the quote against the **projected total** and lists exactly which
  items changed, so you know when to send a revised quote.

## Layout

- `src/lib/pricing/` — pricing calculation, pre-send checks, quote comparison, job-history learning
- `src/db/` — database schema (Postgres via Drizzle); `drizzle/` holds migrations
- `src/app/(office)/` — office screens; `src/app/tech/` — technician app
- `scripts/setup-db.ts` — creates the database and loads sample data
- `terms/` — terms & conditions (verbatim invoice version and draft quote version)

## Pricing rules (defaults, editable in settings)

| Item | Rule |
|---|---|
| Labor | $165/hr unless a customer or task rate is set; flat-rate tasks bill the flat amount and still track hours |
| Parts | Markup by unit cost: under $100 +100%, $100–$999.99 +25%, $1,000+ +20% |
| Shipping, fuel | +20% |
| Outside labor | No automatic markup; set per line |
| Consumables | 4% of the whole invoice, capped at $5,000 |
| Internal tasks (odd jobs, meetings, admin) | Never billed |
| Deferred / declined discrepancies | Never billed |

Every manual price change requires a reason. A quote or invoice cannot be sent while a
check fails (below-cost price, open task on a final invoice, unfilled template blank, …).

## Development

```sh
npm install
npm run db:setup  # create the local database and load sample data (db:reset to start over)
npm run dev       # http://localhost:3000  (technician app at /tech)
npm test          # run the test suite
npm run typecheck
```

Locally the database is PGlite (real Postgres stored in `.data/`). For the shop, the same
schema runs on hosted Postgres (e.g. Supabase) with a one-line driver change in `src/db/index.ts`.

## Not built yet

- Individual logins (technicians currently pick their name on the device)
- FAA registry lookup by tail number
- Finalizing/locking invoices and QuickBooks sync (Online or Desktop still to confirm)
- Quote-specific terms (quotes print the current invoice terms until the quote version is approved)
- Company email/phone for the "Questions?" line (`src/lib/company.ts`)
- AI-drafted RFQs to PartsBase vendors and AI review of quote estimates
