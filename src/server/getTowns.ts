import { query } from "@solidjs/router";
import { sql } from "drizzle-orm";
import { db } from "~/db";
import { towns } from "~/db/schema";
import { getSession } from "./getSession";

export const getTowns = query(async function getTowns() {
  "use server";

  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  return await db.query.towns.findMany({
    orderBy: sql.raw('"name" COLLATE "da_DK"'),
  });
}, "getTowns");
