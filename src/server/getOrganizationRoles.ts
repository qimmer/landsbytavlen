import { query } from "@solidjs/router";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { roles } from "~/db/schema";
import { getSession } from "./getSession";

export const getOrganizationRoles = query(async () => {
  "use server";

  const session = await getSession();
  if (!session?.user?.currentRole?.organizationId) {
    return [];
  }

  return await db.query.roles.findMany({
    where: eq(roles.organizationId, session.user.currentRole.organizationId),
    with: {
      user: {
        columns: {
          id: true,
          email: true,
          image: true,
          name: true,
        },
      },
    },
  });
}, "getOrganizationRoles");
