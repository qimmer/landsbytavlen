import { action } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { roles } from "~/db/schema";
import { getSession } from "./getSession";

export const removeRole = action(async (roleId: string) => {
  "use server";

  const session = await getSession();
  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId),
  });

  if (
    role &&
    (role.userId === session.user?.id ||
      role.organizationId === session.user?.currentRole?.organizationId)
  ) {
    await db.delete(roles).where(eq(roles.id, roleId));
  }
});
