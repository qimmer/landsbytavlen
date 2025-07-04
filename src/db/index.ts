import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "minio";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema,
  logger: {
    logQuery(query, params) {
      if (
        process.env.VERBOSE !== "true" ||
        query.startsWith(`insert into "logMessages"`) ||
        query.startsWith(`select "users"."email",`) ||
        query.startsWith(`update "users"`)
      ) {
        return;
      }

      console.log(
        `\x1b[41m DB QUERY \x1b[0m \x1b[34m ${query}\x1b[0m\n`,
        params,
      );
    },
  },
});

export const s3 = new Client({
  endPoint: new URL(process.env.S3_ENDPOINT ?? "").hostname,
  port: Number.parseInt(new URL(process.env.S3_ENDPOINT ?? "").port),
  useSSL: false,
  accessKey: process.env.S3_ACCESS_KEY ?? "",
  secretKey: process.env.S3_SECRET_KEY ?? "",
  region: process.env.S3_REGION || undefined,
});
