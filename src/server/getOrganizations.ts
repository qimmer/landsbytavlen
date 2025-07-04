import { query } from "@solidjs/router";
import { eq, inArray } from "drizzle-orm";
import { db } from "~/db";
import { organizations } from "~/db/schema";
import { getSubscriptions } from "./getSubscriptions";


export const getOrganizations = query(async (townId?: string) => {
  "use server";

  const mySubscriptions = await getSubscriptions();

  return await db.query.organizations.findMany({
    where: townId ? eq(organizations.townId, townId) : inArray(organizations.id, mySubscriptions.map(x => x.townId)),
  });
}, "getOrganizations");
