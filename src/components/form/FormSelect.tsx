import { Show, splitProps } from "solid-js";
import type { FormField } from "~/lib/createForm";
import { Button } from "../ui/button";
import {
  type TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "../ui/textfield";
import {
  VirtualSelect,
  VirtualSelectContent,
  VirtualSelectTrigger,
} from "../ui/virtual-select";

export function FormSelect<ItemT>(
  props: Omit<Parameters<typeof TextFieldRoot>[0], "validationState"> & {
    field: FormField<string>;
    label: string;
    required?: boolean;
    type?: Parameters<typeof TextField>[0]["type"];
  } & Pick<
      Parameters<typeof VirtualSelect<ItemT>>[0],
      "options" | "optionTitle" | "optionValue"
    >,
) {
  const [local, rest] = splitProps(props, [
    "options",
    "optionValue",
    "optionTitle",
  ]);

  return (
    <TextFieldRoot
      validationState={rest.field.state}
      class="flex flex-col gap-0"
    >
      <TextFieldLabel required={rest.required}>{rest.label}</TextFieldLabel>
      <VirtualSelect<ItemT>
        height={400}
        rowHeight={32}
        options={local.options}
        optionTitle={local.optionTitle}
        optionValue={local.optionValue}
        value={rest.field.value}
        onChange={(v) => rest.field.set(v ?? "")}
      >
        <VirtualSelectTrigger as={Button} variant="outline" />
        <VirtualSelectContent />
      </VirtualSelect>
      <Show when={rest.field.issue}>
        {(issue) => <TextFieldErrorMessage>{issue()}</TextFieldErrorMessage>}
      </Show>
    </TextFieldRoot>
  );
}
