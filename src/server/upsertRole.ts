import { action, revalidate } from "@solidjs/router";
import { eq, type InferInsertModel, sql } from "drizzle-orm";
import { uniqBy } from "lodash-es";
import { db } from "~/db";
import { roles } from "~/db/schema";
import type { UserGroup } from "~/lib/userGroups";
import { getOrganizationRoles } from "./getOrganizationRoles";
import { getRoles } from "./getRoles";
import { getSession } from "./getSession";

export const upsertRole = action(
  async (role: InferInsertModel<typeof roles> & { deleted?: true }) => {
    "use server";

    const session = await getSession();
    const existingRoles = uniqBy(
      [...(await getOrganizationRoles()), ...(await getRoles())],
      "id",
    );

    if (role.id && !existingRoles.find((x) => x.id === role.id)) {
      throw new Error("errors.notAllowed");
    }

    if (role.deleted) {
      if (role.userId !== session.user?.id) {
        throw new Error("errors.notAllowed");
      }

      await db.delete(roles).where(eq(roles.id, role.id!));
    } else {
      if (role.organizationId !== session.user?.currentRole?.organizationId) {
        throw new Error("errors.notAllowed");
      }

      await db
        .insert(roles)
        .values({ ...role, userGroups: ["admin" as UserGroup] })
        .onConflictDoUpdate({
          target: [roles.organizationId, roles.userId],
          set: {
            userGroups: sql.raw(`excluded."${roles.userGroups.name}"`),
          },
        });
    }

    revalidate([getRoles.key, getOrganizationRoles.key]);
  },
);
