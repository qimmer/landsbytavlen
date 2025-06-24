import { createResource, Show } from "solid-js";
import { login } from "~/lib/auth";
import { getSession } from "~/server/getSession";
import { t } from "~/t";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Icon } from "./ui/icon";

export default function Profile() {
  const [session] = createResource(() => getSession());

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
              onClick={() =>
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
          <DropdownMenuTrigger as={Button} variant="default">
            <Icon iconId="user" />
            {user().name}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Icon iconId="door-exit" />
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Show>
  );
}
