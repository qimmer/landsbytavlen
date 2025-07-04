import { query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { towns } from "~/db/schema";
import { getSession } from "./getSession";


export const getTown = query(async (townId: string) => {
  "use server";

  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const result = await db.query.towns.findFirst({
    where: eq(towns.id, townId),
  });

  return result;
}, "getTown");
