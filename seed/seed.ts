import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "~/db";
import { towns } from "~/db/schema";

if (!("DATABASE_URL" in process.env)) throw new Error("DATABASE_URL not set.");

const main = async () => {
  console.log("Seed started ...");

  await db.transaction(async (db) => {
    const newTowns = JSON.parse(
      await fetch(
        "https://api.dataforsyningen.dk/steder?hovedtype=Bebyggelse&undertype=by",
      ).then((x) => x.text()),
    ).map(
      (by: {
        id: number;
        primærtnavn: string;
        visueltcenter: [number, number];
        kommuner: { navn: string }[];
      }) => {
        return {
          name: by.primærtnavn,
          id: String(by.id),
          location: by.visueltcenter,
          municipality: by.kommuner[0].navn,
        };
      },
    );

    await db
      .insert(towns)
      .values(newTowns)
      .onConflictDoUpdate({
        target: towns.id,
        set: {
          name: sql.raw(`excluded."${towns.name.name}"`),
          municipality: sql.raw(`excluded."${towns.municipality.name}"`),
          location: sql.raw(`excluded."${towns.location.name}"`),
        },
      });
  });

  console.log("Seed finished.");
};

await main();
process.exit(0);
