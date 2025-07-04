import { createAsync, useNavigate, useParams } from "@solidjs/router";
import type { InferSelectModel } from "drizzle-orm";
import { Show } from "solid-js";
import { Event } from "~/components/Event";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { Link } from "~/components/ui/link";
import type { events } from "~/db/schema";
import { getEvent } from "~/server/getEvent";
import { getSession } from "~/server/getSession";
import { t } from "~/t";

export default () => {
  const params = useParams();
  const navigate = useNavigate();
  const event = createAsync(async () => await getEvent(params.id));
  const session = createAsync(() => getSession());

  return (
    <main class="container flex flex-col gap-2 max-w-[800px]">
      <div class="flex items-center justify-between">
        <Button
          variant="link"
          class="self-start p-0"
          onClick={() => navigate(-1)}
        >
          <Icon iconId="arrow-left" size="lg" />
          {t.back}
        </Button>
        <Show
          when={
            session()?.user?.currentRole?.organizationId === event()?.createdBy
          }
        >
          <Link href={`/edit-event/${params.id}`} variant="outline">
            <Icon iconId="pencil" size="lg" />
            {t.editEvent}
          </Link>
        </Show>
      </div>
      <Show when={event()}>
        {(event) => (
          <Event event={event() as InferSelectModel<typeof events>} />
        )}
      </Show>
    </main>
  );
};
