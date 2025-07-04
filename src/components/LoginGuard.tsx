import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { createEffect, type JSXElement, Show } from "solid-js";
import { getSession } from "~/server/getSession";

export function LoginGuard(props: { children?: JSXElement, organizationId?: string }) {
  const session = createAsync(() => getSession());
  const navigate = useNavigate();
  const location = useLocation();

  createEffect(() => {
    if (!session()?.user || (props.organizationId && props.organizationId !== session()?.user?.currentRole?.organizationId)) {
      navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`, {
        replace: true,
      });
    }
  });

  return <Show when={session()?.user?.id && (!props.organizationId || session()?.user?.currentRole?.organizationId === props.organizationId)}>{props.children}</Show>;
}
