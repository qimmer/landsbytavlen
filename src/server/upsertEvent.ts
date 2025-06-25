import { eq, sql } from "drizzle-orm";
import {
  array,
  boolean,
  date,
  type InferInput,
  maxLength,
  object,
  optional,
  parse,
  pipe,
  string,
} from "valibot";
import { db } from "~/db";
import { events } from "~/db/schema";
import { getSession } from "./getSession";

export const eventSchema = object({
  id: optional(pipe(string(), maxLength(64))),
  title: string(),
  start: date(),
  end: date(),
  location: string(),
  description: string(),
  tags: array(string()),
  deleted: optional(boolean()),
});

export type UpsertEventInput = InferInput<typeof eventSchema>;
export const defaultEventInput = () =>
  ({
    title: "",
    description: "",
    start: new Date(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 24),
    location: "",
    tags: [],
    deleted: false,
  }) as UpsertEventInput;

export async function upsertEvent(event: UpsertEventInput) {
  "use server";

  const session = await getSession({ withRole: true });
  const parsedEvent = parse(
    object({
      ...eventSchema.entries,
      createdBy: string(),
    }),
    {
      ...event,
      createdBy: session.role?.organizationId,
    },
  );

  await db
    .insert(events)
    .values({
      ...parsedEvent,
      deletedAt: parsedEvent.deleted ? new Date() : null,
      createdAt: new Date(),
      createdBy: session.role?.organizationId,
    })
    .onConflictDoUpdate({
      target: events.id,
      targetWhere: eq(events.createdBy, session.role?.organizationId ?? ""),
      set: {
        deletedAt: sql.raw(`excluded."${events.deletedAt.name}"`),
        title: sql.raw(`excluded."${events.title.name}"`),
        start: sql.raw(`excluded."${events.start.name}"`),
        end: sql.raw(`excluded."${events.end.name}"`),
        description: sql.raw(`excluded."${events.description.name}"`),
        location: sql.raw(`excluded."${events.location.name}"`),
        tags: sql.raw(`excluded."${events.tags.name}"`),
        updatedAt: new Date(),
      },
    });
}
