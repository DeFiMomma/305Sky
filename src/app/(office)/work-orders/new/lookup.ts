"use server";

import { findAircraftByTail } from "@/lib/data";

export interface TailLookup {
  aircraft: Awaited<ReturnType<typeof findAircraftByTail>>;
  message: string;
}

/**
 * Checks our own records first. The FAA registry import (nightly download of the FAA's
 * releasable aircraft database) will plug in here as the second source.
 */
export async function lookupTail(tail: string): Promise<TailLookup> {
  const n = tail.trim().toUpperCase();
  const aircraft = await findAircraftByTail(n);
  if (aircraft) {
    return {
      aircraft,
      message: `${n} is already in the system: ${[aircraft.year, aircraft.make, aircraft.model].filter(Boolean).join(" ")}.`,
    };
  }
  return { aircraft: null, message: `${n} is new. Enter its details below; FAA lookup is coming next.` };
}
