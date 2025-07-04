import { query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { roles } from "~/db/schema";
import { getSession } from "./getSession";

export const getRoles = query(async () => {
  "use server";

  const session = await getSession();
  if (!session?.user?.id) return [];

  return await db.query.roles.findMany({
    where: eq(roles.userId, session.user.id),
    with: {
      organization: true,
    },
  });
}, "getRoles");
