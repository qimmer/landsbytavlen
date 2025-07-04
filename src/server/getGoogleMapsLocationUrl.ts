import { getEvent } from "./getEvent";
import { getTowns } from "./getTowns";

export async function getGoogleMapsLocationUrl(eventId: string) {
  "use server";

  const event = await getEvent(eventId);
  const towns = await getTowns();
  const town = towns?.find((x) => x.id === event?.createdByOrg?.townId);

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event?.location ?? ""} ${town?.name ?? ""} ${town?.municipality ?? ""}`)}`;
}