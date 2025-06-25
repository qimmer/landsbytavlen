import Facebook from "@auth/core/providers/facebook";
import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { SolidAuthConfig } from "@auth/solid-start";
import { eq } from "drizzle-orm";
import {
  accounts,
  authenticators,
  roles,
  sessions,
  users,
  verificationTokens,
} from "~/db/schema";
import type { SessionData } from "~/server/getSession";
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
  callbacks: {
    async session({ session, token, user }) {
      const email = user?.email ?? token?.email;
      if (!email) {
        return { ...session };
      }

      const [{ users: dbUser, roles: dbRole }] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .leftJoin(roles, eq(users.currentRoleId, roles.id));

      const sessionWithUser = {
        ...session,
        user: { ...session.user, ...dbUser },
        role: dbRole,
      } as SessionData;

      return sessionWithUser;
    },
  },
};
