CREATE TABLE "drizzle"."accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "drizzle"."authenticators" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "drizzle"."events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"end" timestamp with time zone NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"coverImageId" varchar(64),
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"deletedAt" timestamp with time zone,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drizzle"."images" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"createdBy" varchar(64),
	"fileName" text NOT NULL,
	"mimeType" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drizzle"."mutes" (
	"userId" varchar(64) NOT NULL,
	"organizationId" varchar(64) NOT NULL,
	CONSTRAINT "mutes_userId_organizationId_pk" PRIMARY KEY("userId","organizationId")
);
--> statement-breakpoint
CREATE TABLE "drizzle"."organizations" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"vatId" varchar(64) DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"presentation" text DEFAULT '' NOT NULL,
	"address" text NOT NULL,
	"isCharity" boolean NOT NULL,
	"postCode" varchar(4) NOT NULL,
	"townId" varchar(64) NOT NULL,
	"imageId" varchar(64),
	"presentationImages" text[] DEFAULT '{}' NOT NULL,
	"createdBy" varchar(64),
	"createdAt" timestamp with time zone,
	"deletedAt" timestamp with time zone,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_vatId_unique" UNIQUE("vatId")
);
--> statement-breakpoint
CREATE TABLE "drizzle"."posts" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"eventId" varchar(64) NOT NULL,
	"createdBy" varchar(64),
	"createdAt" timestamp with time zone,
	"deletedAt" timestamp with time zone,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drizzle"."roles" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"organizationId" varchar(64) NOT NULL,
	"userGroups" text[] NOT NULL,
	CONSTRAINT "roles_userId_organizationId_unique" UNIQUE("userId","organizationId")
);
--> statement-breakpoint
CREATE TABLE "drizzle"."sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drizzle"."subscriptions" (
	"userId" varchar(64) NOT NULL,
	"townId" varchar(64) NOT NULL,
	CONSTRAINT "subscriptions_userId_townId_pk" PRIMARY KEY("userId","townId")
);
--> statement-breakpoint
CREATE TABLE "drizzle"."towns" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"municipality" varchar(64) NOT NULL,
	"location" geometry(point) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drizzle"."users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"name" text,
	"image" text,
	"currentRoleId" varchar(64),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "drizzle"."verificationTokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "drizzle"."accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "drizzle"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."authenticators" ADD CONSTRAINT "authenticators_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "drizzle"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."events" ADD CONSTRAINT "events_createdBy_organizations_id_fk" FOREIGN KEY ("createdBy") REFERENCES "drizzle"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."images" ADD CONSTRAINT "images_createdBy_organizations_id_fk" FOREIGN KEY ("createdBy") REFERENCES "drizzle"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."mutes" ADD CONSTRAINT "mutes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "drizzle"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."mutes" ADD CONSTRAINT "mutes_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "drizzle"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."organizations" ADD CONSTRAINT "organizations_townId_towns_id_fk" FOREIGN KEY ("townId") REFERENCES "drizzle"."towns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."organizations" ADD CONSTRAINT "organizations_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "drizzle"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."posts" ADD CONSTRAINT "posts_eventId_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "drizzle"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."posts" ADD CONSTRAINT "posts_createdBy_organizations_id_fk" FOREIGN KEY ("createdBy") REFERENCES "drizzle"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."roles" ADD CONSTRAINT "roles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "drizzle"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."roles" ADD CONSTRAINT "roles_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "drizzle"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "drizzle"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."subscriptions" ADD CONSTRAINT "subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "drizzle"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."subscriptions" ADD CONSTRAINT "subscriptions_townId_towns_id_fk" FOREIGN KEY ("townId") REFERENCES "drizzle"."towns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drizzle"."users" ADD CONSTRAINT "users_currentRoleId_roles_id_fk" FOREIGN KEY ("currentRoleId") REFERENCES "drizzle"."roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_title_search_index" ON "drizzle"."events" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "events_deleted_null_idx" ON "drizzle"."events" USING btree ("id") WHERE "drizzle"."events"."deletedAt" IS NULL;--> statement-breakpoint
CREATE INDEX "events_updated_at_idx" ON "drizzle"."events" USING btree ("updatedAt");--> statement-breakpoint
CREATE INDEX "images_created_at_idx" ON "drizzle"."images" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "posts_title_search_index" ON "drizzle"."posts" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "posts_deleted_null_idx" ON "drizzle"."posts" USING btree ("id") WHERE "drizzle"."posts"."deletedAt" IS NULL;--> statement-breakpoint
CREATE INDEX "posts_updated_at_idx" ON "drizzle"."posts" USING btree ("updatedAt");