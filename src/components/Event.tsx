import { A, createAsync } from "@solidjs/router";
import type { InferSelectModel } from "drizzle-orm";
import { createSignal, Show } from "solid-js";
import type { events, organizations, towns } from "~/db/schema";
import { formatDate } from "~/lib/formatDate";
import { getEvent } from "~/server/getEvent";
import { getGoogleMapsLocationUrl } from "~/server/getGoogleMapsLocationUrl";
import { getOrganization } from "~/server/getOrganization";
import { getTowns } from "~/server/getTowns";
import { t } from "~/t";
import { Gallery, Slideshow } from "./Gallery";
import { Dialog, DialogContent } from "./ui/dialog";
import DynamicMedia from "./ui/dynamic-media";
import { Icon } from "./ui/icon";
import { TownSign } from "./ui/town-sign";

export function Event(props: {
  event: InferSelectModel<typeof events> & {
    createdByOrg: InferSelectModel<typeof organizations> & {
      town: Omit<InferSelectModel<typeof towns>, "location">;
    };
  };
}) {
  const organization = createAsync(() =>
    getOrganization(props.event?.createdBy),
  );
  const locationUrl = createAsync(() =>
    getGoogleMapsLocationUrl(props.event.id),
  );

  const [slideshowIndex, setSlideshowIndex] = createSignal<number>();
  return (
    <div class="flex flex-col items-stretch gap-4">
      <div class="flex items-center justify-between gap-2">
        <h1 class="text-4xl font-bold">{props.event.title}</h1>
        <A
          href={`/organization/${props.event.createdBy}`}
          class="font-medium flex items-center gap-2"
        >
          <Show when={organization()?.imageId}>
            {(imageId) => (
              <img
                alt={t.organization}
                class="shadow-md border w-8 h-8 overflow-hidden rounded-full"
                src={`/thumbnail/${imageId()}`}
              />
            )}
          </Show>
          {organization()?.name}
        </A>
      </div>

      <h2 class="text-xl font-medium flex items-center justify-between gap-2">
        <span class="flex items-center gap-2">
          <a
            href={locationUrl()}
            target="_blank"
            class="flex items-center gap-2"
          >
            <Icon iconId="location" size="xl" />
            {props.event.location}
          </a>
          <A href={`/town/${props.event.createdByOrg.townId}`}>
            <TownSign class="h-8" name={props.event.createdByOrg.town.name} />
          </A>
        </span>

        <span class="flex items-center gap-2">
          {formatDate(props.event.start)}
          <Icon iconId="stopwatch" size="xl" />
        </span>
      </h2>
      <Show when={props.event.coverImageId}>
        <DynamicMedia
          alt={t.coverImage}
          class="rounded-lg shadow-md w-full max-w-full overflow-hidden object-cover aspect-video max-h-96"
          src={`/image/${props.event.coverImageId}`}
          controls
          autoplay
          loop
          muted
        />
      </Show>

      <Gallery
        images={props.event.images}
        onPick={(id) => setSlideshowIndex(props.event.images.indexOf(id))}
      />

      <article class="prose xl:prose-xl text-foreground whitespace-pre-wrap max-w-full">
        {props.event.description}
      </article>

      <Dialog
        open={slideshowIndex() !== undefined}
        onOpenChange={(v) =>
          v ? setSlideshowIndex(0) : setSlideshowIndex(undefined)
        }
      >
        <DialogContent class="flex flex-col items-stretch pt-12">
          <Slideshow
            images={props.event.images}
            index={slideshowIndex() ?? 0}
            onIndexChange={setSlideshowIndex}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
