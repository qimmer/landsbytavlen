import { Auth, type AuthConfig, customFetch } from "@auth/core";
import type { AuthAction } from "@auth/core/types";
import type { APIEvent } from "@solidjs/start/server";
import { authConfig } from "~/lib/auth";
export { customFetch };
export { AuthError, CredentialsSignin } from "@auth/core/errors";
export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from "@auth/core/types";

export interface SolidAuthConfig extends AuthConfig {
  /**
   * Defines the base path for the auth routes.
   * @default '/api/auth'
   */
  prefix?: string;
}

const actions: AuthAction[] = [
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error",
];

function SolidAuthHandler(prefix: string, authConfig?: SolidAuthConfig) {
  return async (event: APIEvent) => {
    const { request } = event;
    const url = new URL(request.url);
    const action = url.pathname
      .slice(prefix.length + 1)
      .split("/")[0] as AuthAction;

    if (!actions.includes(action) || !url.pathname.startsWith(`${prefix}/`)) {
      return;
    }

    return await Auth(request, authConfig!);
  };
}

if (!process.env.IS_SATELLITE) {
  authConfig!.secret ??= process.env.AUTH_SECRET;
  authConfig!.trustHost ??= !!(
    process.env.AUTH_TRUST_HOST ??
    process.env.VERCEL ??
    process.env.NODE_ENV !== "production"
  );
}

const handler = SolidAuthHandler(
  authConfig?.basePath ?? "/api/auth",
  authConfig,
);

export async function GET(event: APIEvent) {
  return await handler(event);
}
export async function POST(event: APIEvent) {
  return await handler(event);
}
