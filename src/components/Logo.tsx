import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

export function Logo(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      class={cn(
        "flex items-center text-xl font-black tracking-[-0.75pt] select-none",
        props.class,
      )}
    >
      <div class="-translate-y-1">LANDSBY</div>
      <div class="text-3xl leading-0 font-semibold -translate-y-0.5 -mx-0.5">
        /
      </div>
      <div class="text-destructive translate-y-1">TAVLEN</div>
    </div>
  );
}
