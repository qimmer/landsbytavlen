import { Show } from "solid-js";
import type { FormField } from "~/lib/createForm";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "../ui/textfield";

export function FormTextField(
  props: Omit<Parameters<typeof TextFieldRoot>[0], "validationState"> & {
    field:
      | FormField<string>
      | FormField<string | null>
      | FormField<string | undefined>
      | FormField<string | null | undefined>;
    label: string;
    required?: boolean;
    type?: Parameters<typeof TextField>[0]["type"];
  },
) {
  return (
    <TextFieldRoot validationState={props.field.state}>
      <TextFieldLabel required={props.required}>{props.label}</TextFieldLabel>
      <TextField
        required={props.required}
        value={props.field.value ?? ""}
        onInput={(v) => props.field.set(v.currentTarget.value)}
        type={props.type}
      />
      <Show when={props.field.issue}>
        {(issue) => <TextFieldErrorMessage>{issue()}</TextFieldErrorMessage>}
      </Show>
    </TextFieldRoot>
  );
}
