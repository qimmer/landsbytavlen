import { action, revalidate } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { subscriptions, towns } from "~/db/schema";
import { getSession } from "./getSession";
import { getSubscriptions } from "./getSubscriptions";

export const addSubscription = action(async (townId: string) => {
  "use server";

  const session = await getSession();
  const town = await db.query.towns.findFirst({
    where: eq(towns.id, townId),
  });

  if (town && session.user?.id) {
    await db
      .insert(subscriptions)
      .values({ townId, userId: session.user.id })
      .onConflictDoNothing();
  }

  revalidate(getSubscriptions.key);
});
