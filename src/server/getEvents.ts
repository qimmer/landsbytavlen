import { getSession } from "./getSession";

export async function getEvents() {
  "use server";

  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}
