import { createAsync, useNavigate, useParams } from "@solidjs/router";
import { LoginGuard } from "~/components/LoginGuard";
import { UpsertEvent } from "~/components/UpsertEvent";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { getEvent } from "~/server/getEvent";
import { getSession } from "~/server/getSession";
import { defaultEventInput } from "~/server/upsertEvent";
import { t } from "~/t";

export default () => {
  const params = useParams();
  const session = createAsync(() => getSession());
  const event = createAsync(async () =>
    params.id
      ? await getEvent(params.id)
      : {
          ...defaultEventInput(),
          createdBy: session()?.user?.currentRole?.organizationId,
        },
  );
  const navigate = useNavigate();

  return (
    <LoginGuard organizationId={event()?.createdBy}>
      <main class="container flex flex-col gap-8 max-w-[800px]">
        <Button
          variant="link"
          class="self-start p-0"
          onClick={() => navigate(-1)}
        >
          <Icon iconId="arrow-left" size="lg" />
          {t.back}
        </Button>
        <UpsertEvent
          event={event()!}
          onSaved={() => navigate("/", { replace: true })}
        />
      </main>
    </LoginGuard>
  );
};
