import { Key } from "@solid-primitives/keyed";
import { A, createAsync, useNavigate, useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { EventCard } from "~/components/EventCard";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { TownSign } from "~/components/ui/town-sign";
import { getEvents } from "~/server/getEvents";
import { getOrganizations } from "~/server/getOrganizations";
import { getTown } from "~/server/getTown";
import { t } from "~/t";

export default () => {
  const params = useParams();
  const town = createAsync(() => getTown(params.id));
  const events = createAsync(() =>
    getEvents({ query: "byTown", townId: params.id }),
  );
  const organizations = createAsync(() => getOrganizations(params.id));
  const navigate = useNavigate();

  return (
    <main class="container flex flex-col gap-4 max-w-[1024px]">
      <div>
        <Button variant="link" class="p-0" onClick={() => navigate("/")}>
          <Icon iconId="arrow-left" size="lg" />
          {t.back}
        </Button>
      </div>
      <Show when={town()}>
        <div class="flex justify-around">
          <TownSign class="h-24" name={town()?.name ?? ""} />
        </div>

        <div class="flex flex-wrap max-w-[1024px] items-center gap-2">
          <Key each={organizations() ?? []} by="id">
            {(organization) => (
              <A
                href={`/organization/${organization().id}`}
                class="font-medium flex items-center gap-2 border shadow rounded-full px-2 py-1"
              >
                <Show when={organization().imageId}>
                  {(imageId) => (
                    <img
                      alt={t.organization}
                      class="shadow-md border w-8 h-8 overflow-hidden rounded-full"
                      src={`/thumbnail/${imageId()}`}
                    />
                  )}
                </Show>
                {organization().name}
              </A>
            )}
          </Key>
        </div>

        <hr />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[1024px]">
          <Key each={events() ?? []} by="id">
            {(event) => <EventCard event={event()} />}
          </Key>
        </div>
      </Show>
    </main>
  );
};
