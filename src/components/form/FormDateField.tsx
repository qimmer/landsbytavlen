import { Show } from "solid-js";
import type { FormField } from "~/lib/createForm";
import { toDatetimeLocalString } from "~/lib/toDatetimeLocalString";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "../ui/textfield";

export function FormDateField(
  props: Omit<Parameters<typeof TextFieldRoot>[0], "validationState"> & {
    field: FormField<Date>;
    label: string;
    required?: boolean;
  },
) {
  return (
    <TextFieldRoot validationState={props.field.state}>
      <TextFieldLabel required={props.required}>{props.label}</TextFieldLabel>
      <TextField
        required={props.required}
        value={
          props.field.value ? toDatetimeLocalString(props.field.value) : ""
        }
        onInput={(v) => props.field.set(new Date(v.currentTarget.value))}
        type="datetime-local"
      />
      <Show when={props.field.issue}>
        {(issue) => <TextFieldErrorMessage>{issue()}</TextFieldErrorMessage>}
      </Show>
    </TextFieldRoot>
  );
}
