import { A } from "@solidjs/router";
import type { InferSelectModel } from "drizzle-orm";
import { type JSX, Show } from "solid-js";
import type { events, organizations, towns } from "~/db/schema";
import { formatDate } from "~/lib/formatDate";
import { t } from "~/t";
import DynamicMedia from "./ui/dynamic-media";
import { Icon } from "./ui/icon";
import { TownSign } from "./ui/town-sign";

export function EventCard(
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    event: InferSelectModel<typeof events> & {
      createdByOrg: InferSelectModel<typeof organizations> & {
        town: Omit<InferSelectModel<typeof towns>, "location">;
      };
    };
  },
) {
  return (
    <div class="rounded-lg shadow-md border bg-background flex flex-col items-stretch gap-2">
      <div class="flex flex-col items-stretch py-2">
        <h2 class="text-base font-medium flex items-center justify-between gap-2 px-2">
          <A
            href={`/organization/${props.event.createdBy}`}
            class="font-medium flex items-center gap-2"
          >
            <Show when={props.event.createdByOrg.imageId}>
              {(imageId) => (
                <img
                  alt={t.organization}
                  class="shadow-md border w-8 h-8 overflow-hidden rounded-full"
                  src={`/thumbnail/${imageId()}`}
                />
              )}
            </Show>
            {props.event.createdByOrg.name}
          </A>
          <span class="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${props.event?.location ?? ""} ${props.event?.createdByOrg?.town?.name ?? ""} ${props.event?.createdByOrg?.town?.municipality ?? ""}`)}`}
              class="flex items-center gap-2"
            >
              <Icon iconId="location" size="lg" />
              {props.event.location}
            </a>
            <A href={`/town/${props.event.createdByOrg.townId}`}>
              <TownSign class="h-8" name={props.event.createdByOrg.town.name} />
            </A>
          </span>
        </h2>
        <A
          class="flex items-center justify-between gap-2 px-2 py-1"
          href={`/event/${props.event.id}`}
        >
          <h2 class="text-2xl font-semibold">{props.event.title}</h2>
          <span class="flex items-center gap-2">
            {formatDate(props.event.start)}
            <Icon iconId="stopwatch" size="lg" />
          </span>
        </A>
        <A href={`/event/${props.event.id}`}>
          <Show when={props.event.coverImageId}>
            <DynamicMedia
              alt="cover"
              class="w-full max-w-full overflow-hidden object-cover aspect-video max-h-64"
              src={`/preview/${props.event.coverImageId}`}
            />
          </Show>
        </A>

        <A
          href={`/event/${props.event.id}`}
          class="text-base text-foreground whitespace-pre-wrap max-w-full px-2 line-clamp-5 pt-2"
        >
          {props.event.description}
        </A>
      </div>
    </div>
  );
}
