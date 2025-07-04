import { query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { subscriptions } from "~/db/schema";
import { getSession } from "./getSession";

export const getSubscriptions = query(async () => {
  "use server";

  const session = await getSession();
  if (!session?.user?.id) return [];

  return await db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, session.user.id),
    with: {
      town: {
        columns: {
          id: true,
          municipality: true,
          name: true,
        },
      },
    },
  });
}, "getSubscriptions");
