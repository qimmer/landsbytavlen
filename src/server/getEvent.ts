import { eq } from "drizzle-orm";
import { db } from "~/db";
import { events } from "~/db/schema";

export async function getEvent(id: string) {
  "use server";

  return await db.query.events.findFirst({ where: eq(events.id, id) });
}
