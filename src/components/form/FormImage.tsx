import { Show } from "solid-js";
import type { FormField } from "~/lib/createForm";
import { GalleryPicker, type ImagePickerProps } from "../Gallery";
import {
  type TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "../ui/textfield";

export function FormImage(
  props: Omit<Parameters<typeof TextFieldRoot>[0], "validationState"> & {
    label: string;
    required?: boolean;
    type?: Parameters<typeof TextField>[0]["type"];
    images: string[];
  } & Pick<ImagePickerProps, "onDelete" | "onUpload"> &
    (
      | {
          field: FormField<string> | FormField<string | null>;
          multiple?: never;
        }
      | {
          field: FormField<string[]>;
          multiple: true;
        }
    ),
) {
  return (
    <TextFieldRoot validationState={props.field.state}>
      <TextFieldLabel required={props.required}>{props.label}</TextFieldLabel>
      <Show
        when={props.multiple}
        fallback={
          <GalleryPicker
            value={!props.multiple ? (props.field.value ?? "") : ""}
            onChange={(v) => !props.multiple && props.field.set(v ?? "")}
            images={props.images}
            onUpload={props.onUpload}
            onDelete={props.onDelete}
          />
        }
      >
        <GalleryPicker
          multiple
          values={props.multiple && props.field.value}
          onChange={(v) => props.multiple && props.field.set(v)}
          images={props.images}
          onUpload={props.onUpload}
          onDelete={props.onDelete}
        />
      </Show>

      <Show when={props.field.issue}>
        {(issue) => <TextFieldErrorMessage>{issue()}</TextFieldErrorMessage>}
      </Show>
    </TextFieldRoot>
  );
}
