import { Show } from "solid-js";
import type { FormField } from "~/lib/createForm";
import { TextArea } from "../ui/textarea";
import {
  type TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "../ui/textfield";

export function FormTextArea(
  props: Omit<Parameters<typeof TextFieldRoot>[0], "validationState"> & {
    field: FormField<string>;
    label: string;
    required?: boolean;
    type?: Parameters<typeof TextField>[0]["type"];
  },
) {
  return (
    <TextFieldRoot validationState={props.field.state}>
      <TextFieldLabel required={props.required}>{props.label}</TextFieldLabel>
      <TextArea
        required={props.required}
        value={props.field.value}
        onInput={(v) => props.field.set(v.currentTarget.value)}
        class="min-h-64"
      />
      <Show when={props.field.issue}>
        {(issue) => <TextFieldErrorMessage>{issue()}</TextFieldErrorMessage>}
      </Show>
    </TextFieldRoot>
  );
}
