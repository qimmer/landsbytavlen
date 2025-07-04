import { action, revalidate } from "@solidjs/router";
import { eq, sql } from "drizzle-orm";
import {
  array,
  boolean,
  date,
  forward,
  type InferInput,
  integer,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nullable,
  number,
  object,
  optional,
  parse,
  partialCheck,
  pipe,
  string,
  union,
} from "valibot";
import { db } from "~/db";
import { events } from "~/db/schema";
import { t } from "~/t";
import { getEvent } from "./getEvent";
import { getEvents } from "./getEvents";
import { getImages } from "./getImages";
import { getSession } from "./getSession";

export const deleteEventSchema = object({
  id: pipe(string(), maxLength(64)),
  deleted: boolean(),
});
export const eventSchema = pipe(
  object(
    {
      id: optional(pipe(string(), maxLength(64))),
      title: pipe(string(), minLength(1, t.required)),
      start: pipe(date(), minValue(new Date(), t.mustBeFuture)),
      hours: pipe(number(), minValue(0.25, t.mustBeNonZero), maxValue(48, t.mustBeLessTwoDays)),
      location: pipe(string(), minLength(1, t.required)),
      description: pipe(string(), minLength(1, t.required)),
      images: array(string()),
      coverImageId: nullable(string()),
    },
    t.required,
  )
);

export type UpsertEventInput = InferInput<typeof eventSchema>;
export type DeleteEventInput = InferInput<typeof deleteEventSchema>;
export const defaultEventInput = () =>
  ({
    title: "",
    description: "",
    start: new Date(),
    hours: 1,
    location: "",
    deleted: false,
    coverImageId: null,
    images: [],
  }) as UpsertEventInput;

export const upsertEvent = action(async (event: UpsertEventInput | DeleteEventInput) => {
  "use server";

  const session = await getSession({ withRole: true });
  const parsedEvent = {
    ...parse(union([eventSchema, deleteEventSchema]), event),
    createdBy: session.user.currentRole.organizationId,
  };

  if ("deleted" in parsedEvent) {
    await db
      .update(events)
      .set({ deletedAt: parsedEvent.deleted ? new Date() : null })
      .where(eq(events.id, parsedEvent.id));
  } else {
    await db
      .insert(events)
      .values({
        ...parsedEvent,
        end: new Date(parsedEvent.start.getTime() + 1000 * 60 * 60 * parsedEvent.hours),
        createdAt: new Date(),
        createdBy: session.user.currentRole.organizationId,
      })
      .onConflictDoUpdate({
        target: events.id,
        targetWhere: eq(
          events.createdBy,
          session.user.currentRole.organizationId ?? "",
        ),
        set: {
          deletedAt: sql.raw(`excluded."${events.deletedAt.name}"`),
          title: sql.raw(`excluded."${events.title.name}"`),
          start: sql.raw(`excluded."${events.start.name}"`),
          end: sql.raw(`excluded."${events.end.name}"`),
          description: sql.raw(`excluded."${events.description.name}"`),
          location: sql.raw(`excluded."${events.location.name}"`),
          images: sql.raw(`excluded."${events.images.name}"`),
          coverImageId: sql.raw(`excluded."${events.coverImageId.name}"`),
          updatedAt: new Date(),
        },
      });
  }

  revalidate([getImages.key, getEvents.key, getEvent.key]);
});
