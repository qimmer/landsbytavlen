import { createId } from "@paralleldrive/cuid2";
import { action, revalidate } from "@solidjs/router";
import { eq, type InferSelectModel, sql } from "drizzle-orm";
import {
  array,
  boolean,
  type InferInput,
  length,
  maxLength,
  nullable,
  object,
  optional,
  parse,
  pipe,
  regex,
  string,
} from "valibot";
import { db } from "~/db";
import { organizations, roles, users } from "~/db/schema";
import type { UserGroup } from "~/lib/userGroups";
import { danishPhoneNumber } from "~/lib/validation/danishPhone";
import { t } from "~/t";
import { getOrganization } from "./getOrganization";
import { getRoles } from "./getRoles";
import { getSession } from "./getSession";

export const organizationSchema = object({
  id: optional(pipe(string(), maxLength(64))),
  vatId: pipe(string(), length(8)),
  townId: string(),
  phone: optional(nullable(danishPhoneNumber())),
  imageId: nullable(string()),
  presentation: string(),
  presentationImages: array(string()),
  deleted: optional(boolean()),
});

export type UpsertOrganizationInput = InferInput<typeof organizationSchema>;
export const defaultOrganizationInput = () =>
  ({
    vatId: "",
    townId: "",
  }) as InferSelectModel<typeof organizations>;

export const upsertOrganization = action(
  async (organization: UpsertOrganizationInput) => {
    "use server";

    const session = await getSession({ withUser: true });

    if (
      organization.id &&
      session.user?.currentRole?.organizationId !== organization.id
    ) {
      throw new Error("errors.cannotUpsertWhenNotMemberOfOrganisation");
    }

    const parsedOrganization = parse(
      object({
        ...organizationSchema.entries,
        createdBy: string(),
      }),
      {
        ...organization,
        createdBy: session.user.id,
        id: organization.id ?? createId(),
      },
    );

    const company = (await fetch(
      `https://cvrapi.dk/api?search=${organization.vatId}&country=dk`,
    ).then((x) => x.json())) as {
      vat: string;
      name: string;
      address: string;
      zipcode: string;
      city: string;
      email: string;
      companycode: number;
    };

    if (!company?.name) {
      throw new Error("errors.vatIdNotFound");
    }

    const newRole = await db.transaction(async (tx) => {
      const organisation = (
        await tx
          .insert(organizations)
          .values({
            ...parsedOrganization,
            address: company.address,
            isCharity: company.companycode === 110,
            name: company.name,
            postCode: company.zipcode,
            deletedAt: parsedOrganization.deleted ? new Date() : null,
            createdAt: new Date(),
            createdBy: session.user.id,
          })
          .onConflictDoUpdate({
            target: organizations.id,
            targetWhere: eq(organizations.createdBy, session.user.id ?? ""),
            set: {
              townId: sql.raw(`excluded."${organizations.townId.name}"`),
              imageId: sql.raw(`excluded."${organizations.imageId.name}"`),
              address: sql.raw(`excluded."${organizations.address.name}"`),
              isCharity: sql.raw(`excluded."${organizations.isCharity.name}"`),
              name: sql.raw(`excluded."${organizations.name.name}"`),
              phone: sql.raw(`excluded."${organizations.phone.name}"`),
              postCode: sql.raw(`excluded."${organizations.postCode.name}"`),
              deletedAt: sql.raw(`excluded."${organizations.deletedAt.name}"`),
              presentation: sql.raw(`excluded."${organizations.presentation.name}"`),
              presentationImages: sql.raw(`excluded."${organizations.presentationImages.name}"`),
              updatedAt: new Date(),
            },
          })
          .returning()
      )[0];

      if (!organization.id) {
        const newAdminRole = (
          await tx
            .insert(roles)
            .values([
              {
                organizationId: organisation.id,
                userId: session.user.id,
                userGroups: ["admin" as UserGroup],
              },
            ])
            .onConflictDoNothing()
            .returning()
        )[0];

        return newAdminRole;
      } else {
        return null;
      }
    });

    if (newRole) {
      await db
        .update(users)
        .set({ currentRoleId: newRole.id })
        .where(eq(users.id, session.user.id));
    }

    revalidate(getSession.key);
    revalidate(getRoles.key);
    revalidate(getOrganization.keyFor(parsedOrganization.id!));
  },
  "upsertOrganization",
);
