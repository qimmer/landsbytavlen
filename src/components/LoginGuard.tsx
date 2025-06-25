import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { createEffect, type JSXElement, Show } from "solid-js";
import { getSession } from "~/server/getSession";

export function LoginGuard(props: { children?: JSXElement }) {
  const session = createAsync(() => getSession());
  const navigate = useNavigate();
  const location = useLocation();

  createEffect(() => {
    if (!session()?.user) {
      navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`, {
        replace: true,
      });
    }
  });

  return <Show when={session()?.user?.id}>{props.children}</Show>;
}
