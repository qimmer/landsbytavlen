import type { InferSelectModel } from "drizzle-orm";
import type { towns } from "~/db/schema";

export function Town(props: { town: InferSelectModel<typeof towns> }) {
  return (
    <div class="flex items-center gap-2 justify-between max-w-full w-full overflow-hidden">
      <span class="truncate basis-full text-start">
        {props.town?.name ?? ""}
      </span>
      <span class="truncate basis-full text-muted-foreground text-end">
        {props.town?.municipality ?? ""}
      </span>
    </div>
  );
}
