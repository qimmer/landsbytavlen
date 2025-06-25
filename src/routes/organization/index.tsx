import { createAsync } from "@solidjs/router";
import { LoginGuard } from "~/components/LoginGuard";
import { UpsertOrganization } from "~/components/UpsertOrganization";

import { getOrganization } from "~/server/getOrganization";
import { getSession } from "~/server/getSession";
import { defaultOrganizationInput } from "~/server/upsertOrganization";
import { t } from "~/t";

export default () => {
  const session = createAsync(() => getSession());

  const organization = createAsync(async () =>
    session.latest?.role?.id
      ? ((await getOrganization(session.latest.role.organizationId)) ??
        defaultOrganizationInput())
      : defaultOrganizationInput(),
  );

  return (
    <LoginGuard>
      <div class="container max-w-96 flex-col flex items-stretch gap-8">
        <h1 class="text-4xl font-semibold text-center">{t.organization}</h1>
        <UpsertOrganization
          organization={organization() ?? defaultOrganizationInput()}
        />
      </div>
    </LoginGuard>
    
  );
};
