import { query } from "@solidjs/router";
import { sql } from "drizzle-orm";
import { db } from "~/db";
import { getSession } from "./getSession";

export const getTowns = query(async () => {
  "use server";

  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const towns = await db.query.towns.findMany({
    orderBy: sql.raw('"name" COLLATE "da_DK"'),
  });

  return towns;
}, "getTowns");


