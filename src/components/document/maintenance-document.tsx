/* eslint-disable @next/next/no-img-element */
import { COMPANY } from "@/lib/company";
import type { PricedTask, Totals } from "@/lib/pricing";
import "./document.css";

// Quote and invoice layout, kept faithful to the documents 305 SKY sent from Aerokeeper.

export interface DocCustomer {
  name: string;
  contactName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
}

export interface DocAircraft {
  tailNumber: string;
  make: string | null;
  model: string | null;
  serialNumber: string | null;
}

export interface DocPayment {
  id: number;
  date: string;
  type: string;
  method: string;
  amountCents: number;
}

export interface MaintenanceDocumentProps {
  kind: "quote" | "invoice";
  number: string;
  date: Date;
  workOrderNumber: string;
  customerReference: string | null;
  customer: DocCustomer | null;
  aircraft: DocAircraft | null;
  tasks: PricedTask[];
  totals: Totals;
  payments: DocPayment[];
  depositCents?: number | null;
  sectionOrder: string[];
  terms: string[];
  printedAt: Date;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (cents: number) => usd.format(cents / 100);
const dash = (cents: number) => (cents ? money(cents) : "-");
const TZ = COMPANY.timeZone;
const longDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric", timeZone: TZ });
const shortDate = (d: Date | string) =>
  new Date(`${typeof d === "string" && d.length === 10 ? `${d}T12:00:00` : d}`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: TZ,
  });
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const round2 = (n: number) => Math.round(n * 100) / 100;

const CHIP: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "doc-chip doc-chip-blue" },
  in_progress: { label: "In Progress", className: "doc-chip doc-chip-blue" },
  deferred: { label: "Deferred", className: "doc-chip doc-chip-yellow" },
  declined: { label: "Declined", className: "doc-chip doc-chip-gray" },
};

/** Renders `**bold**` spans inside a terms paragraph. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

/** Hours a task contributes to the document's labor-hours line. */
function documentHours(t: PricedTask, kind: "quote" | "invoice") {
  if (kind === "invoice") return t.actualHours;
  if (t.billing === "flat_rate") return t.estimatedHours ?? t.actualHours;
  return t.laborRateCents ? t.laborCents / t.laborRateCents : 0;
}

export function MaintenanceDocument(p: MaintenanceDocumentProps) {
  const isInvoice = p.kind === "invoice";
  const title = isInvoice ? "INVOICE" : "QUOTE";
  const t = p.totals;
  const misc = t.shippingCents + t.fuelCents + t.outsideServicesCents + t.miscCents;
  const shown = p.tasks.filter((x) => x.billed || x.status === "deferred");
  const sections = [...new Set([...p.sectionOrder, ...shown.map((x) => x.section ?? "General")])]
    .map((name) => ({ name, tasks: shown.filter((x) => (x.section ?? "General") === name) }))
    .filter((s) => s.tasks.length);
  const billed = p.tasks.filter((x) => x.billed);
  const laborHours = round2(billed.reduce((a, x) => a + documentHours(x, p.kind), 0));
  const allComplete = billed.length > 0 && billed.every((x) => x.status === "completed");
  // Older quote snapshots predate `installed`; treat a missing flag as installed.
  const partsUsed = billed.flatMap((x) => x.charges.filter((c) => c.kind === "part" && c.installed !== false));
  const lastPayment = p.payments[p.payments.length - 1];
  const header = `${capitalize(p.kind)} SN ${p.aircraft?.serialNumber ?? "-"} ${p.aircraft?.tailNumber ?? ""} ID: ${p.number}`;
  const printed = `Printed ${p.printedAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: TZ })}`;
  const cssString = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  let itemNo = 0;

  return (
    <article className="doc">
      <style>{`@page { @top-center { content: ${cssString(header)}; } @bottom-left { content: ${cssString(printed)}; } }`}</style>
      <div className="doc-running-header">{header}</div>

      <header className="doc-top">
        <div>
          <img src="/brand/305sky-logo.png" alt="305 SKY" className="doc-logo" />
          <div className="doc-company">{COMPANY.name}</div>
          <div className="doc-company-address">
            {COMPANY.address}, {COMPANY.cityStateZip.split(" ").slice(0, -1).join(" ")}
            <br />
            {COMPANY.cityStateZip.split(" ").slice(-1)}
          </div>
          <div className="doc-muted-small">
            Performed at: <strong>{COMPANY.performedAt}</strong> ({COMPANY.performedAt})
          </div>
        </div>
        <div className="doc-title-block">
          <div className="doc-title">
            {title} {p.number}
          </div>
          <div>
            [{COMPANY.name} WO# {p.workOrderNumber}]
          </div>
          <div>
            {isInvoice ? "Invoice" : "Quote"} Date: {longDate(p.date)}
          </div>
        </div>
      </header>

      <section className="doc-parties">
        <div>
          <div className="doc-customer-name">Customer Name: {p.customer?.name ?? "-"}</div>
          <table className="doc-kv">
            <tbody>
              <KV label="Attn:" value={p.customer?.contactName ?? p.customer?.name} />
              <KV label="Address:" value={p.customer?.address} />
              <KV
                label="City/State/Zip:"
                value={[p.customer?.city, [p.customer?.state, p.customer?.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ") || null}
              />
              <KV label="Phone #:" value={p.customer?.phone} />
              <KV label="Email:" value={p.customer?.email} />
              <KV label="Customer W/O:" value={p.customerReference} />
            </tbody>
          </table>
        </div>
        <div className="doc-aircraft">
          <div><strong>Aircraft Reg #:</strong> {p.aircraft?.tailNumber ?? "-"}</div>
          <div><strong>Make:</strong> {p.aircraft?.make ?? "-"}</div>
          <div><strong>Model:</strong> {p.aircraft?.model ?? "-"}</div>
          <div><strong>Serial #:</strong> {p.aircraft?.serialNumber ?? "-"}</div>
        </div>
      </section>

      <p className="doc-intro">Thank you for choosing {COMPANY.name} for your aircraft maintenance needs.</p>
      <p className="doc-intro">
        {isInvoice
          ? "Below is the detailed invoice for work completed on your aircraft."
          : "Below is the estimate for the work requested on your aircraft. Additional discrepancies found during inspection will be quoted for your approval."}
      </p>

      <table className="doc-table">
        <thead>
          <tr>
            <th className="doc-col-item">Item</th>
            <th>{isInvoice ? "Work Performed" : "Work Requested"}</th>
            <th className="doc-col-money">Labor</th>
            <th className="doc-col-money">Parts</th>
            <th className="doc-col-money">Misc</th>
            <th className="doc-col-money">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => [
            <tr key={`s-${s.name}`} className="doc-section">
              <td colSpan={6}>{s.name}</td>
            </tr>,
            ...s.tasks.map((task) => {
              itemNo += 1;
              const parts = task.charges.filter((c) => c.kind === "part");
              const other = task.charges.filter((c) => c.kind !== "part");
              const partsCents = task.billed ? parts.reduce((a, c) => a + c.extendedPriceCents, 0) : 0;
              const otherCents = task.billed ? other.reduce((a, c) => a + c.extendedPriceCents, 0) : 0;
              const chip = CHIP[task.status];
              const hrs = documentHours(task, p.kind);
              return (
                <tr key={task.taskId} className={task.billed ? "" : "doc-row-muted"}>
                  <td className="doc-col-item">
                    {itemNo}
                    <div className="doc-code">{task.code}</div>
                  </td>
                  <td>
                    <div className="doc-task-title">
                      {task.title}
                      {chip ? <span className={chip.className}>{chip.label}</span> : null}
                    </div>
                    {task.description ? <div className="doc-desc">{task.description}</div> : null}
                    {parts.length ? (
                      <div className="doc-sub">
                        <div className="doc-sub-title">Parts:</div>
                        <ul>
                          {parts.map((c) => (
                            <li key={c.lineId}>{c.description} (Qty: {c.quantity})</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {other.length ? (
                      <div className="doc-sub">
                        <div className="doc-sub-title">Services/Misc:</div>
                        <ul>
                          {other.map((c) => (
                            <li key={c.lineId}>{c.description} (Qty: {c.quantity})</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </td>
                  <td className="doc-col-money">
                    {task.billed && task.laborCents ? (
                      <>
                        {money(task.laborCents)}
                        <div className="doc-muted-small">
                          {task.billing === "flat_rate" ? "(Flat Rate)" : `${round2(hrs)} hrs`}
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="doc-col-money">{dash(partsCents)}</td>
                  <td className="doc-col-money">{dash(otherCents)}</td>
                  <td className="doc-col-money">{task.billed ? (task.totalCents ? money(task.totalCents) : isInvoice ? "-" : "TBD") : "-"}</td>
                </tr>
              );
            }),
          ])}
        </tbody>
      </table>

      {isInvoice && partsUsed.length ? (
        <section className="doc-block">
          <h3 className="doc-h3">Parts &amp; Materials Used</h3>
          <table className="doc-table doc-parts-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="doc-col-qty">Qty Used</th>
              </tr>
            </thead>
            <tbody>
              {partsUsed.map((c) => (
                <tr key={c.lineId}>
                  <td>{c.description}</td>
                  <td className="doc-col-qty">{c.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="doc-totals">
        <TotalLine label="Total Labor Cost" value={money(t.laborCents)} />
        <TotalLine label="Total Parts Cost" value={money(t.partsCents)} />
        <TotalLine label="Total Misc Cost" value={money(misc)} />
        <TotalLine label="Shop Supplies & Consumables (4%)" value={money(t.consumablesCents)} />
        <div className="doc-rule" />
        <TotalLine label="Subtotal" value={money(t.totalCents)} />
        <TotalLine label="Tax (if applicable)" value="-" />
        <div className="doc-rule-strong" />
        <TotalLine label={isInvoice ? "TOTAL AMOUNT DUE" : "ESTIMATED TOTAL"} value={money(t.totalCents)} className="doc-total-red doc-total-big" />
        {isInvoice && t.paymentsCents ? (
          <>
            <TotalLine label="Payments Received" value={`-${money(t.paymentsCents)}`} className="doc-total-green" />
            <TotalLine label="BALANCE DUE" value={money(t.balanceCents)} className="doc-total-red doc-total-big" />
          </>
        ) : null}
        {!isInvoice && p.depositCents ? (
          <TotalLine label="DEPOSIT REQUIRED" value={money(p.depositCents)} className="doc-total-green" />
        ) : null}
      </section>

      {isInvoice && p.payments.length ? (
        <section className="doc-block">
          <div className="doc-caption">PAYMENTS RECEIVED</div>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Method / Reference</th>
                <th className="doc-col-money">Amount</th>
              </tr>
            </thead>
            <tbody>
              {p.payments.map((pay) => (
                <tr key={pay.id}>
                  <td>{shortDate(pay.date)}</td>
                  <td>{capitalize(pay.type)}</td>
                  <td>{pay.method}</td>
                  <td className="doc-col-money">{money(pay.amountCents)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="doc-right"><strong>Total Payments Received</strong></td>
                <td className="doc-col-money"><strong>{money(t.paymentsCents)}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>
      ) : null}

      <section className="doc-info-box">
        <div className="doc-info-title">{isInvoice ? "Payment Information" : "Deposit & Payment Information"}</div>
        {isInvoice ? (
          <>
            <p><strong>Payment Terms:</strong> {COMPANY.paymentTerms}</p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span className="doc-status">
                {t.balanceCents <= 0 ? "PAID IN FULL" : t.paymentsCents ? "PARTIAL PAYMENT" : "UNPAID"}
              </span>
            </p>
            {lastPayment ? (
              <p><strong>Most Recent Payment:</strong> {shortDate(lastPayment.date)} ({money(lastPayment.amountCents)})</p>
            ) : null}
          </>
        ) : (
          <>
            <p><strong>Deposit Required to Begin Work:</strong> {p.depositCents ? money(p.depositCents) : "None"}</p>
            <p><strong>Payment Terms:</strong> {COMPANY.paymentTerms}</p>
          </>
        )}
        <p><strong>Remit Payment To:</strong> {COMPANY.name} - {COMPANY.address}, {COMPANY.cityStateZip}</p>
        {COMPANY.contactEmail || COMPANY.contactPhone ? (
          <p>
            <strong>Questions?</strong> Contact us at {[COMPANY.contactEmail, COMPANY.contactPhone].filter(Boolean).join(" or ")}
          </p>
        ) : null}
      </section>

      {isInvoice && allComplete ? (
        <section className="doc-block">
          <div className="doc-label">WORK SUMMARY:</div>
          <p className="doc-justify">
            Work was performed in accordance with applicable regulations and industry standards. All work has been
            inspected and meets airworthiness requirements.
          </p>
        </section>
      ) : null}

      <div className="doc-hours">
        <span>{isInvoice ? "Total Labor Hours Completed" : "Total Estimated Labor Hours"}</span>
        <span>{laborHours} hrs</span>
      </div>

      {isInvoice && allComplete ? (
        <section className="doc-block">
          <div className="doc-label">NOTES:</div>
          <p className="doc-justify">
            <strong>Return to Service:</strong> Aircraft has been returned to service in accordance with applicable
            regulations. Maintenance records have been updated accordingly.
          </p>
        </section>
      ) : null}

      <section className="doc-block doc-terms">
        <div className="doc-label">TERMS &amp; CONDITIONS:</div>
        {p.terms.map((para, i) => (
          <p key={i}>
            <Rich text={para} />
          </p>
        ))}
      </section>

      <section className="doc-signatures">
        <div>
          <div className="doc-sign-line" />
          <div>Customer Acknowledgment</div>
          <div className="doc-sign-line doc-sign-date" />
          <div>Date:</div>
        </div>
        <div>
          <div className="doc-sign-line" />
          <div>{COMPANY.name} Representative</div>
          <div className="doc-sign-line doc-sign-date" />
          <div>Date:</div>
        </div>
      </section>
    </article>
  );
}

function KV({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <tr>
      <th>{label}</th>
      <td>{value || "-"}</td>
    </tr>
  );
}

function TotalLine({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`doc-total-line ${className}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
