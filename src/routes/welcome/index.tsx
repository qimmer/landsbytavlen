import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { For } from "solid-js";
import { Logo } from "~/components/Logo";
import { TownSelect } from "~/components/TownSelect";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import {
  VirtualSelect,
  VirtualSelectContent,
  VirtualSelectTrigger,
} from "~/components/ui/virtual-select";
import { addSubscription } from "~/server/addSubscription";
import { getSubscriptions } from "~/server/getSubscriptions";
import { getTowns } from "~/server/getTowns";
import { removeSubscription } from "~/server/removeSubscription";
import { t } from "~/t";

export default () => {
  const mySubscriptions = createAsync(() => getSubscriptions());
  const myTowns = createAsync(() => getTowns());
  const addSubscriptionAction = useAction(addSubscription);
  const removeSubscriptionAction = useAction(removeSubscription);
  const navigate = useNavigate();

  return (
    <main class="container flex flex-col gap-8 justify-center items-stretch min-h-full">
      <div class="flex flex-col items-stretch gap-16">
        <Logo class="self-center scale-200 py-8" />
        <h1 class="font-bold text-4xl self-center">{t.welcome}</h1>
        <div class="flex flex-col gap-8 items-center">
          <h2 class="font-medium text-2xl self-center">{t.chooseTowns}:</h2>
          <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-center w-[400px]">
            <For each={mySubscriptions()}>
              {(subscription) => (
                <>
                  <Icon iconId="building-skyscraper" size="xl" />
                  <span>{subscription.town.name}</span>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      removeSubscriptionAction(subscription.townId)
                    }
                  >
                    <Icon iconId="trash" />
                  </Button>
                </>
              )}
            </For>

            <TownSelect class="col-span-3" placeholder={`${t.chooseTowns}...`} value=""
              onChange={(townId) => townId && addSubscriptionAction(townId)} />

          </div>
          <Button
            variant="default"
            onClick={() => navigate("/")}
            size="lg"
            disabled={!mySubscriptions()?.length}
          >
            {t.getGoing}
            <Icon iconId="check" />
          </Button>
        </div>
      </div>
    </main>
  );
};
