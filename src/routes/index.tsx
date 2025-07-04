import { Key } from "@solid-primitives/keyed";
import { A, createAsync, useNavigate } from "@solidjs/router";
import { orderBy, range } from "lodash-es";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import { EventCard } from "~/components/EventCard";
import { Link } from "~/components/ui/link";
import { TownSign } from "~/components/ui/town-sign";
import { mod } from "~/lib/mod";
import { getEvents } from "~/server/getEvents";
import { getSession } from "~/server/getSession";
import { getSubscriptions } from "~/server/getSubscriptions";
import { getTowns } from "~/server/getTowns";
import { t } from "~/t";

type Point = { x: number; y: number; scale: number; t: number; name: string };

const randomNames = [
  "Abildholt",
  "Søgård",
  "Kongsted",
  "Bastrup",
  "Hedeby",
  "Sterup",
  "Salene",
  "Bedsted",
  "Lyngby",
  "Nærum",
  "Bjergsted",
  "Hedehuse",
  "Grimstrup",
  "Møldam",
  "Egeris",
  "Tylstrup",
  "Sulsted",
  "Vestbjerg",
  "Aabenraa",
];

function randomNormal(mean: number, stdDev: number) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // avoid log(0)
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

function getCenteredPoints(
  count: number,
  width: number,
  height: number,
): Point[] {
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy) * 0.8; // distance to farthest corner

  return orderBy(
    Array.from({ length: count }, (_, i) => {
      const x = Math.min(
        width,
        Math.max(0, randomNormal(width / 3, width / 5)),
      );
      const y = Math.min(
        height,
        Math.max(0, randomNormal(height / 3, height / 5)),
      );
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = 1 - dist / maxDist;
      const scale =
        0.7 + Math.min(1.8, Math.max(1.0, randomNormal(1, 0.2))) * t * 1.5;
      const name =
        randomNames[Math.floor(mod(i, randomNames.length ?? 0))] ?? "";

      return {
        x,
        y,
        t,
        scale,
        name,
      };
    }),
    (x) => x.t,
  );
}

export default () => {
  const session = createAsync(() => getSession());
  const mySubscriptions = createAsync(() => getSubscriptions());
  const events = createAsync(() => getEvents({ query: "subscribed" }));
  const navigate = useNavigate();
  const [points, setPoints] = createSignal<Point[]>([]);
  let containerRef: HTMLDivElement | undefined;

  onMount(() => {
    if (containerRef) {
      const { offsetWidth, offsetHeight } = containerRef;
      setPoints(getCenteredPoints(20, offsetWidth, offsetHeight));
    }
  });
  // If we have no subscriptions, we redirect to the welcome screen.
  createEffect(
    () =>
      session()?.user &&
      mySubscriptions()?.length === 0 &&
      navigate("/welcome"),
  );

  return (
    <main class="container max-w-[1024px] justify-center items-center min-h-full">
      <Show
        when={session()?.user}
        fallback={
          <>
            <div class="absolute bottom-0 left-0 right-0 overflow-hidden before:absolute w-full self-end opacity-50 max-h-[60dvh] -z-10">
              <video
                src="/hero.mp4"
                autoplay
                playsinline
                muted
                loop
                class="block w-[calc(100%+4px)] h-[calc(100%+4px)] -m-[2px] object-cover rounded-xl min-h-[50dvh]"
              />
            </div>
            <div class="z-10 flex gap-32 flex-wrap">
              <div class="gap-8 flex flex-col md:pt-32">
                <div>
                  <For each={t.heroTitle}>
                    {(titleSection, i) => (
                      <h1
                        data-index={i()}
                        class="text-6xl font-bold tracking-tighter data-[index=1]:text-accent data-[index=1]:text-7xl"
                      >
                        {titleSection}
                      </h1>
                    )}
                  </For>
                </div>
                <h2 class="text-4xl font-semibold tracking-tighter">
                  {t.heroSubTitle}
                </h2>
                <div>
                  <Link
                    size="lg"
                    variant="default"
                    href="/login"
                    class="py-6 px-12 z-20 shadow-accent shadow-lg"
                  >
                    {t.login}
                  </Link>
                </div>
              </div>
              <div
                class="relative flex-1 min-h-[60dvh]"
                ref={(el) => {
                  containerRef = el;
                }}
              >
                <For each={points()}>
                  {(p) => (
                    <div
                      class="absolute"
                      style={{
                        top: `${p.y}px`,
                        left: `${p.x}px`,
                        scale: `${p.scale * 100}% ${p.scale * 100}%`,
                      }}
                    >
                      <TownSign
                        class="h-10 shadow-md rounded-lg"
                        name={p.name}
                      />
                    </div>
                  )}
                </For>
              </div>
            </div>
          </>
        }
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <Key each={events() ?? []} by="id">
            {(event) => <EventCard event={event()} />}
          </Key>
        </div>
      </Show>
    </main>
  );
};
