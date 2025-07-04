import { query } from "@solidjs/router";
import { and, asc, eq, gt, inArray, isNull, lt } from "drizzle-orm";
import { match } from "ts-pattern";
import { db } from "~/db";
import { events, organizations, subscriptions, towns } from "~/db/schema";
import { getSession, type SessionData } from "./getSession";

async function getEventsFromSubscriptions(session: SessionData) {
  const mySubscribedTowns = (
    await db.query.subscriptions.findMany({
      where: eq(subscriptions.userId, session.user?.id ?? ""),
    })
  ).map((x) => x.townId);

  const mySubscribedOrganizations = (
    await db.query.organizations.findMany({
      where: inArray(organizations.townId, mySubscribedTowns),
    })
  ).map((x) => x.id);

  const result = await db.query.events.findMany({
    where: and(
      inArray(events.createdBy, mySubscribedOrganizations),
      gt(events.end, new Date()),
      isNull(events.deletedAt),
    ),
    with: {
      createdByOrg: {
        with: {
          town: {
            columns: {
              id: true,
              name: true,
              municipality: true,
            },
          },
        },
      },
    },
    orderBy: (events, { asc }) => asc(events.start),
  });

  return result;
}

async function getEventsFromTown(townId: string) {
  return (
    await db
      .select()
      .from(events)
      .innerJoin(organizations, eq(events.createdBy, organizations.id))
      .innerJoin(towns, eq(organizations.townId, towns.id))
      .where(
        and(
          eq(organizations.townId, townId),
          gt(events.end, new Date()),
          isNull(events.deletedAt),
        ),
      )
      .orderBy(({ events }) => asc(events.start))
  ).map((x) => ({
    ...x.events,
    createdByOrg: { ...x.organizations, town: x.towns },
  }));
}

async function getEventsFromOrganization(sessionOrOrganizationId: SessionData | string) {
  return db.query.events.findMany({
    where: and(
      eq(events.createdBy, typeof sessionOrOrganizationId === "string" ? sessionOrOrganizationId : sessionOrOrganizationId.user?.currentRole?.organizationId ?? ""),
      isNull(events.deletedAt),
    ),
    with: {
      createdByOrg: {
        with: {
          town: {
            columns: {
              id: true,
              name: true,
              municipality: true,
            },
          },
        },
      },
    },
    orderBy: (events, { asc }) => asc(events.start),
  });
}

export const getEvents = query(
  async (
    which:
      | { query: "subscribed" }
      | { query: "byOrganization"; organizationId?: string }
      | { query: "byTown"; townId: string },
  ) => {
    "use server";

    const session = await getSession();
    if (!session.user) return [];

    return await match(which)
      .with({ query: "subscribed" }, () => getEventsFromSubscriptions(session))
      .with({ query: "byOrganization" }, (q) =>
        getEventsFromOrganization(q.organizationId ?? session),
      )
      .with({ query: "byTown" }, ({ townId }) => getEventsFromTown(townId))
      .exhaustive();
  },
  "getEvents",
);
