import { action, revalidate } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import { db } from "~/db";
import { subscriptions } from "~/db/schema";
import { getSession } from "./getSession";
import { getSubscriptions } from "./getSubscriptions";

export const removeSubscription = action(async (townId: string) => {
  "use server";

  const session = await getSession();

  session.user &&
    (await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, session.user?.id ?? ""),
          eq(subscriptions.townId, townId),
        ),
      ));

  revalidate(getSubscriptions.key);
});
