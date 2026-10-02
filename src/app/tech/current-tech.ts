import "server-only";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

/**
 * Stand-in for real sign-in: the technician picks their name on the device.
 * Individual logins (PIN or password) replace this before going live.
 */
export async function currentTech() {
  const id = Number((await cookies()).get("techId")?.value);
  if (!id) return null;
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return u ?? null;
}
