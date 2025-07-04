import { Key } from "@solid-primitives/keyed";
import { A, createAsync, useNavigate, useParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { EventCard } from "~/components/EventCard";
import { Gallery, Slideshow } from "~/components/Gallery";
import { LoginGuard } from "~/components/LoginGuard";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Icon } from "~/components/ui/icon";
import { TownSign } from "~/components/ui/town-sign";
import { getEvents } from "~/server/getEvents";

import { getOrganization } from "~/server/getOrganization";
import { t } from "~/t";

export default () => {
  const params = useParams();
  const navigate = useNavigate();

  const organization = createAsync(
    async () => await getOrganization(params.id),
  );

  const events = createAsync(() =>
    getEvents({ query: "byOrganization", organizationId: params.id }),
  );

  const [slideshowIndex, setSlideshowIndex] = createSignal<number>();

  return (
    <LoginGuard>
      <main class="container flex flex-col gap-4 max-w-[1024px]">
        <div>
          <Button variant="link" class="p-0" onClick={() => navigate("/")}>
            <Icon iconId="arrow-left" size="lg" />
            {t.back}
          </Button>
        </div>

        <Show when={organization()}>
          <span class="flex items-center gap-4">
            <Show when={organization()?.imageId}>
              {(imageId) => (
                <img
                  alt={t.organization}
                  class="shadow-md border w-12 h-12 overflow-hidden rounded-full"
                  src={`/thumbnail/${imageId()}`}
                />
              )}
            </Show>
            <h1 class="text-4xl font-bold">{organization()?.name}</h1>
          </span>
          <div class="flex items-center justify-stretch gap-2">
            <A href={`/town/${organization()?.townId}`}>
              <TownSign class="h-12" name={organization()?.town?.name ?? ""} />
            </A>

            <p class="flex flex-col gap-1 text-muted-foreground py-2">
              <span>{`${organization()?.address}, ${organization()?.postCode}`}</span>
              <span>{`${t.vatId}: ${organization()?.vatId}`}</span>
              <Show when={organization()?.phone}>
                <a
                  href={`tel:${organization()?.phone}`}
                >{`${t.phone}: ${organization()?.phone}`}</a>
              </Show>
            </p>
          </div>

          <p class="whitespace-pre-wrap">{organization()?.presentation}</p>

          <Gallery
            images={organization()?.presentationImages ?? []}
            onPick={(id) =>
              setSlideshowIndex(
                (organization()?.presentationImages ?? []).indexOf(id),
              )
            }
          />

          <hr />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1024px]">
            <Key each={events() ?? []} by="id">
              {(event) => <EventCard event={event()} />}
            </Key>
          </div>
        </Show>
      </main>

      <Dialog
        open={slideshowIndex() !== undefined}
        onOpenChange={(v) =>
          v ? setSlideshowIndex(0) : setSlideshowIndex(undefined)
        }
      >
        <DialogContent class="flex flex-col items-stretch pt-12">
          <Slideshow
            images={organization()?.presentationImages ?? []}
            index={slideshowIndex() ?? 0}
            onIndexChange={setSlideshowIndex}
          />
        </DialogContent>
      </Dialog>
    </LoginGuard>
  );
};
