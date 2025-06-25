import { useParams } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import { UpsertEvent } from "~/components/UpsertEvent";
import { getEvent } from "~/server/getEvent";
import { defaultEventInput, type UpsertEventInput } from "~/server/upsertEvent";

export default () => {
  const eventId = useParams().id;
  const [event] = createResource<UpsertEventInput>(async () =>
    eventId
      ? ((await getEvent(eventId)) ?? defaultEventInput())
      : defaultEventInput(),
  );

  return (
    <Show when={event()}>{(event) => <UpsertEvent event={event()} />}</Show>
  );
};
