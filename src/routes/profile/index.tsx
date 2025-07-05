import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { LoginGuard } from "~/components/LoginGuard";
import { TownSelect } from "~/components/TownSelect";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { TownSign } from "~/components/ui/town-sign";
import {
  VirtualSelect,
  VirtualSelectContent,
  VirtualSelectTrigger,
} from "~/components/ui/virtual-select";
import { addSubscription } from "~/server/addSubscription";
import { getRoles } from "~/server/getRoles";

import { getSession } from "~/server/getSession";
import { getSubscriptions } from "~/server/getSubscriptions";
import { getTowns } from "~/server/getTowns";
import { removeRole } from "~/server/removeRole";
import { removeSubscription } from "~/server/removeSubscription";
import { t } from "~/t";

export default () => {
  const navigate = useNavigate();
  const session = createAsync(() => getSession());
  const roles = createAsync(() => getRoles());
  const mySubscriptions = createAsync(() => getSubscriptions());
  const addSubscriptionAction = useAction(addSubscription);
  const removeSubscriptionAction = useAction(removeSubscription);
  const removeRoleAction = useAction(removeRole);
  const [newTownId, setNewTownId] = createSignal<string>();

  return (
    <LoginGuard>
      <main class="container flex-col flex items-stretch gap-8">
        <Button
          variant="link"
          class="self-start p-0"
          onClick={() => navigate(-1)}
        >
          <Icon iconId="arrow-left" size="lg" />
          {t.back}
        </Button>
        <h1 class="text-4xl font-semibold">{t.myProfile}</h1>
        <Show when={session()?.user}>
          {(user) => (
            <div class="flex flex-col items-stretch gap-8">
              <div class="flex items-stretch gap-4">
                <img
                  class="object-cover h-16 w-16 rounded-full overflow-hidden min-w-16 min-h-16"
                  src={user().image ?? ""}
                  alt=""
                />
                <div class="grid grid-cols-3 gap-2">
                  <span>{t.name}:</span>
                  <span class="text-muted-foreground col-span-2">
                    {user().name}
                  </span>
                  <span>{t.email}:</span>
                  <span class="text-muted-foreground col-span-2">
                    {user().email}
                  </span>
                </div>
              </div>
              <Show when={roles()?.length}>
                <hr />
                <div class="flex flex-col items-stretch gap-4">
                  <h2 class="font-medium text-2xl">{t.roles}</h2>
                  <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                    <For each={roles()}>
                      {(role) => (
                        <>
                          <Icon iconId="users-group" size="xl" />
                          <span>{role.organization.name}</span>
                          <Button
                            variant="destructive"
                            onClick={() => removeRoleAction(role.id)}
                          >
                            <Icon iconId="trash" />
                          </Button>
                        </>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              <Show when={session()?.user?.id}>
                <hr />
                <div class="flex flex-col items-stretch gap-4">
                  <h2 class="font-medium text-2xl">{t.towns}</h2>
                  <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                    <For each={mySubscriptions()}>
                      {(subscription) => (
                        <>
                          <TownSign
                            class="h-10 col-span-2 justify-self-end"
                            name={subscription.town.name}
                          />
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

                    <div />
                    <TownSelect class="col-span-2" placeholder={`${t.chooseTowns}...`} value="" onChange={(townId) => townId && addSubscriptionAction(townId)} />
                  </div>
                </div>
              </Show>
            </div>
          )}
        </Show>
      </main>
    </LoginGuard>
  );
};
