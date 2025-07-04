import { query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { organizations } from "~/db/schema";

export const getOrganization = query(async (id: string) => {
  "use server";

  return await db.query.organizations.findFirst({
    where: eq(organizations.id, id),
    with: {
      town: {
        columns: {
          id: true,
          municipality: true,
          name: true
        }
      }
    }
  });
}, "getOrganization");


