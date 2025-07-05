import { groupBy, orderBy } from "lodash-es";
import { createEffect, createMemo, createSignal, JSX, on } from "solid-js";
import { t } from "~/t";
import { VirtualSelect, VirtualSelectContent, VirtualSelectTrigger } from "./ui/virtual-select";
import { Button } from "./ui/button";
import { createAsync } from "@solidjs/router";
import { getTowns } from "~/server/getTowns";
import { cn } from "~/lib/cn";

export function TownSelect(props: Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> & {
  value: string | null | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: JSX.Element;
}) {
  const allTowns = createAsync(() => getTowns());
  const townsByMunicipality = createMemo(() => groupBy(allTowns() ?? [], "municipality"));
  const municipalities = createMemo(() => orderBy(Object.keys(townsByMunicipality()), x => x));
  const [municipality, setMunicipality] = createSignal("");

  createEffect(on(() => [props.value, allTowns()] as const, ([newValue, allTowns]) => {
    const town = allTowns?.find(x => x.id === newValue);

    if (town && municipality() !== town.municipality) {
      setMunicipality(town.municipality);
    }
  }));

  return (
    <div class={cn("flex flex-col gap-2 items-stretch", props.class)}>
      <VirtualSelect
        height={400}
        rowHeight={32}
        options={municipalities()}
        optionTitle={(x) => (
          <div class="max-w-full w-full overflow-hidden text-start">
            <span class="truncate">{x ?? ""}</span>
          </div>
        )}
        optionValue={x => x}
        value={municipality()}
        onChange={setMunicipality}
      >
        <VirtualSelectTrigger as={Button} variant="outline">
          {t.chooseMunicipality}...
        </VirtualSelectTrigger>
        <VirtualSelectContent />
      </VirtualSelect>

      <VirtualSelect
        value={props.value ?? ""}
        onChange={props.onChange}
        options={townsByMunicipality()[municipality()] ?? []}
        height={400}
        rowHeight={32}
        optionTitle={(x) => (
          <div class="max-w-full w-full overflow-hidden text-start">
            <span class="truncate">{x?.name ?? ""}</span>
          </div>
        )}
        optionValue={(x) => x?.id}
      >
        <VirtualSelectTrigger
          as={Button}
          variant="outline"
          class="flex items-center w-full col-span-3"
        >
          {props.placeholder}
        </VirtualSelectTrigger>

        <VirtualSelectContent />
      </VirtualSelect>
    </div>
  );
}