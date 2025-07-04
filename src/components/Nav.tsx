import { A, createAsync } from "@solidjs/router";
import { For, Show } from "solid-js";
import { getSession } from "~/server/getSession";
import { getSubscriptions } from "~/server/getSubscriptions";
import { t } from "~/t";
import { Logo } from "./Logo";
import Profile from "./Profile";
import { Icon } from "./ui/icon";
import { Link } from "./ui/link";
import { TownSign } from "./ui/town-sign";

export default function Nav() {
  const session = createAsync(() => getSession());
  const mySubscriptions = createAsync(() => getSubscriptions());

  return (
    <div class="flex sticky top-0 z-50 items-center gap-2 p-2 bg-background shadow-lg">
      <div class="flex items-center gap-2 overflow-hidden">
        <A href="/">
          <Logo />
        </A>
        <For each={mySubscriptions()}>
          {(s) => (
            <A href={`/town/${s.townId}`}>
              <TownSign
                class="h-9 min-w-20 hidden md:flex"
                name={s.town.name}
              />
            </A>
          )}
        </For>
      </div>

      <div class="flex-1" />
      <div class="flex items-center gap-4">
        <Show when={session()?.user?.currentRole?.organizationId}>
          <Link variant="default" href="/edit-event">
            <Icon iconId="plus" /> {t.create}
          </Link>
        </Show>
        <Profile />
      </div>
    </div>
  );
}
