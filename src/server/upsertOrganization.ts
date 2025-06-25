import { createId } from "@paralleldrive/cuid2";
import { eq, sql } from "drizzle-orm";
import {
  boolean,
  type InferInput,
  length,
  maxLength,
  minLength,
  nullable,
  object,
  optional,
  parse,
  pipe,
  string,
} from "valibot";
import { db } from "~/db";
import { organizations } from "~/db/schema";
import { getSession } from "./getSession";

export const organizationSchema = object({
  id: optional(pipe(string(), maxLength(64))),
  vatId: pipe(string(), length(8)),
  townId: nullable(pipe(string(), minLength(8))),
  deleted: optional(boolean()),
});

export type UpsertOrganizationInput = InferInput<typeof organizationSchema>;
export const defaultOrganizationInput = () =>
  ({
    vatId: "",
    townId: "",
  }) as UpsertOrganizationInput;

export async function upsertOrganization(
  organization: UpsertOrganizationInput,
) {
  "use server";

  const session = await getSession({ withUser: true });

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

  if (!company) {
    throw new Error("errors.vatIdNotFound");
  }

  await db
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
        deletedAt: sql.raw(`excluded."${organizations.deletedAt.name}"`),
        name: sql.raw(`excluded."${organizations.name.name}"`),
        townId: sql.raw(`excluded."${organizations.townId.name}"`),
        updatedAt: new Date(),
      },
    });
}
