# 305 SKY Ops

Work orders, technician time tracking, quoting and invoicing for 305 SKY LLC aircraft maintenance.

The work order is the single source of truth. Quotes, invoices and the QuickBooks export are
all produced by one pricing calculation (`src/lib/pricing`), so they cannot disagree.

## Layout

- `src/lib/pricing/` — pricing calculation, pre-send checks, and job-history learning
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
npm test          # run the test suite
npm run typecheck
```
