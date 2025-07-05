import { Show } from "solid-js";
import type { FormField } from "~/lib/createForm";
import {
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot
} from "../ui/textfield";
import { TownSelect } from "../TownSelect";

export function FormTownSelect(
  props: Omit<Parameters<typeof TownSelect>[0], "validationState" | "onChange" | "value"> & {
    field:
    | FormField<string>
    | FormField<string | null>
    | FormField<string | undefined>
    | FormField<string | null | undefined>;
    label: string;
    required?: boolean;
  }
) {

  return (
    <TextFieldRoot
      validationState={props.field.state}
      class="flex flex-col gap-0"
    >
      <TextFieldLabel required={props.required}>{props.label}</TextFieldLabel>
      <TownSelect {...props} value={props.field.value}
        onChange={(v) => props.field.set(v ?? "")} />
      <Show when={props.field.issue}>
        {(issue) => <TextFieldErrorMessage>{issue()}</TextFieldErrorMessage>}
      </Show>
    </TextFieldRoot>
  );
}
