import { Auth } from "@auth/core";
import { getRequestEvent } from "solid-js/web";
import type { User } from "~/routes/api/auth/[...auth]";

export type SessionData = {
  user?: User | null;
};

export async function getSession() {
  "use server";

  const authConfig = (await import("~/lib/auth")).authConfig;

  if (!authConfig) {
    return {};
  }

  authConfig.secret ??= process.env.AUTH_SECRET;
  authConfig.trustHost ??= true;

  const event = getRequestEvent();

  const url = new URL(`/api/auth/session`, event?.request.url ?? "");

  const response = await Auth(
    new Request(url, {
      credentials: "include",
      headers: event?.request.headers ?? {},
    }),
    authConfig,
  );

  const data = await response.json();
  return !data || !Object.keys(data).length || response.status !== 200
    ? ({} as SessionData)
    : (data as SessionData);
}
