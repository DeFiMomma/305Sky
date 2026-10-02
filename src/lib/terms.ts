import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The terms printed on quotes and invoices. Quotes use the invoice terms until the quote
 * version (terms/quote-terms-DRAFT.md) is approved and saved as its own versioned file.
 */
export const TERMS_FILE = { invoice: "invoice-terms-v1.md", quote: "invoice-terms-v1.md" } as const;

/** Returns the numbered terms paragraphs (markdown **bold** kept) from a terms file. */
export function loadTerms(kind: keyof typeof TERMS_FILE): string[] {
  const text = readFileSync(path.join(process.cwd(), "terms", TERMS_FILE[kind]), "utf8");
  const start = text.indexOf("**TERMS & CONDITIONS:**");
  const end = text.indexOf("\n---", start);
  if (start < 0 || end < 0) throw new Error(`Could not find the terms section in ${TERMS_FILE[kind]}`);
  return text
    .slice(start + "**TERMS & CONDITIONS:**".length, end)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
