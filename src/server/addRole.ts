import { action, revalidate } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";
import { getOrganizationRoles } from "./getOrganizationRoles";
import { getRoles } from "./getRoles";
import { getSession } from "./getSession";
import { upsertRole } from "./upsertRole";

export const addRole = action(async (email: string) => {
  "use server";

  const session = await getSession();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (user && session.user?.currentRole?.organizationId) {
    await upsertRole({
      organizationId: session.user.currentRole.organizationId,
      userId: user.id,
      userGroups: ["admin"],
    });
  }

  revalidate([getRoles.key, getOrganizationRoles.key]);
});
