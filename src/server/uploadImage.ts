import { action, revalidate } from "@solidjs/router";
import { getImages } from "./getImages";

export const uploadImage = action(async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  revalidate(getImages.key);

  return await res.json();
});
