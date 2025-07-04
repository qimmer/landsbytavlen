import { createAsync, useAction } from "@solidjs/router";
import { createSignal, For } from "solid-js";
import { addSubscription } from "~/server/addSubscription";
import { getSubscriptions } from "~/server/getSubscriptions";
import { getTowns } from "~/server/getTowns";
import { removeSubscription } from "~/server/removeSubscription";
import { t } from "~/t";
import { Button } from "./ui/button";
import { Icon } from "./ui/icon";
import {
  VirtualSelect,
  VirtualSelectContent,
  VirtualSelectTrigger,
} from "./ui/virtual-select";

export function UpsertSubscriptions() {
  const myTowns = createAsync(() => getTowns());
  const mySubscriptions = createAsync(() => getSubscriptions());
  const addSubscriptionAction = useAction(addSubscription);
  const removeSubscriptionAction = useAction(removeSubscription);

  return (
    <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
      <For each={mySubscriptions()}>
        {(subscription) => (
          <>
            <Icon iconId="building-skyscraper" size="xl" />
            <span>{subscription.town.name}</span>
            <Button
              variant="destructive"
              onClick={() => removeSubscriptionAction(subscription.townId)}
            >
              <Icon iconId="trash" />
            </Button>
          </>
        )}
      </For>
      <VirtualSelect
        value=""
        onChange={(townId) => townId && addSubscriptionAction(townId)}
        options={myTowns() ?? []}
        height={400}
        rowHeight={32}
        optionTitle={(x) => (
          <div class="flex items-center gap-2 justify-between max-w-full w-full overflow-hidden">
            <span class="truncate basis-full text-start">{x?.name ?? ""}</span>
            <span class="truncate basis-full text-muted-foreground text-end">
              {x?.municipality ?? ""}
            </span>
          </div>
        )}
        optionValue={(x) => x?.id}
      >
        <VirtualSelectTrigger
          as={Button}
          variant="outline"
          class="flex items-center w-full col-span-3"
        >
          {t.chooseTowns}...
        </VirtualSelectTrigger>

        <VirtualSelectContent />
      </VirtualSelect>
    </div>
  );
}
