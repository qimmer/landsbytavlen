import { query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { events } from "~/db/schema";

export const getEvent = query(async (id: string) => {
  "use server";

  return await db.query.events.findFirst({
    where: eq(events.id, id), with: {
      createdByOrg: {
        with: {
          town: {
            columns: {
              id: true,
              name: true,
              municipality: true
            }
          }
        }
      }
    }
  });
}, "getEvent");
