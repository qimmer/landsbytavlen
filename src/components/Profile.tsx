import { A, createAsync, useAction, useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import { login } from "~/lib/login";
import { logout } from "~/lib/logout";
import { getRoles } from "~/server/getRoles";
import { getSession } from "~/server/getSession";
import { getSubscriptions } from "~/server/getSubscriptions";
import { setRole } from "~/server/setRole";
import { t } from "~/t";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Icon } from "./ui/icon";

export default function Profile() {
  const session = createAsync(() => getSession());
  const roles = createAsync(() => getRoles());
  const subscriptions = createAsync(() => getSubscriptions());
  const setRoleAction = useAction(setRole);

  return (
    <Show
      when={session()?.user}
      fallback={
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} variant="default">
            <Icon iconId="user" />
            {t.login}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={(_e) =>
                login("google", {
                  loginReturnUrl: "/",
                })
              }
            >
              <Icon iconId="brand-google" />
              {t.google}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                login("facebook", {
                  loginReturnUrl: "/",
                })
              }
            >
              <Icon iconId="brand-facebook" />
              {t.facebook}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                login("microsoft", {
                  loginReturnUrl: "/",
                })
              }
            >
              <Icon iconId="brand-office" />
              {t.microsoft}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      {(user) => (
        <DropdownMenu>
          <DropdownMenuTrigger as={Button} variant="ghost">
            <div class="flex flex-col items-end overflow-hidden max-w-40">
              <span class="truncate max-w-full text-left">{user().name}</span>
              <Show when={user().currentRole?.organization}>
                <span class="truncate max-w-full text-left text-muted-foreground flex items-center">
                  <Icon iconId="users-group" />
                  {user().currentRole?.organization?.name}
                </span>
              </Show>
            </div>
            <Show
              when={user().currentRole?.organization?.imageId}
              fallback={
                <Show when={user().image} fallback={<Icon iconId="user" />}>
                  {(imageUrl) => (
                    <img
                      alt=""
                      src={imageUrl()}
                      class="min-w-10 min-h-10 w-10 h-10 object-cover overflow-hidden rounded-full shadow-md border"
                    />
                  )}
                </Show>
              }
            >
              {(imageId) => (
                <img
                  alt=""
                  src={`/thumbnail/${imageId()}`}
                  class="min-w-10 min-h-10 w-10 h-10 object-cover overflow-hidden rounded-full shadow-md border"
                />
              )}
            </Show>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem as={A} href="/profile">
              <Icon iconId="user" />
              {t.myProfile}
            </DropdownMenuItem>
            <DropdownMenuItem as={A} href="/edit-organization">
              <Icon iconId="users-group" />
              {session()?.user?.currentRole?.id
                ? t.myOrganization
                : t.createOrganization}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Show when={roles()?.length}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Icon iconId="users-group" />
                  {t.roles}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    onClick={() => {
                      setRoleAction(null);
                    }}
                    checked={!session()?.user?.currentRole}
                  >
                    <Icon iconId="user" />
                    {t.me}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <For
                    each={roles()}
                    fallback={
                      <div class="text-sm text-muted-foreground text-center p-2 select-none">
                        {t.noRoles}
                      </div>
                    }
                  >
                    {(role) => (
                      <DropdownMenuCheckboxItem
                        onClick={() => setRoleAction(role.id)}
                        checked={session()?.user?.currentRoleId === role.id}
                      >
                        <Icon iconId="users-group" />
                        {role.organization.name}
                      </DropdownMenuCheckboxItem>
                    )}
                  </For>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </Show>
            <Show when={subscriptions()?.length}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Icon iconId="building-skyscraper" />
                  {t.towns}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    class="flex items-center gap-2"
                    as={A}
                    href="/profile"
                  >
                    <Icon iconId="plus" />
                    {t.add}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <For
                    each={subscriptions()}
                    fallback={
                      <div class="text-sm text-muted-foreground text-center p-2 select-none">
                        {t.noSubscriptions}
                      </div>
                    }
                  >
                    {(sub) => (
                      <DropdownMenuItem
                        class="flex items-center gap-2"
                        as={A}
                        href={`/town/${sub.townId}`}
                      >
                        <Icon iconId="building-skyscraper" />
                        {sub.town.name}
                      </DropdownMenuItem>
                    )}
                  </For>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </Show>
            <DropdownMenuItem onClick={() => logout({ logoutReturnUrl: "/" })}>
              <Icon iconId="door-exit" />
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Show>
  );
}
