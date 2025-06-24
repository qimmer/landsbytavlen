import Facebook from "@auth/core/providers/facebook";
import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { SolidAuthConfig } from "@auth/solid-start";
import {
  accounts,
  authenticators,
  sessions,
  users,
  verificationTokens,
} from "~/db/schema";
import { db } from "../db";

export const authConfig: SolidAuthConfig = {
  basePath: "/api/auth",
  debug: process.env.NODE_ENV !== "production",
  secret: process.env.AUTH_SECRET,
  adapter: DrizzleAdapter(db, {
    accountsTable: accounts,
    usersTable: users,
    authenticatorsTable: authenticators,
    verificationTokensTable: verificationTokens,
    sessionsTable: sessions,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {},
};

export async function login(
  provider: "facebook" | "microsoft" | "credentials" | "google" | "twitch",
  config?: {
    loginReturnUrl?: string;
    logoutReturnUrl?: string;
    email?: string;
    inviteToken?: string;
  },
) {
  const signInUrl = `/api/auth/${provider === "credentials" ? "callback" : "signin"}/${provider}`;
  const csrfTokenResponse = await fetch(`/api/auth/csrf`);
  const { csrfToken } = await csrfTokenResponse.json();

  const res = await fetch(signInUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      ...(config ?? {}),
      csrfToken,
      callbackUrl: config?.loginReturnUrl ?? "/",
    }),
  });

  const data = await res.clone().json();

  const url = data.url ?? data.redirect ?? config?.logoutReturnUrl ?? "/";

  window.location.href = url;
  // If url contains a hash, the browser does not reload the page. We reload manually
  if (url.includes("#")) window.location.reload();
  return;
}

export async function logout(config?: {
  loginReturnUrl?: string;
  logoutReturnUrl?: string;
}) {
  const { callbackUrl = config?.logoutReturnUrl ?? "/" } = {};

  const csrfTokenResponse = await fetch(`/api/auth/csrf`);
  const { csrfToken } = await csrfTokenResponse.json();
  const res = await fetch(`/api/auth/signout`, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl,
    }),
  });
  const data = await res.json();

  const url = data.url ?? data.redirect ?? config?.logoutReturnUrl ?? "/";

  window.location.href = url;
  // If url contains a hash, the browser does not reload the page. We reload manually
  if (url.includes("#")) window.location.reload();
  return;
}
