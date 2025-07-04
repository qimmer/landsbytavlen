import { action, revalidate } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { roles, users } from "~/db/schema";
import { getOrganizationRoles } from "./getOrganizationRoles";
import { getRoles } from "./getRoles";
import { getSession } from "./getSession";

export const setRole = action(async (roleId: string | null) => {
  "use server";
  const session = await getSession();
  const role = roleId
    ? await db.query.roles.findFirst({ where: eq(roles.id, roleId) })
    : null;

  if (roleId && session.user?.id !== role?.userId) {
    throw new Error("errors.wrongUserForRole");
  }

  await db.update(users).set({ currentRoleId: roleId ? roleId : null });

  revalidate([getSession.key, getRoles.key, getOrganizationRoles.key]);
}, "setRole");
