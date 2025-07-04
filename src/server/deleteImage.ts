import { action, revalidate } from "@solidjs/router";
import { and, eq } from "drizzle-orm";
import { db, s3 } from "~/db";
import { images } from "~/db/schema";
import { getImages } from "./getImages";
import { getSession } from "./getSession";

export const deleteImage = action(async (id: string) => {
  "use server";

  const session = await getSession();

  if (!session.user?.currentRole?.organizationId) {
    throw new Error("errors.notAuthorized");
  }

  const deleted = (
    await db
      .delete(images)
      .where(
        and(
          eq(images.createdBy, session.user.currentRole.organizationId),
          eq(images.id, id),
        ),
      )
      .returning()
  ).length;

  if (deleted > 0) {
    await s3.removeObject(process.env.S3_BUCKET ?? "", id);
    revalidate([getImages.key]);
  }
});
