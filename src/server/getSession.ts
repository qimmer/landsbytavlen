import { Auth } from "@auth/core";
import { query } from "@solidjs/router";
import type { InferSelectModel } from "drizzle-orm";
import { getRequestEvent } from "solid-js/web";
import type { organizations, roles, users } from "~/db/schema";
import type { Session } from "~/routes/api/auth/[...auth]";

export type SessionData = Session & {
  user?: InferSelectModel<typeof users> & {
    currentRole?: InferSelectModel<typeof roles> & {
      organization: InferSelectModel<typeof organizations>;
    };
  };
};

export type SessionDataWithRole = SessionData & {
  user: InferSelectModel<typeof users> & {
    currentRole: InferSelectModel<typeof roles> & {
      organization: InferSelectModel<typeof organizations>;
    };
  };
};

export type SessionDataWithUser = SessionData & {
  user: InferSelectModel<typeof users> & {
    currentRole?: InferSelectModel<typeof roles> & {
      organization: InferSelectModel<typeof organizations>;
    };
  };
};
type GetSession = {
  (options?: { withRole?: false; withUser?: false }): Promise<SessionData>;
  (options: {
    withRole?: false;
    withUser?: true;
  }): Promise<SessionDataWithUser>;
  (options: { withRole: true; withUser?: false }): Promise<SessionDataWithRole>;
  (options: {
    withRole: true;
    withUser: true;
  }): Promise<SessionDataWithRole & SessionDataWithUser>;
  key: string;
};
export const getSession = query(
  async (options?: { withRole?: boolean; withUser?: boolean }) => {
    "use server";

    const authConfig = (await import("~/lib/auth")).authConfig;

    if (!authConfig) {
      throw new Error("No auth config.");
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

    const data = (await response.json()) as SessionData;

    if (!data || !Object.keys(data).length || response.status !== 200) {
      if (options?.withUser) {
        throw new Error("Needs to be logged in.");
      }

      return {
        expires: new Date().toISOString(),
      } as SessionData;
    }

    const session = data as SessionData;

    if (options?.withRole && !session.user?.currentRole) {
      throw new Error("Needs to be logged in as organization.");
    }
    if (options?.withUser && !session.user) {
      throw new Error("Needs to be logged in.");
    }

    return options?.withRole ? (session as SessionDataWithRole) : session;
  },
  "getSession",
) as unknown as GetSession;
