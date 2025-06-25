import type {
  FieldPath,
  FieldPathValue,
  FieldProps,
  FieldType,
  FieldValues,
  FormStore,
  ResponseData,
} from "@modular-forms/solid";
import { type JSX, Show, splitProps } from "solid-js";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
} from "./textfield";

export function createFormTextField<
  TFieldValues extends FieldValues,
  TFieldName extends FieldPath<TFieldValues>,
  TResponseData extends ResponseData = undefined,
>(
  Field: (
    props: FieldProps<TFieldValues, TResponseData, TFieldName>,
  ) => JSX.Element,
) {
  return function FormText(
    props: {
      label?: string;
      type?: FieldType<FieldPathValue<TFieldValues, TFieldName>>;
      of?: FormStore<TFieldValues, TResponseData>;
      inputType?: string;
    } & Omit<
      FieldProps<TFieldValues, TResponseData, TFieldName>,
      "children" | "type" | "of"
    >,
  ) {
    const [local, rest] = splitProps(props, [
      "label",
      "type",
      "of",
      "inputType",
    ]);
    return Field({
      ...rest,
      type: local.type!,
      of: local.of!,
      children: (field, fieldProps) => (
        <TextFieldRoot>
          <Show when={local.label}>
            <TextFieldLabel>{local.label}</TextFieldLabel>
          </Show>
          <TextField {...fieldProps} />
          <Show when={field.error}>
            <TextFieldErrorMessage>{field.error}</TextFieldErrorMessage>
          </Show>
        </TextFieldRoot>
      ),
    });
  };
}
