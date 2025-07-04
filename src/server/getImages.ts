import { query } from "@solidjs/router";
import { eq, inArray } from "drizzle-orm";
import { db } from "~/db";
import { images } from "~/db/schema";
import { getSession } from "./getSession";

export const getImages = query(async (imageIds?: string[]) => {
  "use server";

  const session = await getSession();

  const myImages = await db.query.images.findMany({
    where: imageIds
      ? inArray(images.id, imageIds)
      : eq(images.createdBy, session.user?.currentRole?.organizationId ?? ""),
    orderBy: (images, { desc }) => [desc(images.createdAt)],
  });

  return myImages;
}, "getImages");
