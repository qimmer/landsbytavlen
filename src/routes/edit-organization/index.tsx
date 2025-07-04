import { createAsync, useAction, useNavigate } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { LoginGuard } from "~/components/LoginGuard";
import { UpsertOrganization } from "~/components/UpsertOrganization";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { TextField, TextFieldRoot } from "~/components/ui/textfield";
import { addRole } from "~/server/addRole";

import { getOrganization } from "~/server/getOrganization";
import { getOrganizationRoles } from "~/server/getOrganizationRoles";
import { getSession } from "~/server/getSession";
import { defaultOrganizationInput } from "~/server/upsertOrganization";
import { t } from "~/t";

export default () => {
  const navigate = useNavigate();
  const session = createAsync(() => getSession());

  const organization = createAsync(async () =>
    session()?.user?.currentRole?.id
      ? await getOrganization(session()!.user!.currentRole!.organizationId)
      : null,
  );

  const roles = createAsync(async () => getOrganizationRoles());
  const [newUserEmail, setNewUserEmail] = createSignal("");

  const addRoleAction = useAction(addRole);

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
        <h1 class="text-4xl font-semibold">
          {session()?.user?.currentRole?.id
            ? t.myOrganization
            : t.createOrganization}
        </h1>
        <Show when={!session()?.user?.currentRole?.id || organization()}>
          <UpsertOrganization
            organization={organization() ?? defaultOrganizationInput()}
          />
          <Show when={session()?.user?.currentRole?.id && organization()}>
            <hr />
            <div class="flex flex-col items-stretch gap-4">
              <h2 class="font-medium text-2xl">{t.roles}</h2>
              <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                <For each={roles()}>
                  {(role) => (
                    <>
                      <img
                        class="object-cover h-8 w-8 rounded-full overflow-hidden min-w-8 min-h-8"
                        src={role.user.image ?? ""}
                        alt=""
                      />
                      <span>{role.user.name}</span>
                      <Button variant="destructive">
                        <Icon iconId="trash" />
                      </Button>
                    </>
                  )}
                </For>
                <hr class="col-span-3 my-2" />
                <TextFieldRoot
                  class="col-span-2"
                  value={newUserEmail()}
                  onChange={setNewUserEmail}
                >
                  <TextField placeholder={t.email} type="email" />
                </TextFieldRoot>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await addRoleAction(newUserEmail());
                    setNewUserEmail("");
                  }}
                >
                  <Icon iconId="plus" />
                </Button>
              </div>
            </div>
          </Show>
        </Show>
      </main>
    </LoginGuard>
  );
};
